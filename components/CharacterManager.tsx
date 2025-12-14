import React, { useState } from 'react';
import { Character } from '../types';
import { Plus, Trash2, User, Upload } from 'lucide-react';

interface Props {
  characters: Character[];
  onAddCharacter: (c: Character) => void;
  onDeleteCharacter: (id: string) => void;
  selectedCharacterId?: string;
  onSelectCharacter: (id: string | undefined) => void;
}

export const CharacterManager: React.FC<Props> = ({
  characters,
  onAddCharacter,
  onDeleteCharacter,
  selectedCharacterId,
  onSelectCharacter,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [previewInfo, setPreviewInfo] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewInfo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = () => {
    if (newName && previewInfo) {
      const newChar: Character = {
        id: crypto.randomUUID(),
        name: newName,
        imageUrl: previewInfo,
      };
      onAddCharacter(newChar);
      setNewName('');
      setPreviewInfo(null);
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-400" />
          Kho Nhân Vật
        </h3>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Thêm mới
        </button>
      </div>

      {isCreating && (
        <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-600 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Tên nhân vật</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ví dụ: Chiến binh Robot"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Ảnh mẫu (Reference)</label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white transition">
                  <Upload className="w-4 h-4" />
                  <span>Tải ảnh lên</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
                {previewInfo && (
                  <img src={previewInfo} alt="Preview" className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500" />
                )}
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={!newName || !previewInfo}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-md font-medium transition"
            >
              Lưu Nhân Vật
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {characters.length === 0 && !isCreating && (
          <p className="text-gray-500 text-sm col-span-full text-center py-4">Chưa có nhân vật nào. Hãy tạo mới để sử dụng tính năng đồng nhất.</p>
        )}
        {characters.map((char) => (
          <div
            key={char.id}
            onClick={() => onSelectCharacter(selectedCharacterId === char.id ? undefined : char.id)}
            className={`relative group cursor-pointer border rounded-lg p-2 transition-all ${
              selectedCharacterId === char.id
                ? 'bg-indigo-900/30 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                : 'bg-gray-800 border-gray-700 hover:border-gray-500'
            }`}
          >
            <div className="aspect-square rounded-md overflow-hidden mb-2 bg-gray-900">
              <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" />
            </div>
            <p className="text-sm font-medium text-white truncate text-center">{char.name}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCharacter(char.id);
              }}
              className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            {selectedCharacterId === char.id && (
              <div className="absolute top-2 left-2 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-sm"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
