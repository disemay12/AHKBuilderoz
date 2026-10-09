import { useState, useEffect } from 'react';
import { Monitor, Search, Copy, Check, Plus, Trash2 } from 'lucide-react';
import Tooltip from './Tooltip';

interface WindowDetectorProps {
  onInsertCode?: (code: string) => void;
}

interface WindowInfo {
  title: string;
  class?: string;
  process?: string;
}

export default function WindowDetector({ onInsertCode }: WindowDetectorProps) {
  const [manualInput, setManualInput] = useState('');
  const [savedWindows, setSavedWindows] = useState<WindowInfo[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ahk-saved-windows');
    if (saved) {
      setSavedWindows(JSON.parse(saved));
    }
  }, []);

  const saveWindows = (windows: WindowInfo[]) => {
    setSavedWindows(windows);
    localStorage.setItem('ahk-saved-windows', JSON.stringify(windows));
  };

  const addWindow = () => {
    if (!manualInput.trim()) return;
    
    const newWindow: WindowInfo = {
      title: manualInput.trim(),
    };
    
    const updated = [...savedWindows, newWindow];
    saveWindows(updated);
    setManualInput('');
  };

  const removeWindow = (index: number) => {
    const updated = savedWindows.filter((_, i) => i !== index);
    saveWindows(updated);
  };

  const generateWinActivateCode = (window: WindowInfo): string => {
    let code = `WinActivate, ${window.title}`;
    if (window.class) {
      code = `WinActivate, ahk_class ${window.class}`;
    }
    if (window.process) {
      code = `WinActivate, ahk_exe ${window.process}`;
    }
    return code;
  };

  const generateWinWaitCode = (window: WindowInfo): string => {
    return `WinWait, ${window.title}`;
  };

  const generateWinExistCode = (window: WindowInfo): string => {
    return `if WinExist("${window.title}")\n{\n    ; Окно существует\n}`;
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const insertCode = (code: string) => {
    if (onInsertCode) {
      onInsertCode(code);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700 bg-gray-800/50">
        <Monitor size={20} className="text-blue-400" />
        <h3 className="text-sm font-bold text-white">Детектор окон</h3>
        <div className="flex-1" />
        <span className="text-xs text-gray-400">
          Сохранено: {savedWindows.length} окон
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {/* Manual Input */}
        <div className="mb-4">
          <h4 className="text-sm font-bold text-gray-300 mb-2">Добавить окно вручную:</h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addWindow()}
              placeholder="Заголовок окна (например: Блокнот)"
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
            <Tooltip content="Добавить окно в список">
              <button
                onClick={addWindow}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm"
              >
                <Plus size={16} />
              </button>
            </Tooltip>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Подсказка: Откройте нужное окно, скопируйте его заголовок из диспетчера задач или используйте точное название
          </p>
        </div>

        {/* Saved Windows */}
        {savedWindows.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-bold text-gray-300 mb-2">Сохранённые окна:</h4>
            <div className="space-y-2">
              {savedWindows.map((window, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white mb-1">
                        {window.title}
                      </div>
                      {window.class && (
                        <div className="text-xs text-gray-400">
                          Класс: {window.class}
                        </div>
                      )}
                      {window.process && (
                        <div className="text-xs text-gray-400">
                          Процесс: {window.process}
                        </div>
                      )}
                    </div>
                    <Tooltip content="Удалить окно из списка">
                      <button
                        onClick={() => removeWindow(index)}
                        className="p-1 rounded hover:bg-red-900/50 text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </Tooltip>
                  </div>

                  {/* Generated Code */}
                  <div className="space-y-2 mt-3 pt-3 border-t border-gray-700">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">WinActivate (активировать):</div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs text-green-300 font-mono bg-black/30 px-2 py-1 rounded">
                          {generateWinActivateCode(window)}
                        </code>
                        <Tooltip content="Копировать код">
                          <button
                            onClick={() => copyCode(generateWinActivateCode(window))}
                            className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300"
                          >
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </Tooltip>
                        <Tooltip content="Вставить в редактор">
                          <button
                            onClick={() => insertCode(generateWinActivateCode(window))}
                            className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs"
                          >
                            Вставить
                          </button>
                        </Tooltip>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-400 mb-1">WinWait (ожидать):</div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs text-green-300 font-mono bg-black/30 px-2 py-1 rounded">
                          {generateWinWaitCode(window)}
                        </code>
                        <Tooltip content="Копировать код">
                          <button
                            onClick={() => copyCode(generateWinWaitCode(window))}
                            className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300"
                          >
                            <Copy size={12} />
                          </button>
                        </Tooltip>
                        <Tooltip content="Вставить в редактор">
                          <button
                            onClick={() => insertCode(generateWinWaitCode(window))}
                            className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs"
                          >
                            Вставить
                          </button>
                        </Tooltip>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-400 mb-1">WinExist (проверить существование):</div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs text-green-300 font-mono bg-black/30 px-2 py-1 rounded whitespace-pre">
                          {generateWinExistCode(window)}
                        </code>
                        <Tooltip content="Копировать код">
                          <button
                            onClick={() => copyCode(generateWinExistCode(window))}
                            className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300"
                          >
                            <Copy size={12} />
                          </button>
                        </Tooltip>
                        <Tooltip content="Вставить в редактор">
                          <button
                            onClick={() => insertCode(generateWinExistCode(window))}
                            className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs"
                          >
                            Вставить
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {savedWindows.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Search size={48} className="mx-auto mb-4 text-gray-500 opacity-30" />
              <p className="text-gray-400">Нет сохранённых окон</p>
              <p className="text-sm text-gray-500 mt-2">
                Добавьте заголовок окна выше для генерации кода
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
