import { GoogleGenAI } from "@google/genai";
import { MODELS } from "../constants";
import { GeneratedVideo, Character } from "../types";

// Helper to create a delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class GeminiService {
  private getClient() {
    // Always create a new client to pick up the latest selected key
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async checkApiKey(): Promise<boolean> {
    const aistudio = (window as any).aistudio;
    if (aistudio && aistudio.hasSelectedApiKey) {
      return await aistudio.hasSelectedApiKey();
    }
    return false;
  }

  async openKeySelection() {
    const aistudio = (window as any).aistudio;
    if (aistudio && aistudio.openSelectKey) {
      await aistudio.openSelectKey();
    }
  }

  async generateVideo(
    videoJob: GeneratedVideo,
    character: Character | null,
    onProgress: (progress: number) => void
  ): Promise<string> {
    const ai = this.getClient();

    // Determine model based on features used
    // If using consistent character (reference image), must use VEO_PRO
    const model = character ? MODELS.VEO_PRO : MODELS.VEO_FAST;

    // Config setup
    const config: any = {
      numberOfVideos: 1,
      resolution: '720p', // Default for Veo preview
      aspectRatio: videoJob.aspectRatio,
    };

    // Add character reference if provided
    if (character) {
      // Remove data:image/png;base64, prefix if present for the API, 
      // but strictly verify how the API wants it. 
      // The API expects raw base64 data usually if passing as bytes.
      const base64Data = character.imageUrl.split(',')[1] || character.imageUrl;
      
      config.referenceImages = [
        {
          image: {
            imageBytes: base64Data,
            mimeType: 'image/png', // Assuming PNG for simplicity in this demo
          },
          referenceType: 'ASSET', // Use ASSET for character consistency
        },
      ];
    }

    try {
      console.log(`Starting generation with model: ${model}`);
      let operation = await ai.models.generateVideos({
        model: model,
        prompt: videoJob.prompt,
        config: config,
      });

      // Polling loop
      let attempts = 0;
      while (!operation.done) {
        attempts++;
        // Fake progress since the API doesn't provide % explicitly in the operation object easily
        // We estimate it takes about 60-90 seconds usually.
        const estimatedProgress = Math.min(95, attempts * 5);
        onProgress(estimatedProgress);

        await delay(5000); // Poll every 5 seconds
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      onProgress(100);

      const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!videoUri) {
        throw new Error("No video URI returned from API.");
      }

      return videoUri;
    } catch (error) {
      console.error("Gemini Video Generation Error:", error);
      throw error;
    }
  }

  // Helper to fetch the actual video blob url proxy
  async fetchVideoUrl(uri: string): Promise<string> {
    // We must append the API key to the download link
    const secureUrl = `${uri}&key=${process.env.API_KEY}`;
    return secureUrl;
  }
}

export const geminiService = new GeminiService();