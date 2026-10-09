import { useState, useCallback, useEffect } from 'react';
import { AHKScript } from './types/ahk';
import CodeEditor from './components/CodeEditor';
import MacroBuilder from './components/MacroBuilder';
import Documentation from './components/Documentation';
import Learning from './components/Learning';
import ScriptManager from './components/ScriptManager';
import OutputPanel from './components/OutputPanel';
import Simulator from './components/Simulator';
import AIGenerator from './components/AIGenerator';
import AIChat from './components/AIChat';
import InteractiveTutorials from './components/InteractiveTutorials';
import CoordinateHelper from './components/CoordinateHelper';
import PixelTester from './components/PixelTester';
import CommandPalette from './components/CommandPalette';
import ThemeSwitcher from './components/ThemeSwitcher';
import VersionHistory from './components/VersionHistory';
import Tooltip from './components/Tooltip';
import {
  Code2,
  Blocks,
  BookOpen,
  GraduationCap,
  FolderOpen,
  Save,
  Download,
  Upload,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  Terminal,
  Play,
  Sparkles,
  MessageCircle,
  Award,
  MousePointer2,
  Palette,
} from 'lucide-react';

type Tab = 'editor' | 'macros' | 'docs' | 'learn' | 'chat' | 'tutorials';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('editor');
  const [currentScript, setCurrentScript] = useState<AHKScript | null>(null);
  const [code, setCode] = useState<string>('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'scripts' | 'info'>('scripts');
  const [saved, setSaved] = useState(true);
  const [showOutput, setShowOutput] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showTextToMacro, setShowTextToMacro] = useState(false);
  const [showCoordinateHelper, setShowCoordinateHelper] = useState(false);
  const [showPixelTester, setShowPixelTester] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Load last script
  useEffect(() => {
    const lastScriptId = localStorage.getItem('ahk-last-script');
    const scripts = localStorage.getItem('ahk-scripts');
    if (lastScriptId && scripts) {
      const parsed = JSON.parse(scripts) as AHKScript[];
      const found = parsed.find(s => s.id === lastScriptId);
      if (found) {
        setCurrentScript(found);
        setCode(found.code);
      }
    }
    if (!currentScript && (!scripts || JSON.parse(scripts).length === 0)) {
      // Create a default script
      const defaultCode = `; Добро пожаловать в AHK Script Editor!
; Это ваш первый скрипт AutoHotkey

; Нажмите Ctrl+Alt+H для показа приветствия
^!h::
    MsgBox, Привет! Это ваш первый AHK скрипт!
    return

; F1 показывает справку
F1::
    Run, https://www.autohotkey.com/docs/
    return
`;
      setCode(defaultCode);
    }
  }, []);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    setSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    if (!currentScript) return;
    const updated = { ...currentScript, code, updatedAt: new Date().toISOString() };
    setCurrentScript(updated);
    localStorage.setItem('ahk-last-script', updated.id);
    
    const scripts = localStorage.getItem('ahk-scripts');
    const parsed = scripts ? JSON.parse(scripts) as AHKScript[] : [];
    const idx = parsed.findIndex(s => s.id === updated.id);
    if (idx >= 0) {
      parsed[idx] = updated;
    } else {
      parsed.push(updated);
    }
    localStorage.setItem('ahk-scripts', JSON.stringify(parsed));
    setSaved(true);
  }, [currentScript, code]);

  const handleSelectScript = useCallback((script: AHKScript | null) => {
    setCurrentScript(script);
    if (script) {
      setCode(script.code);
      localStorage.setItem('ahk-last-script', script.id);
    }
    setSaved(true);
  }, []);

  const handleUpdateScript = useCallback((script: AHKScript) => {
    setCurrentScript(script);
    setCode(script.code);
  }, []);

  const handleCodeGenerated = useCallback((generatedCode: string) => {
    setCode(prev => prev + '\n' + generatedCode);
    setActiveTab('editor');
    setSaved(false);
  }, []);

  const handleInsertExample = useCallback((exampleCode: string) => {
    setCode(prev => prev + '\n\n' + exampleCode);
    setActiveTab('editor');
    setSaved(false);
  }, []);

  const handleInsertCode = useCallback((lessonCode: string) => {
    setCode(prev => prev + '\n\n; --- Пример из урока ---\n' + lessonCode);
    setActiveTab('editor');
    setSaved(false);
  }, []);

  const handleExport = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentScript ? `${currentScript.name}.ahk` : 'script.ahk';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ahk,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const importedCode = ev.target?.result as string;
        setCode(importedCode);
        setSaved(false);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Save: Ctrl+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Command Palette: Ctrl+Shift+P
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      // Toggle Sidebar: Ctrl+B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setShowSidebar(!showSidebar);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave, showSidebar]);

  // Command palette commands
  const commands = [
    {
      id: 'save',
      label: 'Сохранить скрипт',
      description: 'Сохранить текущий скрипт (Ctrl+S)',
      icon: '💾',
      shortcut: 'Ctrl+S',
      action: handleSave,
    },
    {
      id: 'export',
      label: 'Экспорт в .ahk файл',
      description: 'Скачать скрипт как файл AutoHotkey',
      icon: '📥',
      action: handleExport,
    },
    {
      id: 'import',
      label: 'Импорт .ahk файла',
      description: 'Загрузить скрипт из файла',
      icon: '📤',
      action: handleImport,
    },
    {
      id: 'toggle-sidebar',
      label: 'Показать/скрыть боковую панель',
      description: 'Переключить видимость боковой панели',
      icon: '📋',
      shortcut: 'Ctrl+B',
      action: () => setShowSidebar(!showSidebar),
    },
    {
      id: 'toggle-output',
      label: 'Показать/скрыть панель анализа',
      description: 'Переключить видимость панели анализа кода',
      icon: '🔍',
      action: () => setShowOutput(!showOutput),
    },
    {
      id: 'toggle-simulator',
      label: 'Показать/скрыть симулятор',
      description: 'Переключить видимость симулятора выполнения',
      icon: '▶️',
      action: () => setShowSimulator(!showSimulator),
    },
    {
      id: 'toggle-ai',
      label: 'Показать/скрыть ИИ-генератор',
      description: 'Переключить видимость ИИ-генератора макросов',
      icon: '✨',
      action: () => setShowTextToMacro(!showTextToMacro),
    },
    {
      id: 'tab-editor',
      label: 'Переключиться на редактор',
      description: 'Открыть вкладку редактора кода',
      icon: '📝',
      action: () => setActiveTab('editor'),
    },
    {
      id: 'tab-macros',
      label: 'Переключиться на макросы',
      description: 'Открыть вкладку визуального конструктора макросов',
      icon: '🧩',
      action: () => setActiveTab('macros'),
    },
    {
      id: 'tab-docs',
      label: 'Переключиться на документацию',
      description: 'Открыть вкладку документации AHK',
      icon: '📚',
      action: () => setActiveTab('docs'),
    },
    {
      id: 'tab-learn',
      label: 'Переключиться на обучение',
      description: 'Открыть вкладку обучающих уроков',
      icon: '🎓',
      action: () => setActiveTab('learn'),
    },
    {
      id: 'tab-chat',
      label: 'Переключиться на ИИ чат',
      description: 'Открыть чат с ИИ-помощником по AHK',
      icon: '💬',
      action: () => setActiveTab('chat'),
    },
    {
      id: 'tab-tutorials',
      label: 'Переключиться на туториалы',
      description: 'Открыть интерактивные уроки с заданиями',
      icon: '🏆',
      action: () => setActiveTab('tutorials'),
    },
    {
      id: 'new-script',
      label: 'Новый скрипт',
      description: 'Создать новый пустой скрипт',
      icon: '📄',
      action: () => {
        setCode('; Новый скрипт\n\n');
        setCurrentScript(null);
        setSaved(false);
      },
    },
    {
      id: 'clear-code',
      label: 'Очистить редактор',
      description: 'Удалить весь код из редактора',
      icon: '🗑️',
      action: () => {
        if (confirm('Очистить весь код в редакторе?')) {
          setCode('');
          setSaved(false);
        }
      },
    },
    {
      id: 'theme-light',
      label: 'Переключить на светлую тему',
      description: 'Установить светлую тему оформления',
      icon: '☀️',
      action: () => {
        localStorage.setItem('ahk-theme', 'light');
        window.location.reload();
      },
    },
    {
      id: 'theme-dark',
      label: 'Переключить на тёмную тему',
      description: 'Установить тёмную тему оформления',
      icon: '🌙',
      action: () => {
        localStorage.setItem('ahk-theme', 'dark');
        window.location.reload();
      },
    },
    {
      id: 'theme-system',
      label: 'Переключить на системную тему',
      description: 'Автоматически по настройкам системы',
      icon: '🖥️',
      action: () => {
        localStorage.setItem('ahk-theme', 'system');
        window.location.reload();
      },
    },
    {
      id: 'save-version',
      label: 'Сохранить версию скрипта',
      description: 'Создать snapshot текущего кода',
      icon: '📸',
      action: () => {
        const versions = JSON.parse(localStorage.getItem('ahk-version-history') || '[]');
        const newVersion = {
          id: Date.now().toString(),
          code: code,
          timestamp: Date.now(),
          description: `Версия от ${new Date().toLocaleString('ru-RU')}`,
        };
        versions.unshift(newVersion);
        localStorage.setItem('ahk-version-history', JSON.stringify(versions.slice(0, 20)));
        alert('Версия сохранена!');
      },
    },
  ];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'editor', label: 'Редактор', icon: <Code2 size={18} /> },
    { id: 'macros', label: 'Макросы', icon: <Blocks size={18} /> },
    { id: 'docs', label: 'Документация', icon: <BookOpen size={18} /> },
    { id: 'learn', label: 'Обучение', icon: <GraduationCap size={18} /> },
    { id: 'tutorials', label: 'Туториалы', icon: <Award size={18} /> },
    { id: 'chat', label: 'ИИ Чат', icon: <MessageCircle size={18} /> },
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Top Bar */}
      <header className="h-12 flex items-center px-4 border-b border-gray-700 bg-gray-800/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2 mr-6">
          <Zap size={20} className="text-yellow-400" />
          <h1 className="font-bold text-sm tracking-wide">
            <span className="text-blue-400">AHK</span> Script Editor
          </h1>
        </div>

        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Tabs */}
        <nav className="flex items-center gap-1">
          {tabs.map(tab => (
            <Tooltip key={tab.id} content={`Переключиться на вкладку "${tab.label}"`} position="bottom">
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            </Tooltip>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {currentScript && (
            <Tooltip content={`Текущий скрипт: ${currentScript.name}.ahk${!saved ? ' (несохранённые изменения)' : ''}`} position="bottom">
              <span className="text-xs text-gray-500 mr-2 hidden md:inline cursor-help">
                {currentScript.name}.ahk
                {!saved && <span className="text-yellow-400 ml-1">●</span>}
              </span>
            </Tooltip>
          )}
          
          {/* Version History */}
          <VersionHistory
            currentCode={code}
            onRestore={(restoredCode) => {
              setCode(restoredCode);
              setSaved(false);
            }}
          />
          <Tooltip content="Сохранить текущий скрипт (Ctrl+S)" position="bottom">
            <button
              onClick={handleSave}
              className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              title="Сохранить (Ctrl+S)"
            >
              <Save size={16} />
            </button>
          </Tooltip>
          <Tooltip content="Экспортировать скрипт в файл .ahk" position="bottom">
            <button
              onClick={handleExport}
              className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              title="Экспорт .ahk"
            >
              <Download size={16} />
            </button>
          </Tooltip>
          <Tooltip content="Импортировать .ahk файл в редактор" position="bottom">
            <button
              onClick={handleImport}
              className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              title="Импорт .ahk"
            >
              <Upload size={16} />
            </button>
          </Tooltip>
          <div className="w-px h-6 bg-gray-700 mx-1" />
          <Tooltip content={showTextToMacro ? 'Скрыть ИИ-генератор' : 'ИИ-генератор макросов (бесплатно)'} position="bottom">
            <button
              onClick={() => { setShowTextToMacro(!showTextToMacro); if (!showTextToMacro) { setShowOutput(false); setShowSimulator(false); setShowCoordinateHelper(false); } }}
              className={`p-2 rounded transition-colors ${showTextToMacro ? 'bg-purple-900/50 text-purple-400' : 'hover:bg-gray-700 text-gray-400 hover:text-white'}`}
            >
              <Sparkles size={16} />
            </button>
          </Tooltip>
          <Tooltip content={showCoordinateHelper ? 'Скрыть координатный помощник' : 'Координатный помощник'} position="bottom">
            <button
              onClick={() => { setShowCoordinateHelper(!showCoordinateHelper); if (!showCoordinateHelper) { setShowOutput(false); setShowSimulator(false); setShowTextToMacro(false); setShowPixelTester(false); } }}
              className={`p-2 rounded transition-colors ${showCoordinateHelper ? 'bg-cyan-900/50 text-cyan-400' : 'hover:bg-gray-700 text-gray-400 hover:text-white'}`}
            >
              <MousePointer2 size={16} />
            </button>
          </Tooltip>
          <Tooltip content={showPixelTester ? 'Скрыть тестировщик пикселей' : 'Тестировщик пикселей'} position="bottom">
            <button
              onClick={() => { setShowPixelTester(!showPixelTester); if (!showPixelTester) { setShowOutput(false); setShowSimulator(false); setShowTextToMacro(false); setShowCoordinateHelper(false); } }}
              className={`p-2 rounded transition-colors ${showPixelTester ? 'bg-purple-900/50 text-purple-400' : 'hover:bg-gray-700 text-gray-400 hover:text-white'}`}
            >
              <Palette size={16} />
            </button>
          </Tooltip>
          <Tooltip content={showSimulator ? 'Скрыть симулятор' : 'Симулятор выполнения AHK'} position="bottom">
            <button
              onClick={() => { setShowSimulator(!showSimulator); if (!showSimulator) { setShowOutput(false); setShowTextToMacro(false); } }}
              className={`p-2 rounded transition-colors ${showSimulator ? 'bg-green-900/50 text-green-400' : 'hover:bg-gray-700 text-gray-400 hover:text-white'}`}
            >
              <Play size={16} />
            </button>
          </Tooltip>
          <Tooltip content={showOutput ? 'Скрыть панель анализа кода' : 'Показать панель анализа кода'} position="bottom">
            <button
              onClick={() => { setShowOutput(!showOutput); if (!showOutput) { setShowSimulator(false); setShowTextToMacro(false); } }}
              className={`p-2 rounded transition-colors ${showOutput ? 'bg-blue-900/50 text-blue-400' : 'hover:bg-gray-700 text-gray-400 hover:text-white'}`}
              title="Панель анализа"
            >
              <Terminal size={16} />
            </button>
          </Tooltip>
          <Tooltip content={showSidebar ? 'Скрыть боковую панель' : 'Показать боковую панель со скриптами'} position="bottom">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              title="Боковая панель"
            >
              {showSidebar ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>
          </Tooltip>
          <Tooltip content="Командная палитра (Ctrl+Shift+P)" position="bottom">
            <button
              onClick={() => setShowCommandPalette(true)}
              className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              title="Команды"
            >
              <Settings size={16} />
            </button>
          </Tooltip>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <aside className="w-72 border-r border-gray-700 flex flex-col bg-gray-800/30 shrink-0">
            <div className="flex border-b border-gray-700">
              <Tooltip content="Управление сохранёнными скриптами: создание, открытие, экспорт" position="bottom">
                <button
                  onClick={() => setSidebarTab('scripts')}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    sidebarTab === 'scripts' ? 'text-blue-300 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FolderOpen size={14} className="inline mr-1" /> Скрипты
                </button>
              </Tooltip>
              <Tooltip content="Информация о редакторе, горячие клавиши и статистика" position="bottom">
                <button
                  onClick={() => setSidebarTab('info')}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    sidebarTab === 'info' ? 'text-blue-300 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Settings size={14} className="inline mr-1" /> Инфо
                </button>
              </Tooltip>
            </div>
            <div className="flex-1 overflow-hidden">
              {sidebarTab === 'scripts' ? (
                <ScriptManager
                  currentScript={currentScript}
                  onSelectScript={handleSelectScript}
                  onUpdateScript={handleUpdateScript}
                />
              ) : (
                <div className="p-4 space-y-4 overflow-y-auto h-full">
                  <div>
                    <h3 className="text-sm font-bold text-gray-300 mb-2">О редакторе</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      AHK Script Editor — это веб-приложение для создания, редактирования 
                      и изучения скриптов AutoHotkey. Поддерживает подсветку синтаксиса, 
                      автодополнение, визуальный конструктор макросов и обучающий режим.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-300 mb-2">Горячие клавиши</h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-gray-400">
                        <span>Сохранить</span>
                        <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">Ctrl+S</kbd>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Автодополнение</span>
                        <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">Ctrl+Space</kbd>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Комментарий</span>
                        <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">Ctrl+/</kbd>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Поиск</span>
                        <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">Ctrl+F</kbd>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-300 mb-2">AHK модификаторы</h3>
                    <div className="space-y-1 text-xs text-gray-400">
                      <div><kbd className="px-1 bg-gray-700 rounded text-yellow-300">#</kbd> — Win</div>
                      <div><kbd className="px-1 bg-gray-700 rounded text-yellow-300">^</kbd> — Ctrl</div>
                      <div><kbd className="px-1 bg-gray-700 rounded text-yellow-300">!</kbd> — Alt</div>
                      <div><kbd className="px-1 bg-gray-700 rounded text-yellow-300">+</kbd> — Shift</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-300 mb-2">Статистика</h3>
                    <div className="text-xs text-gray-400 space-y-1">
                      <div>Строк кода: <span className="text-white">{code.split('\n').length}</span></div>
                      <div>Символов: <span className="text-white">{code.length}</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Main Panel */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            {activeTab === 'editor' && (
              <CodeEditor value={code} onChange={handleCodeChange} />
            )}
            {activeTab === 'macros' && (
              <MacroBuilder onCodeGenerated={handleCodeGenerated} />
            )}
            {activeTab === 'docs' && (
              <Documentation onInsertExample={handleInsertExample} />
            )}
          {activeTab === 'learn' && (
            <Learning onInsertCode={handleInsertCode} />
          )}
          {activeTab === 'chat' && (
            <AIChat onCodeGenerated={(code) => {
              setCode(prev => prev + '\n\n' + code);
              setActiveTab('editor');
              setSaved(false);
            }} />
          )}
          {activeTab === 'tutorials' && (
            <InteractiveTutorials onInsertCode={(code) => {
              setCode(prev => prev + '\n\n' + code);
              setActiveTab('editor');
              setSaved(false);
            }} />
          )}          </div>
          {/* AI Generator Panel */}
          {showTextToMacro && (
            <div className="border-t border-gray-700">
              <AIGenerator onCodeGenerated={(genCode: string) => {
                setCode(prev => prev + '\n\n' + genCode);
                setActiveTab('editor');
                setShowTextToMacro(false);
                setSaved(false);
              }} />
            </div>
          )}
          {/* Simulator Panel */}
          {showSimulator && (
            <div className="h-56 border-t border-gray-700">
              <Simulator code={code} />
            </div>
          )}
          {/* Output Panel */}
          {showOutput && (
            <div className="h-48 border-t border-gray-700">
              <OutputPanel code={code} />
            </div>
          )}
          {/* Coordinate Helper Panel */}
          {showCoordinateHelper && (
            <div className="h-96 border-t border-gray-700">
              <CoordinateHelper onInsertCode={(coordCode) => {
                setCode(prev => prev + '\n' + coordCode);
                setActiveTab('editor');
                setSaved(false);
              }} />
            </div>
          )}
          {/* Pixel Tester Panel */}
          {showPixelTester && (
            <div className="h-96 border-t border-gray-700">
              <PixelTester onInsertCode={(pixelCode) => {
                setCode(prev => prev + '\n' + pixelCode);
                setActiveTab('editor');
                setSaved(false);
              }} />
            </div>
          )}
        </main>
      </div>

      {/* Status Bar */}
      <footer className="h-6 flex items-center px-4 border-t border-gray-700 bg-gray-800/80 text-xs text-gray-500 shrink-0">
        <span>AHK v1.1</span>
        <span className="mx-2">|</span>
        <span>UTF-8</span>
        <span className="mx-2">|</span>
        <span>Строк: {code.split('\n').length}</span>
        <div className="flex-1" />
        <span className="mr-2">Ctrl+Shift+P — команды</span>
        {!saved && <span className="text-yellow-400">● Несохранённые изменения</span>}
        {saved && <span className="text-green-400">✓ Сохранено</span>}
      </footer>

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        commands={commands}
      />
    </div>
  );
}
