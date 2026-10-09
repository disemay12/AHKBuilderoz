import { useState } from 'react';
import { Play, Square, Trash2, Terminal } from 'lucide-react';
import Tooltip from './Tooltip';

interface OutputPanelProps {
  code: string;
}

interface OutputLine {
  type: 'info' | 'output' | 'error' | 'input';
  text: string;
  timestamp: string;
}

// Simple AHK code analyzer/simulator
function analyzeCode(code: string): OutputLine[] {
  const lines: OutputLine[] = [];
  const codeLines = code.split('\n');
  
  lines.push({ type: 'info', text: '🔍 Анализ скрипта...', timestamp: new Date().toLocaleTimeString() });

  let hotkeyCount = 0;
  let sendCount = 0;
  let loopCount = 0;
  let varCount = 0;
  let funcCount = 0;
  let errors: string[] = [];
  let warnings: string[] = [];

  for (let i = 0; i < codeLines.length; i++) {
    const line = codeLines[i].trim();
    const lineNum = i + 1;

    // Skip empty lines and comments
    if (!line || line.startsWith(';')) continue;

    // Count hotkeys
    if (/^[#\^!+]*\w+::$/i.test(line) || /^[#\^!+]*\w+::\s/i.test(line)) {
      hotkeyCount++;
      lines.push({ type: 'output', text: `  📌 Строка ${lineNum}: Горячая клавиша "${line.replace('::', '')}"`, timestamp: new Date().toLocaleTimeString() });
    }

    // Count Send commands
    if (/^send/i.test(line)) {
      sendCount++;
      const match = line.match(/send(?:input|play|raw|event)?,\s*(.+)/i);
      if (match) {
        lines.push({ type: 'output', text: `  ⌨️ Строка ${lineNum}: Отправка "${match[1].substring(0, 40)}${match[1].length > 40 ? '...' : ''}"`, timestamp: new Date().toLocaleTimeString() });
      }
    }

    // Count loops
    if (/^loop/i.test(line)) {
      loopCount++;
      const match = line.match(/loop,\s*(\d+)/i);
      if (match) {
        lines.push({ type: 'output', text: `  🔄 Строка ${lineNum}: Цикл (${match[1]} итераций)`, timestamp: new Date().toLocaleTimeString() });
      } else {
        lines.push({ type: 'output', text: `  🔄 Строка ${lineNum}: Цикл (бесконечный)`, timestamp: new Date().toLocaleTimeString() });
      }
    }

    // Count variables
    if (/^\w+\s*:=/.test(line)) {
      varCount++;
      const match = line.match(/^(\w+)\s*:=/);
      if (match) {
        lines.push({ type: 'output', text: `  📦 Строка ${lineNum}: Переменная "${match[1]}"`, timestamp: new Date().toLocaleTimeString() });
      }
    }

    // Count functions
    if (/^\w+\(.*\)\s*\{/i.test(line)) {
      funcCount++;
      const match = line.match(/^(\w+)\(/);
      if (match) {
        lines.push({ type: 'output', text: `  ⚙️ Строка ${lineNum}: Функция "${match[1]}"`, timestamp: new Date().toLocaleTimeString() });
      }
    }

    // Check for common errors
    if (/^msgbox/i.test(line) && !line.includes(',') && !line.includes('%')) {
      warnings.push(`Строка ${lineNum}: MsgBox без текста`);
    }

    if (/return/i.test(line) && i > 0 && !codeLines.slice(0, i).some(l => /::$/i.test(l.trim()))) {
      // return outside hotkey context - might be fine in functions
    }

    // Check for unclosed braces
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    if (openBraces > closeBraces) {
      // Could be multi-line block, just note it
    }
  }

  // Summary
  lines.push({ type: 'info', text: '', timestamp: new Date().toLocaleTimeString() });
  lines.push({ type: 'info', text: '📊 Итого:', timestamp: new Date().toLocaleTimeString() });
  lines.push({ type: 'output', text: `  Горячих клавиш: ${hotkeyCount}`, timestamp: new Date().toLocaleTimeString() });
  lines.push({ type: 'output', text: `  Команд Send: ${sendCount}`, timestamp: new Date().toLocaleTimeString() });
  lines.push({ type: 'output', text: `  Циклов: ${loopCount}`, timestamp: new Date().toLocaleTimeString() });
  lines.push({ type: 'output', text: `  Переменных: ${varCount}`, timestamp: new Date().toLocaleTimeString() });
  lines.push({ type: 'output', text: `  Функций: ${funcCount}`, timestamp: new Date().toLocaleTimeString() });
  lines.push({ type: 'output', text: `  Строк кода: ${codeLines.filter(l => l.trim() && !l.trim().startsWith(';')).length}`, timestamp: new Date().toLocaleTimeString() });

  if (warnings.length > 0) {
    lines.push({ type: 'info', text: '', timestamp: new Date().toLocaleTimeString() });
    lines.push({ type: 'error', text: '⚠️ Предупреждения:', timestamp: new Date().toLocaleTimeString() });
    warnings.forEach(w => {
      lines.push({ type: 'error', text: `  ${w}`, timestamp: new Date().toLocaleTimeString() });
    });
  }

  if (errors.length > 0) {
    lines.push({ type: 'info', text: '', timestamp: new Date().toLocaleTimeString() });
    lines.push({ type: 'error', text: '❌ Ошибки:', timestamp: new Date().toLocaleTimeString() });
    errors.forEach(e => {
      lines.push({ type: 'error', text: `  ${e}`, timestamp: new Date().toLocaleTimeString() });
    });
  }

  lines.push({ type: 'info', text: '', timestamp: new Date().toLocaleTimeString() });
  lines.push({ type: 'info', text: '✅ Анализ завершён', timestamp: new Date().toLocaleTimeString() });

  return lines;
}

export default function OutputPanel({ code }: OutputPanelProps) {
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleAnalyze = () => {
    setIsRunning(true);
    setOutput([]);
    
    // Simulate progressive output
    const lines = analyzeCode(code);
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < lines.length) {
        setOutput(prev => [...prev, lines[index]]);
        index++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 50);
  };

  const handleClear = () => {
    setOutput([]);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700 bg-gray-800/50">
        <Terminal size={14} className="text-green-400" />
        <Tooltip content="Панель анализа показывает структуру вашего AHK скрипта: горячие клавиши, переменные, циклы и другие элементы" position="right">
          <span className="text-sm font-medium text-gray-300 cursor-help">Анализ и вывод</span>
        </Tooltip>
        <div className="flex-1" />
        <Tooltip content="Запустить анализ текущего скрипта — показать структуру, подсчитать элементы и найти потенциальные проблемы" position="bottom">
          <button
            onClick={handleAnalyze}
            disabled={isRunning || !code.trim()}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-medium transition-colors"
          >
            {isRunning ? <Square size={12} /> : <Play size={12} />}
            {isRunning ? 'Анализ...' : 'Анализировать'}
          </button>
        </Tooltip>
        <Tooltip content="Очистить панель вывода от предыдущих результатов анализа" position="bottom">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium transition-colors"
          >
            <Trash2 size={12} />
            Очистить
          </button>
        </Tooltip>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
        {output.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-600">
            <div className="text-center">
              <Terminal size={24} className="mx-auto mb-2 opacity-30" />
              <p>Нажмите "Анализировать" для проверки скрипта</p>
              <p className="mt-1 text-gray-700">Симулятор покажет структуру и элементы вашего кода</p>
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {output.map((line, i) => (
              <div
                key={i}
                className={`py-0.5 ${
                  line.type === 'error' ? 'text-red-400' :
                  line.type === 'info' ? 'text-blue-400' :
                  line.type === 'input' ? 'text-yellow-400' :
                  'text-gray-300'
                }`}
              >
                {line.text || '\u00A0'}
              </div>
            ))}
            {isRunning && (
              <div className="text-green-400 animate-pulse">▊</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
