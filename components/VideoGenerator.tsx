import React, { useState } from 'react';
import { GenerationConfig, AspectRatio, VideoTemplate, Character } from '../types';
import { TRANSITION_STYLES } from '../constants';
import { Wand2, Type, Layout, Copy, Save, Sliders, Layers, PlayCircle, Film } from 'lucide-react';

interface Props {
  onGenerate: (config: GenerationConfig) => void;
  templates: VideoTemplate[];
  onSaveTemplate: (template: VideoTemplate) => void;
  selectedCharacter?: Character;
  isGenerating: boolean;
}

export const VideoGenerator: React.FC<Props> = ({ 
  onGenerate, 
  templates, 
  onSaveTemplate, 
  selectedCharacter,
  isGenerating 
}) => {
  const [prompt, setPrompt] = useState('');
  const [script, setScript] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [watermark, setWatermark] = useState('');
  const [useConsistentChar, setUseConsistentChar] = useState(true);
  const [batchSize, setBatchSize] = useState(1);
  const [transition, setTransition] = useState(TRANSITION_STYLES[0]);
  const [showScript, setShowScript] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    // Enhance prompt with script and transition if provided
    let finalPrompt = prompt;
    if (script.trim()) {
        finalPrompt += `\n\nScript/Context: ${script}`;
    }
    if (transition !== 'None') {
        finalPrompt += `\n\nTransition style: ${transition}`;
    }

    onGenerate({
      prompt: finalPrompt,
      script,
      aspectRatio,
      characterId: selectedCharacter?.id,
      useConsistentCharacter: useConsistentChar,
      watermarkText: watermark,
      batchSize
    });
  };

  const handleSaveTemplate = () => {
    const name = prompt('Đặt tên cho mẫu video này:');
    if (name) {
      onSaveTemplate({
        id: crypto.randomUUID(),
        name,
        prompt,
        aspectRatio
      });
    }
  };

  const loadTemplate = (t: VideoTemplate) => {
    setPrompt(t.prompt);
    setAspectRatio(t.aspectRatio);
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Film className="w-6 h-6 text-indigo-400" />
          Thiết lập Video
        </h2>
        {templates.length > 0 && (
          <div className="relative group">
            <button className="text-sm bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-gray-600 transition">
              <Copy className="w-4 h-4" /> Mẫu Video
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden hidden group-hover:block z-20">
              {templates.map(t => (
                <button 
                  key={t.id}
                  onClick={() => loadTemplate(t)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Main Prompt Input */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2 flex justify-between">
            <span>Mô tả nội dung video</span>
            <button 
                onClick={() => setShowScript(!showScript)}
                className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1"
            >
                <Type className="w-3 h-3" />
                {showScript ? 'Ẩn kịch bản' : 'Thêm kịch bản chi tiết'}
            </button>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none min-h-[100px]"
            placeholder="Mô tả cảnh quay, ánh sáng, chuyển động camera..."
          />
        </div>

        {/* Script Input (Optional) */}
        {showScript && (
          <div className="animate-in fade-in slide-in-from-top-2">
             <label className="block text-gray-300 text-sm font-medium mb-2">
                Mô tả kịch bản / Lời thoại (Context)
             </label>
             <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                placeholder="Ví dụ: Hai nhân vật đang nói chuyện về tương lai..."
             />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Settings */}
          <div className="space-y-4">
             <div>
                <label className="block text-gray-400 text-xs uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                    <Layout className="w-3 h-3" /> Tỷ lệ khung hình
                </label>
                <div className="flex gap-2">
                    {['16:9', '9:16'].map((ratio) => (
                        <button
                            key={ratio}
                            onClick={() => setAspectRatio(ratio as AspectRatio)}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition border ${
                                aspectRatio === ratio
                                    ? 'bg-indigo-600 border-indigo-500 text-white'
                                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            {ratio}
                        </button>
                    ))}
                </div>
             </div>

             <div>
                <label className="block text-gray-400 text-xs uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                    <Sliders className="w-3 h-3" /> Hiệu ứng chuyển cảnh
                </label>
                <select 
                    value={transition}
                    onChange={(e) => setTransition(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                    {TRANSITION_STYLES.map(style => (
                        <option key={style} value={style}>{style}</option>
                    ))}
                </select>
             </div>
          </div>

          {/* Right Column: Advanced */}
          <div className="space-y-4">
             <div>
                <label className="block text-gray-400 text-xs uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                    <Layers className="w-3 h-3" /> Số lượng video (Batch)
                </label>
                <div className="flex items-center gap-3 bg-gray-700 p-2 rounded-lg border border-gray-600">
                    <input 
                        type="range" 
                        min="1" 
                        max="4" 
                        value={batchSize} 
                        onChange={(e) => setBatchSize(parseInt(e.target.value))}
                        className="flex-1 accent-indigo-500 cursor-pointer h-2 bg-gray-600 rounded-lg appearance-none"
                    />
                    <span className="text-white font-mono bg-gray-800 px-2 py-1 rounded text-sm w-8 text-center">{batchSize}</span>
                </div>
             </div>

             <div>
                <label className="block text-gray-400 text-xs uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                    <Type className="w-3 h-3" /> Watermark / Tên tác giả
                </label>
                <input
                    type="text"
                    value={watermark}
                    onChange={(e) => setWatermark(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Nhập tên hiển thị trên video..."
                />
             </div>
          </div>
        </div>
        
        {/* Character Consistency Toggle */}
        <div className="bg-indigo-900/20 border border-indigo-500/30 p-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedCharacter ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                    <Wand2 className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-sm font-medium text-white">Chế độ đồng nhất nhân vật</p>
                    <p className="text-xs text-gray-400">
                        {selectedCharacter 
                            ? `Đang dùng: ${selectedCharacter.name}` 
                            : 'Chưa chọn nhân vật (Chọn bên phải)'}
                    </p>
                </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={useConsistentChar}
                    onChange={(e) => setUseConsistentChar(e.target.checked)}
                    disabled={!selectedCharacter}
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]"
            >
                {isGenerating ? (
                    'Đang xử lý...'
                ) : (
                    <>
                       <PlayCircle className="w-5 h-5" />
                       Tạo {batchSize} Video
                    </>
                )}
            </button>
            <button
                onClick={handleSaveTemplate}
                disabled={!prompt}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                title="Lưu thành mẫu"
            >
                <Save className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};
