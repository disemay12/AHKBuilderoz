import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MacroBlock } from '../types/ahk';
import { defaultMacroBlocks, generateAHKCode, macroTemplates } from '../data/macroData';
import { Plus, Trash2, ChevronUp, ChevronDown, Code, Copy, Check, FolderOpen } from 'lucide-react';

interface MacroBuilderProps {
  onCodeGenerated: (code: string) => void;
}

export default function MacroBuilder({ onCodeGenerated }: MacroBuilderProps) {
  const [blocks, setBlocks] = useState<MacroBlock[]>([]);
  const [showPalette, setShowPalette] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const addBlock = (type: typeof defaultMacroBlocks[number]) => {
    const newBlock: MacroBlock = {
      id: uuidv4(),
      ...type,
      params: { ...type.params },
      children: type.children ? [] : undefined,
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const updateBlockParam = (id: string, param: string, value: string) => {
    setBlocks(blocks.map(b => {
      if (b.id === id) {
        return { ...b, params: { ...b.params, [param]: value } };
      }
      return b;
    }));
  };

  const loadTemplate = (template: typeof macroTemplates[number]) => {
    setBlocks(template.blocks.map(b => ({ ...b, id: uuidv4() })) as unknown as MacroBlock[]);
    setShowTemplates(false);
  };

  const handleGenerate = () => {
    const code = generateAHKCode(blocks);
    onCodeGenerated(code);
  };

  const handleCopy = () => {
    const code = generateAHKCode(blocks);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderBlock = (block: MacroBlock, index: number) => {
    const isSelected = selectedBlock === block.id;
    
    return (
      <div
        key={block.id}
        className={`border rounded-lg p-3 mb-2 transition-all cursor-pointer ${
          isSelected 
            ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20' 
            : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
        }`}
        onClick={() => setSelectedBlock(isSelected ? null : block.id)}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-sm">{block.label}</span>
          <div className="flex gap-1">
            <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up'); }} 
              className="p-1 hover:bg-gray-700 rounded" title="Вверх">
              <ChevronUp size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down'); }}
              className="p-1 hover:bg-gray-700 rounded" title="Вниз">
              <ChevronDown size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
              className="p-1 hover:bg-red-900/50 text-red-400 rounded" title="Удалить">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        
        {isSelected && (
          <div className="space-y-2 mt-2 pt-2 border-t border-gray-700">
            {Object.entries(block.params).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <label className="text-xs text-gray-400 w-20 capitalize">{key}:</label>
                <input
                  type="text"
                  value={val}
                  onChange={(e) => updateBlockParam(block.id, key, e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-700 bg-gray-800/50">
        <button
          onClick={() => setShowPalette(!showPalette)}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            showPalette ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Plus size={14} className="inline mr-1" /> Блоки
        </button>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            showTemplates ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <FolderOpen size={14} className="inline mr-1" /> Шаблоны
        </button>
        <div className="flex-1" />
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
        >
          {copied ? <Check size={14} className="inline mr-1" /> : <Copy size={14} className="inline mr-1" />}
          {copied ? 'Скопировано!' : 'Копировать'}
        </button>
        <button
          onClick={handleGenerate}
          className="px-3 py-1.5 rounded text-sm font-medium bg-green-600 text-white hover:bg-green-500 transition-colors"
        >
          <Code size={14} className="inline mr-1" /> Генерировать код
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Block Palette */}
        {showPalette && (
          <div className="w-64 border-r border-gray-700 p-3 overflow-y-auto bg-gray-800/30">
            <h3 className="text-sm font-bold text-gray-300 mb-3">Добавить блок:</h3>
            <div className="space-y-1.5">
              {defaultMacroBlocks.map((block, i) => (
                <button
                  key={i}
                  onClick={() => addBlock(block)}
                  className="w-full text-left px-3 py-2 rounded bg-gray-700/50 hover:bg-gray-600/50 text-sm text-gray-200 transition-colors border border-transparent hover:border-gray-500"
                >
                  {block.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Templates */}
        {showTemplates && (
          <div className="w-72 border-r border-gray-700 p-3 overflow-y-auto bg-gray-800/30">
            <h3 className="text-sm font-bold text-gray-300 mb-3">Шаблоны макросов:</h3>
            <div className="space-y-2">
              {macroTemplates.map((template, i) => (
                <button
                  key={i}
                  onClick={() => loadTemplate(template)}
                  className="w-full text-left px-3 py-3 rounded bg-purple-900/30 hover:bg-purple-800/40 text-sm transition-colors border border-purple-700/30 hover:border-purple-600/50"
                >
                  <div className="font-medium text-purple-200">{template.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{template.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 p-4 overflow-y-auto">
          {blocks.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-4">🧩</div>
                <p className="text-lg">Добавьте блоки для создания макроса</p>
                <p className="text-sm mt-2">Используйте панель блоков слева или выберите шаблон</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xs text-gray-500 mb-2">
                Блоков: {blocks.length} | Нажмите на блок для редактирования
              </div>
              {blocks.map((block, index) => renderBlock(block, index))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
