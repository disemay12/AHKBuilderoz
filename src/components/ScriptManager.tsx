import { useState, useEffect } from 'react';
import { AHKScript } from '../types/ahk';
import { v4 as uuidv4 } from 'uuid';
import { FileText, Plus, Trash2, Download, Upload, Edit2, Save, X } from 'lucide-react';
import Tooltip from './Tooltip';

interface ScriptManagerProps {
  currentScript: AHKScript | null;
  onSelectScript: (script: AHKScript) => void;
  onUpdateScript: (script: AHKScript) => void;
}

export default function ScriptManager({ currentScript, onSelectScript, onUpdateScript }: ScriptManagerProps) {
  const [scripts, setScripts] = useState<AHKScript[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('ahk-scripts');
    if (saved) {
      setScripts(JSON.parse(saved));
    }
  }, []);

  const saveScripts = (updated: AHKScript[]) => {
    setScripts(updated);
    localStorage.setItem('ahk-scripts', JSON.stringify(updated));
  };

  const createScript = () => {
    if (!newName.trim()) return;
    const script: AHKScript = {
      id: uuidv4(),
      name: newName.trim(),
      description: newDesc.trim(),
      code: `; ${newName.trim()}\n; Создано в AHK Script Editor\n\n`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...scripts, script];
    saveScripts(updated);
    onSelectScript(script);
    setIsCreating(false);
    setNewName('');
    setNewDesc('');
  };

  const deleteScript = (id: string) => {
    if (!confirm('Удалить этот скрипт?')) return;
    const updated = scripts.filter(s => s.id !== id);
    saveScripts(updated);
    if (currentScript?.id === id) {
      onSelectScript(updated[0] || null);
    }
  };

  const exportScript = (script: AHKScript) => {
    const blob = new Blob([script.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.name}.ahk`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAllScripts = () => {
    scripts.forEach(script => exportScript(script));
  };

  const importScript = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ahk,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const code = ev.target?.result as string;
        const script: AHKScript = {
          id: uuidv4(),
          name: file.name.replace(/\.(ahk|txt)$/, ''),
          code,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const updated = [...scripts, script];
        saveScripts(updated);
        onSelectScript(script);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center justify-between mb-2">
          <Tooltip content="Все ваши сохранённые AHK скрипты" position="bottom">
            <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2 cursor-help">
              <FileText size={16} className="text-blue-400" />
              Мои скрипты
            </h3>
          </Tooltip>
          <div className="flex gap-1">
            <Tooltip content="Импортировать .ahk файл в список скриптов" position="bottom">
              <button
                onClick={importScript}
                className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                title="Импорт"
              >
                <Upload size={14} />
              </button>
            </Tooltip>
            {scripts.length > 0 && (
              <Tooltip content="Экспортировать все скрипты в .ahk файлы" position="bottom">
                <button
                  onClick={exportAllScripts}
                  className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                  title="Экспорт всех"
                >
                  <Download size={14} />
                </button>
              </Tooltip>
            )}
          </div>
        </div>
        <Tooltip content="Создать новый пустой AHK скрипт" position="bottom">
          <button
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            <Plus size={14} />
            Новый скрипт
          </button>
        </Tooltip>
      </div>

      {/* Create form */}
      {isCreating && (
        <div className="p-3 border-b border-gray-700 bg-gray-900/50">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Имя скрипта..."
            className="w-full px-3 py-1.5 bg-gray-800 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none mb-2"
            autoFocus
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Описание (необязательно)..."
            className="w-full px-3 py-1.5 bg-gray-800 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={createScript}
              className="flex-1 px-3 py-1.5 rounded bg-green-600 hover:bg-green-500 text-white text-sm transition-colors"
            >
              <Save size={12} className="inline mr-1" /> Создать
            </button>
            <button
              onClick={() => { setIsCreating(false); setNewName(''); setNewDesc(''); }}
              className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Script list */}
      <div className="flex-1 overflow-y-auto p-2">
        {scripts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Нет сохранённых скриптов</p>
            <p className="text-xs mt-1">Создайте новый или импортируйте .ahk файл</p>
          </div>
        ) : (
          <div className="space-y-1">
            {scripts.map(script => (
              <div
                key={script.id}
                className={`group px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  currentScript?.id === script.id
                    ? 'bg-blue-900/40 border border-blue-600/50'
                    : 'hover:bg-gray-700/50 border border-transparent'
                }`}
                onClick={() => onSelectScript(script)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate flex items-center gap-1.5">
                      <Edit2 size={12} className="text-gray-500" />
                      {script.name}
                    </div>
                    {script.description && (
                      <div className="text-xs text-gray-500 truncate mt-0.5">{script.description}</div>
                    )}
                    <div className="text-xs text-gray-600 mt-0.5">
                      {new Date(script.updatedAt).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip content="Экспортировать этот скрипт в .ahk файл" position="top">
                      <button
                        onClick={(e) => { e.stopPropagation(); exportScript(script); }}
                        className="p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-white"
                        title="Экспорт"
                      >
                        <Download size={12} />
                      </button>
                    </Tooltip>
                    <Tooltip content="Удалить этот скрипт навсегда" position="top">
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteScript(script.id); }}
                        className="p-1 rounded hover:bg-red-900/50 text-gray-400 hover:text-red-400"
                        title="Удалить"
                      >
                        <Trash2 size={12} />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
