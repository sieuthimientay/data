import React, { useEffect, useState } from 'react';
import { GeneratedVideo } from '../types';
import { Download, Film, Loader2, AlertCircle, Clock } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface Props {
  videos: GeneratedVideo[];
}

export const VideoList: React.FC<Props> = ({ videos }) => {
  if (videos.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 border-2 border-dashed border-gray-700 rounded-xl bg-gray-800/20">
        <Film className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg">Chưa có video nào được tạo.</p>
        <p className="text-sm">Hãy nhập nội dung và nhấn "Tạo Video" để bắt đầu.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <VideoItem key={video.id} video={video} />
      ))}
    </div>
  );
};

const VideoItem: React.FC<{ video: GeneratedVideo }> = ({ video }) => {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUrl = async () => {
      if (video.status === 'completed' && video.uri) {
        try {
          const url = await geminiService.fetchVideoUrl(video.uri);
          setDownloadUrl(url);
        } catch (e) {
          console.error("Failed to sign URL", e);
        }
      }
    };
    fetchUrl();
  }, [video.status, video.uri]);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg flex flex-col group">
      {/* Video Preview Area */}
      <div className={`relative bg-gray-900 ${video.aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'}`}>
        {video.status === 'completed' && downloadUrl ? (
          <div className="relative w-full h-full">
            <video
              src={downloadUrl}
              controls
              className="w-full h-full object-cover"
              loop
            />
            {/* Watermark Overlay */}
            {video.watermarkText && (
              <div className="absolute bottom-4 right-4 pointer-events-none select-none opacity-60">
                 <p className="text-white font-bold text-sm tracking-widest drop-shadow-md bg-black/30 px-2 py-1 rounded">
                   {video.watermarkText}
                 </p>
              </div>
            )}
            <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                ~8s
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
             {video.status === 'generating' || video.status === 'pending' ? (
               <>
                 <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
                 <p className="text-indigo-300 font-medium">Đang khởi tạo...</p>
                 <div className="w-full bg-gray-700 h-2 rounded-full mt-4 overflow-hidden max-w-[150px]">
                   <div 
                      className="bg-indigo-500 h-full transition-all duration-300" 
                      style={{ width: `${video.progress}%` }}
                    />
                 </div>
                 <p className="text-xs text-gray-500 mt-2">{video.progress}% - Ước tính 1-2 phút</p>
               </>
             ) : (
               <>
                 <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
                 <p className="text-red-400 text-sm">Tạo thất bại</p>
                 <p className="text-xs text-gray-500 mt-1">{video.error}</p>
               </>
             )}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                video.status === 'completed' ? 'border-green-800 text-green-400 bg-green-900/20' :
                video.status === 'failed' ? 'border-red-800 text-red-400 bg-red-900/20' :
                'border-indigo-800 text-indigo-400 bg-indigo-900/20'
            }`}>
                {video.status === 'completed' ? 'Hoàn thành' : video.status === 'failed' ? 'Lỗi' : 'Đang xử lý'}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(video.createdAt).toLocaleTimeString()}
            </span>
        </div>
        
        <p className="text-gray-300 text-sm line-clamp-2 mb-4 flex-1" title={video.prompt}>
          {video.prompt}
        </p>

        {video.status === 'completed' && downloadUrl && (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-medium transition"
          >
            <Download className="w-4 h-4" />
            Tải xuống MP4
          </a>
        )}
      </div>
    </div>
  );
};
