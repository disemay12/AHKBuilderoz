import { useState, useEffect } from 'react';
import { History, RotateCcw, Trash2, Eye } from 'lucide-react';
import Tooltip from './Tooltip';

interface Version {
  id: string;
  code: string;
  timestamp: number;
  description?: string;
}

interface VersionHistoryProps {
  currentCode: string;
  onRestore: (code: string) => void;
}

export default function VersionHistory({ currentCode, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ahk-version-history');
    if (saved) {
      setVersions(JSON.parse(saved));
    }
  }, []);

  const saveVersion = (description?: string) => {
    const newVersion: Version = {
      id: Date.now().toString(),
      code: currentCode,
      timestamp: Date.now(),
      description: description || `Версия от ${new Date().toLocaleString('ru-RU')}`,
    };

    const updated = [newVersion, ...versions].slice(0, 20); // Храним максимум 20 версий
    setVersions(updated);
    localStorage.setItem('ahk-version-history', JSON.stringify(updated));
  };

  const restoreVersion = (version: Version) => {
    if (confirm('Восстановить эту версию? Текущий код будет заменён.')) {
      onRestore(version.code);
      setIsOpen(false);
    }
  };

  const deleteVersion = (id: string) => {
    const updated = versions.filter(v => v.id !== id);
    setVersions(updated);
    localStorage.setItem('ahk-version-history', JSON.stringify(updated));
  };

  const clearHistory = () => {
    if (confirm('Очистить всю историю версий?')) {
      setVersions([]);
      localStorage.removeItem('ahk-version-history');
    }
  };

  if (!isOpen) {
    return (
      <div className="flex gap-2">
        <Tooltip content="Сохранить текущую версию">
          <button
            onClick={() => saveVersion()}
            className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <History size={16} />
          </button>
        </Tooltip>
        <Tooltip content="Показать историю версий">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <RotateCcw size={16} />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div
        className="w-full max-w-4xl h-[80vh] bg-gray-800 border border-gray-700 rounded-lg shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <History size={20} className="text-blue-400" />
            <h2 className="text-lg font-bold text-white">История версий</h2>
            <span className="text-sm text-gray-400">({versions.length} версий)</span>
          </div>
          <div className="flex gap-2">
            <Tooltip content="Сохранить текущую версию">
              <button
                onClick={() => saveVersion()}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium flex items-center gap-1"
              >
                <RotateCcw size={14} />
                Сохранить версию
              </button>
            </Tooltip>
            <Tooltip content="Очистить всю историю">
              <button
                onClick={clearHistory}
                className="p-2 rounded hover:bg-red-900/50 text-red-400"
              >
                <Trash2 size={16} />
              </button>
            </Tooltip>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Versions List */}
          <div className="w-80 border-r border-gray-700 overflow-y-auto">
            {versions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <History size={32} className="mx-auto mb-2 opacity-30" />
                <p>Нет сохранённых версий</p>
                <p className="text-xs mt-1">Нажмите "Сохранить версию" для создания</p>
              </div>
            ) : (
              <div className="p-2">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className={`p-3 rounded mb-2 cursor-pointer transition-colors ${
                      selectedVersion?.id === version.id
                        ? 'bg-blue-900/30 border border-blue-600/50'
                        : 'hover:bg-gray-700/50 border border-transparent'
                    }`}
                    onClick={() => setSelectedVersion(version)}
                  >
                    <div className="text-sm font-medium text-white mb-1">
                      {version.description}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(version.timestamp).toLocaleString('ru-RU')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {version.code.split('\n').length} строк
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedVersion ? (
              <>
                <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800/50">
                  <div className="text-sm text-gray-300">
                    <Eye size={14} className="inline mr-1" />
                    Предпросмотр: {selectedVersion.description}
                  </div>
                  <div className="flex gap-2">
                    <Tooltip content="Восстановить эту версию">
                      <button
                        onClick={() => restoreVersion(selectedVersion)}
                        className="px-3 py-1.5 rounded bg-green-600 hover:bg-green-500 text-white text-sm font-medium"
                      >
                        <RotateCcw size={14} className="inline mr-1" />
                        Восстановить
                      </button>
                    </Tooltip>
                    <Tooltip content="Удалить эту версию">
                      <button
                        onClick={() => {
                          deleteVersion(selectedVersion.id);
                          setSelectedVersion(null);
                        }}
                        className="p-2 rounded hover:bg-red-900/50 text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </Tooltip>
                  </div>
                </div>
                <pre className="flex-1 overflow-auto p-4 bg-gray-900 text-sm text-gray-200 font-mono">
                  <code>{selectedVersion.code}</code>
                </pre>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Eye size={32} className="mx-auto mb-2 opacity-30" />
                  <p>Выберите версию для предпросмотра</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
