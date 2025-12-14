import React, { useState, useEffect } from 'react';
import { VideoGenerator } from './components/VideoGenerator';
import { CharacterManager } from './components/CharacterManager';
import { VideoList } from './components/VideoList';
import { GeneratedVideo, Character, GenerationConfig, VideoTemplate } from './types';
import { geminiService } from './services/geminiService';
import { Clapperboard, Sparkles, Key, AlertTriangle } from 'lucide-react';

export default function App() {
  const [apiKeySet, setApiKeySet] = useState(false);
  const [loadingKey, setLoadingKey] = useState(true);
  
  // App State
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | undefined>(undefined);
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [templates, setTemplates] = useState<VideoTemplate[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Notification/Error State
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    try {
      setLoadingKey(true);
      const hasKey = await geminiService.checkApiKey();
      setApiKeySet(hasKey);
    } catch (e) {
      console.error("Error checking API key", e);
    } finally {
      setLoadingKey(false);
    }
  };

  const handleSelectKey = async () => {
    try {
      await geminiService.openKeySelection();
      // Assume success after closing dialog as per guidance, but safer to re-check slightly later or rely on user action
      // For immediate feedback:
      setApiKeySet(true); 
    } catch (e) {
      setError("Không thể mở hộp thoại chọn API Key.");
    }
  };

  const handleGenerate = async (config: GenerationConfig) => {
    if (!apiKeySet) return;

    setError(null);
    setIsGenerating(true);

    const char = config.useConsistentCharacter && config.characterId 
      ? characters.find(c => c.id === config.characterId) || null
      : null;

    // Create placeholder jobs
    const newJobs: GeneratedVideo[] = Array.from({ length: config.batchSize }).map(() => ({
      id: crypto.randomUUID(),
      uri: '',
      prompt: config.prompt,
      status: 'pending',
      progress: 0,
      createdAt: Date.now(),
      aspectRatio: config.aspectRatio,
      watermarkText: config.watermarkText,
      characterId: char?.id
    }));

    setVideos(prev => [...newJobs, ...prev]);

    try {
      // Execute sequentially or parallel. Veo has limits, so parallel might hit rate limits.
      // We'll try parallel for "Simultaneous" feel but handle errors.
      const promises = newJobs.map(async (job) => {
         try {
            // Update status to generating
            setVideos(prev => prev.map(v => v.id === job.id ? { ...v, status: 'generating' } : v));
            
            const uri = await geminiService.generateVideo(
                job, 
                char, 
                (progress) => {
                    setVideos(prev => prev.map(v => v.id === job.id ? { ...v, progress } : v));
                }
            );

            // Success
            setVideos(prev => prev.map(v => v.id === job.id ? { 
                ...v, 
                status: 'completed', 
                uri, 
                progress: 100 
            } : v));

         } catch (err: any) {
             const errMsg = err.message || "Unknown error";
             if (errMsg.includes("Requested entity was not found")) {
                 // Key issue
                 setApiKeySet(false);
                 setError("API Key không hợp lệ hoặc đã hết hạn. Vui lòng chọn lại.");
             }
             setVideos(prev => prev.map(v => v.id === job.id ? { 
                 ...v, 
                 status: 'failed', 
                 error: errMsg 
            } : v));
         }
      });

      await Promise.all(promises);

    } catch (e) {
        console.error("Batch generation failed", e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loadingKey) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Đang tải...</div>;
  }

  if (!apiKeySet) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full text-center border border-gray-700 shadow-2xl">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Yêu cầu API Key</h1>
          <p className="text-gray-400 mb-6">
            Để sử dụng tính năng tạo video chất lượng cao (Veo), bạn cần kết nối với Google Cloud Project có tính phí.
          </p>
          <button 
            onClick={handleSelectKey}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105"
          >
            Chọn API Key
          </button>
          <div className="mt-4 text-xs text-gray-500">
             <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-indigo-400">
                Tìm hiểu thêm về thanh toán
             </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Clapperboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Veo Studio Pro
            </span>
          </div>
          
          <div className="flex items-center gap-4">
             {error && (
                 <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 px-3 py-1 rounded-full border border-red-900">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                 </div>
             )}
             <button 
                onClick={handleSelectKey}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1 border border-gray-700 rounded px-2 py-1"
             >
                <Key className="w-3 h-3" /> API Key
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar: Controls */}
          <div className="lg:col-span-4 space-y-8">
             {/* Character Manager */}
             <CharacterManager 
                characters={characters}
                onAddCharacter={(c) => setCharacters([...characters, c])}
                onDeleteCharacter={(id) => setCharacters(characters.filter(c => c.id !== id))}
                selectedCharacterId={selectedCharacterId}
                onSelectCharacter={setSelectedCharacterId}
             />

             {/* Generator Form */}
             <VideoGenerator 
                onGenerate={handleGenerate}
                templates={templates}
                onSaveTemplate={(t) => setTemplates([...templates, t])}
                selectedCharacter={characters.find(c => c.id === selectedCharacterId)}
                isGenerating={isGenerating}
             />
          </div>

          {/* Right Content: Gallery */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                    Video Đã Tạo
                </h2>
                <div className="text-sm text-gray-400">
                    {videos.length} video
                </div>
            </div>
            
            <VideoList videos={videos} />
          </div>

        </div>
      </main>
    </div>
  );
}
