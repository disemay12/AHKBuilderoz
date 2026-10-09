import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MacroBlock, BlockType, HotkeyContainer } from '../types/ahk';
import {
  blockDefinitions, blockCategories, generateFromContainers,
  gameTemplates, workTemplates, BlockDefinition
} from '../data/macroData';
import { parseHotkey, hotkeyToReadable } from '../utils/hotkeyParser';
import Tooltip from './Tooltip';
import {
  Plus, Trash2, ChevronUp, ChevronDown, Code, Copy, Check,
  FolderOpen, ChevronRight, ChevronDown as ChevronDownIcon,
  GripVertical, Search, Gamepad2, Briefcase,
  Keyboard, HelpCircle
} from 'lucide-react';

interface MacroBuilderProps {
  onCodeGenerated: (code: string) => void;
}

function createBlock(type: BlockType): MacroBlock {
  const def = blockDefinitions.find(b => b.type === type)!;
  return {
    id: uuidv4(),
    type,
    label: def.label,
    params: { ...def.defaultParams },
    children: def.canHaveChildren ? [] : undefined,
  };
}

export default function MacroBuilder({ onCodeGenerated }: MacroBuilderProps) {
  const [containers, setContainers] = useState<HotkeyContainer[]>([]);
  const [activeContainerId, setActiveContainerId] = useState<string | null>(null);
  const [showPalette, setShowPalette] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [searchBlock, setSearchBlock] = useState('');
  const [copied, setCopied] = useState(false);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [draggedBlock, setDraggedBlock] = useState<{ containerId: string; blockIndex: number } | null>(null);

  const activeContainer = containers.find(c => c.id === activeContainerId);

  // Добавление контейнера горячей клавиши
  const addContainer = (hotkeyInput: string = '', description: string = '') => {
    const hotkey = parseHotkey(hotkeyInput || 'F1');
    const container: HotkeyContainer = {
      id: uuidv4(),
      hotkey,
      description: description || hotkeyToReadable(hotkey),
      blocks: [],
      enabled: true,
    };
    setContainers([...containers, container]);
    setActiveContainerId(container.id);
  };

  // Обновление контейнера
  const updateContainer = (id: string, updates: Partial<HotkeyContainer>) => {
    setContainers(containers.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  // Удаление контейнера
  const removeContainer = (id: string) => {
    setContainers(containers.filter(c => c.id !== id));
    if (activeContainerId === id) {
      setActiveContainerId(containers.find(c => c.id !== id)?.id || null);
    }
  };

  // Добавление блока в активный контейнер
  const addBlockToActive = (type: BlockType) => {
    if (!activeContainer) return;
    const newBlock = createBlock(type);
    const updated = containers.map(c =>
      c.id === activeContainer.id
        ? { ...c, blocks: [...c.blocks, newBlock] }
        : c
    );
    setContainers(updated);
    setExpandedBlocks(new Set([...expandedBlocks, newBlock.id]));
  };

  // Удаление блока
  const removeBlock = (containerId: string, blockIndex: number) => {
    setContainers(containers.map(c => {
      if (c.id === containerId) {
        const blocks = [...c.blocks];
        blocks.splice(blockIndex, 1);
        return { ...c, blocks };
      }
      return c;
    }));
  };

  // Перемещение блока
  const moveBlock = (containerId: string, index: number, direction: 'up' | 'down') => {
    setContainers(containers.map(c => {
      if (c.id === containerId) {
        const blocks = [...c.blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= blocks.length) return c;
        [blocks[index], blocks[targetIndex]] = [blocks[targetIndex], blocks[index]];
        return { ...c, blocks };
      }
      return c;
    }));
  };

  // Дублирование блока
  const duplicateBlock = (containerId: string, blockIndex: number) => {
    setContainers(containers.map(c => {
      if (c.id === containerId) {
        const blocks = [...c.blocks];
        const original = blocks[blockIndex];
        const duplicate: MacroBlock = {
          ...JSON.parse(JSON.stringify(original)),
          id: uuidv4(),
        };
        blocks.splice(blockIndex + 1, 0, duplicate);
        return { ...c, blocks };
      }
      return c;
    }));
  };

  // Обновление параметра блока
  const updateBlockParam = (containerId: string, blockIndex: number, param: string, value: string) => {
    setContainers(containers.map(c => {
      if (c.id === containerId) {
        const blocks = [...c.blocks];
        blocks[blockIndex] = {
          ...blocks[blockIndex],
          params: { ...blocks[blockIndex].params, [param]: value },
        };
        return { ...c, blocks };
      }
      return c;
    }));
  };

  // Drag & Drop
  const handleDragStart = (containerId: string, blockIndex: number) => {
    setDraggedBlock({ containerId, blockIndex });
  };

  const handleDragOver = (e: React.DragEvent, containerId: string, targetIndex: number) => {
    e.preventDefault();
    if (!draggedBlock) return;
    if (draggedBlock.containerId !== containerId) return;

    const { blockIndex } = draggedBlock;
    if (blockIndex === targetIndex) return;

    setContainers(containers.map(c => {
      if (c.id === containerId) {
        const blocks = [...c.blocks];
        const [moved] = blocks.splice(blockIndex, 1);
        blocks.splice(targetIndex, 0, moved);
        return { ...c, blocks };
      }
      return c;
    }));
    setDraggedBlock({ containerId, blockIndex: targetIndex });
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
  };

  // Загрузка шаблона
  const loadTemplate = (template: any) => {
    const hotkey = parseHotkey(template.hotkey);
    const container: HotkeyContainer = {
      id: uuidv4(),
      hotkey,
      description: template.name,
      blocks: template.blocks.map((b: any) => ({
        ...b,
        id: uuidv4(),
        children: b.children?.map((c: any) => ({ ...c, id: uuidv4() })),
      })),
      enabled: true,
    };
    setContainers([...containers, container]);
    setActiveContainerId(container.id);
    setShowTemplates(false);
  };

  // Генерация кода
  const handleGenerate = () => {
    const code = generateFromContainers(containers);
    onCodeGenerated(code);
  };

  // Копирование
  const handleCopy = () => {
    const code = generateFromContainers(containers);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Фильтрация блоков
  const filteredBlocks = blockDefinitions.filter(b => {
    const matchesCategory = selectedCategory === 'Все' || b.category === selectedCategory;
    const matchesSearch = !searchBlock ||
      b.label.toLowerCase().includes(searchBlock.toLowerCase()) ||
      b.description.toLowerCase().includes(searchBlock.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Toggle expansion
  const toggleBlock = (blockId: string) => {
    const newSet = new Set(expandedBlocks);
    if (newSet.has(blockId)) newSet.delete(blockId);
    else newSet.add(blockId);
    setExpandedBlocks(newSet);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-700 bg-gray-800/50 flex-wrap">
        <Tooltip content="Показать/скрыть палитру блоков">
          <button
            onClick={() => setShowPalette(!showPalette)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              showPalette ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Plus size={14} className="inline mr-1" /> Блоки
          </button>
        </Tooltip>
        <Tooltip content="Готовые шаблоны для игр и работы">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              showTemplates ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <FolderOpen size={14} className="inline mr-1" /> Шаблоны
          </button>
        </Tooltip>
        <div className="flex-1" />
        <Tooltip content="Скопировать сгенерированный AHK код в буфер обмена">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            {copied ? <Check size={14} className="inline mr-1" /> : <Copy size={14} className="inline mr-1" />}
            {copied ? 'Скопировано!' : 'Копировать'}
          </button>
        </Tooltip>
        <Tooltip content="Сгенерировать AHK код и вставить в редактор">
          <button
            onClick={handleGenerate}
            disabled={containers.length === 0}
            className="px-3 py-1.5 rounded text-sm font-medium bg-green-600 text-white hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 transition-colors"
          >
            <Code size={14} className="inline mr-1" /> В редактор
          </button>
        </Tooltip>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Block Palette */}
        {showPalette && (
          <div className="w-72 border-r border-gray-700 flex flex-col bg-gray-800/30">
            <div className="p-3 border-b border-gray-700">
              <div className="relative mb-2">
                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={searchBlock}
                  onChange={(e) => setSearchBlock(e.target.value)}
                  placeholder="Поиск блока..."
                  className="w-full pl-7 pr-2 py-1.5 bg-gray-900 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSelectedCategory('Все')}
                  className={`px-2 py-0.5 rounded text-xs ${
                    selectedCategory === 'Все' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >Все</button>
                {blockCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded text-xs ${
                      selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                  >{cat}</button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredBlocks.map((block) => (
                <Tooltip key={block.type} content={block.description} position="right">
                  <button
                    onClick={() => addBlockToActive(block.type)}
                    disabled={!activeContainer}
                    className="w-full text-left px-2 py-1.5 rounded bg-gray-700/50 hover:bg-gray-600/50 disabled:opacity-40 disabled:cursor-not-allowed text-xs text-gray-200 transition-colors border border-transparent hover:border-gray-500 flex items-center gap-2"
                  >
                    <span>{block.icon}</span>
                    <span className="flex-1">{block.label}</span>
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
        )}

        {/* Templates */}
        {showTemplates && (
          <div className="w-72 border-r border-gray-700 p-3 overflow-y-auto bg-gray-800/30">
            <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
              <Gamepad2 size={14} /> Для игр
            </h3>
            <div className="space-y-2 mb-4">
              {gameTemplates.map((t, i) => (
                <Tooltip key={i} content={t.description} position="right">
                  <button
                    onClick={() => loadTemplate(t)}
                    className="w-full text-left px-3 py-2 rounded bg-purple-900/30 hover:bg-purple-800/40 text-sm border border-purple-700/30 hover:border-purple-600/50"
                  >
                    <div className="font-medium text-purple-200">{t.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{t.description}</div>
                  </button>
                </Tooltip>
              ))}
            </div>
            <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
              <Briefcase size={14} /> Для работы
            </h3>
            <div className="space-y-2">
              {workTemplates.map((t, i) => (
                <Tooltip key={i} content={t.description} position="right">
                  <button
                    onClick={() => loadTemplate(t)}
                    className="w-full text-left px-3 py-2 rounded bg-blue-900/30 hover:bg-blue-800/40 text-sm border border-blue-700/30 hover:border-blue-600/50"
                  >
                    <div className="font-medium text-blue-200">{t.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{t.description}</div>
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
        )}

        {/* Main Canvas */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Add Hotkey Container */}
          <HotkeyCreator onAdd={addContainer} />

          {/* Containers */}
          {containers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Keyboard size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">Создайте горячую клавишу для начала</p>
              <p className="text-sm mt-2">Введите комбинацию клавиш выше (например, "ctrl+alt+h")</p>
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {containers.map((container) => (
                <HotkeyContainerView
                  key={container.id}
                  container={container}
                  isActive={activeContainerId === container.id}
                  expandedBlocks={expandedBlocks}
                  onSelect={() => setActiveContainerId(container.id)}
                  onUpdate={(updates) => updateContainer(container.id, updates)}
                  onRemove={() => removeContainer(container.id)}
                  onRemoveBlock={(idx) => removeBlock(container.id, idx)}
                  onMoveBlock={(idx, dir) => moveBlock(container.id, idx, dir)}
                  onDuplicateBlock={(idx) => duplicateBlock(container.id, idx)}
                  onUpdateBlockParam={(idx, param, val) => updateBlockParam(container.id, idx, param, val)}
                  onToggleBlock={toggleBlock}
                  onDragStart={(idx) => handleDragStart(container.id, idx)}
                  onDragOver={(e, idx) => handleDragOver(e, container.id, idx)}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedBlock?.containerId === container.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Компонент создания горячей клавиши
function HotkeyCreator({ onAdd }: { onAdd: (hotkey: string, desc: string) => void }) {
  const [input, setInput] = useState('');
  const [description, setDescription] = useState('');
  const parsed = parseHotkey(input);

  return (
    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Keyboard size={18} className="text-blue-400" />
        <h3 className="text-sm font-bold text-white">Новая горячая клавиша</h3>
        <Tooltip content="Введите комбинацию клавиш на русском или английском. Примеры: ctrl+s, alt+f4, win+d, ctrl+shift+t, f1">
          <HelpCircle size={14} className="text-gray-400 cursor-help" />
        </Tooltip>
      </div>
      <div className="flex gap-2 items-end flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-gray-400 mb-1 block">Комбинация клавиш</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="например: ctrl+alt+h или f1"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && parsed) {
                onAdd(input, description);
                setInput('');
                setDescription('');
              }
            }}
          />
          {parsed && (
            <div className="mt-1 text-xs text-green-400">
              ✓ AHK формат: <code className="bg-black/50 px-1 rounded">{parsed}</code>
              {' '}({hotkeyToReadable(parsed)})
            </div>
          )}
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-gray-400 mb-1 block">Описание (необязательно)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="например: Открыть блокнот"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <Tooltip content="Создать контейнер горячей клавиши">
          <button
            onClick={() => {
              if (parsed) {
                onAdd(input, description);
                setInput('');
                setDescription('');
              }
            }}
            disabled={!parsed}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium transition-colors"
          >
            <Plus size={14} className="inline mr-1" /> Создать
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

// Компонент отображения контейнера горячей клавиши
interface ContainerViewProps {
  container: HotkeyContainer;
  isActive: boolean;
  expandedBlocks: Set<string>;
  onSelect: () => void;
  onUpdate: (updates: Partial<HotkeyContainer>) => void;
  onRemove: () => void;
  onRemoveBlock: (index: number) => void;
  onMoveBlock: (index: number, dir: 'up' | 'down') => void;
  onDuplicateBlock: (index: number) => void;
  onUpdateBlockParam: (index: number, param: string, value: string) => void;
  onToggleBlock: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

function HotkeyContainerView({
  container, isActive, expandedBlocks, onSelect, onUpdate, onRemove,
  onRemoveBlock, onMoveBlock, onDuplicateBlock, onUpdateBlockParam,
  onToggleBlock, onDragStart, onDragOver, onDragEnd, isDragging,
}: ContainerViewProps) {
  return (
    <div
      className={`rounded-lg border-2 transition-all ${
        isActive
          ? 'border-blue-500 bg-blue-900/10 shadow-lg shadow-blue-500/10'
          : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
      }`}
      onClick={onSelect}
    >
      {/* Container Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xl">🔑</span>
          <input
            type="text"
            value={container.hotkey}
            onChange={(e) => onUpdate({ hotkey: e.target.value })}
            className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm font-mono text-yellow-300 w-32 focus:border-blue-500 focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          />
          <input
            type="text"
            value={container.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Описание..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <Tooltip content={container.enabled ? 'Отключить горячую клавишу' : 'Включить горячую клавишу'}>
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate({ enabled: !container.enabled }); }}
            className={`px-2 py-1 rounded text-xs font-medium ${
              container.enabled ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-400'
            }`}
          >
            {container.enabled ? '✓ Активна' : '○ Выкл'}
          </button>
        </Tooltip>
        <Tooltip content="Удалить эту горячую клавишу">
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 hover:bg-red-900/50 text-red-400 rounded"
          >
            <Trash2 size={14} />
          </button>
        </Tooltip>
      </div>

      {/* Blocks */}
      <div className="p-3 min-h-[60px]">
        {container.blocks.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            Нажмите на блок в палитре слева, чтобы добавить его сюда
          </div>
        ) : (
          <div className="space-y-1.5">
            {container.blocks.map((block, index) => (
              <BlockItem
                key={block.id}
                block={block}
                index={index}
                isExpanded={expandedBlocks.has(block.id)}
                onRemove={() => onRemoveBlock(index)}
                onMoveUp={() => onMoveBlock(index, 'up')}
                onMoveDown={() => onMoveBlock(index, 'down')}
                onDuplicate={() => onDuplicateBlock(index)}
                onUpdateParam={(param, val) => onUpdateBlockParam(index, param, val)}
                onToggle={() => onToggleBlock(block.id)}
                onDragStart={() => onDragStart(index)}
                onDragOver={(e) => onDragOver(e, index)}
                onDragEnd={onDragEnd}
                isDragging={isDragging}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Компонент блока
interface BlockItemProps {
  block: MacroBlock;
  index: number;
  isExpanded: boolean;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onUpdateParam: (param: string, value: string) => void;
  onToggle: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

function BlockItem({
  block, index, isExpanded, onRemove, onMoveUp, onMoveDown,
  onDuplicate, onUpdateParam, onToggle, onDragStart, onDragOver, onDragEnd, isDragging,
}: BlockItemProps) {
  const def = blockDefinitions.find(b => b.type === block.type);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={`border rounded-lg transition-all ${
        isExpanded
          ? 'border-blue-500/50 bg-blue-900/10'
          : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <Tooltip content="Перетащите для изменения порядка">
          <div className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300">
            <GripVertical size={14} />
          </div>
        </Tooltip>
        
        <button onClick={onToggle} className="text-gray-400 hover:text-white">
          {isExpanded ? <ChevronDownIcon size={14} /> : <ChevronRight size={14} />}
        </button>

        <Tooltip content={def?.description || ''} position="top">
          <span className="text-sm font-medium text-white cursor-help flex items-center gap-1.5">
            <span>{def?.icon}</span>
            <span>{block.label}</span>
          </span>
        </Tooltip>

        {Object.keys(block.params).length > 0 && (
          <span className="text-xs text-gray-500 truncate flex-1">
            {Object.entries(block.params).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(', ')}
          </span>
        )}

        <div className="flex gap-0.5 ml-auto">
          <Tooltip content="Переместить выше">
            <button onClick={onMoveUp} className="p-1 hover:bg-gray-700 rounded text-gray-400">
              <ChevronUp size={12} />
            </button>
          </Tooltip>
          <Tooltip content="Переместить ниже">
            <button onClick={onMoveDown} className="p-1 hover:bg-gray-700 rounded text-gray-400">
              <ChevronDown size={12} />
            </button>
          </Tooltip>
          <Tooltip content="Дублировать блок">
            <button onClick={onDuplicate} className="p-1 hover:bg-gray-700 rounded text-gray-400">
              <Copy size={12} />
            </button>
          </Tooltip>
          <Tooltip content="Удалить блок">
            <button onClick={onRemove} className="p-1 hover:bg-red-900/50 text-red-400 rounded">
              <Trash2 size={12} />
            </button>
          </Tooltip>
        </div>
      </div>

      {isExpanded && def && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-700/50 space-y-2">
          {Object.entries(def.defaultParams).map(([key]) => (
            <div key={key} className="flex items-center gap-2">
              <Tooltip content={def.paramDescriptions[key] || key} position="left">
                <label className="text-xs text-gray-400 w-24 capitalize cursor-help">{key}:</label>
              </Tooltip>
              <input
                type="text"
                value={block.params[key] || ''}
                onChange={(e) => onUpdateParam(key, e.target.value)}
                className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
