export interface Character {
  id: string;
  name: string;
  imageUrl: string; // Base64
}

export interface VideoTemplate {
  id: string;
  name: string;
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  negativePrompt?: string;
}

export interface GeneratedVideo {
  id: string;
  uri: string; // The download link from API
  prompt: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number; // 0-100
  createdAt: number;
  aspectRatio: '16:9' | '9:16';
  watermarkText?: string;
  characterId?: string;
  error?: string;
}

export type AspectRatio = '16:9' | '9:16';

export interface GenerationConfig {
  prompt: string;
  script?: string;
  aspectRatio: AspectRatio;
  characterId?: string;
  useConsistentCharacter: boolean;
  watermarkText: string;
  batchSize: number; // Number of videos to generate simultaneously
}
