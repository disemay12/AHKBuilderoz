import { useState, useEffect, useRef } from 'react';
import { Play, Square, Terminal, Info } from 'lucide-react';
import Tooltip from './Tooltip';

interface SimulatorProps {
  code: string;
}

interface LogEntry {
  type: 'info' | 'action' | 'output' | 'error' | 'system';
  text: string;
  time: string;
}

/**
 * Простой симулятор AHK - выполняет базовые команды и показывает результат
 */
function simulateCode(code: string): LogEntry[] {
  const logs: LogEntry[] = [];
  const lines = code.split('\n');
  const now = () => new Date().toLocaleTimeString();
  
  logs.push({ type: 'system', text: '▶ Запуск симуляции...', time: now() });
  logs.push({ type: 'info', text: 'Режим: эмуляция (реальные действия не выполняются)', time: now() });
  logs.push({ type: 'info', text: '─'.repeat(50), time: now() });

  let currentHotkey = '';
  let inHotkey = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith(';')) continue;

    // Hotkey definition
    if (/^[#\^!+]*\w+::$/i.test(line) || /^[#\^!+]*\w+::\s/i.test(line)) {
      currentHotkey = line.replace('::', '');
      inHotkey = true;
      logs.push({ type: 'system', text: `🔑 Горячая клавиша зарегистрирована: ${currentHotkey}`, time: now() });
      logs.push({ type: 'info', text: `   Симуляция нажатия ${currentHotkey}...`, time: now() });
      continue;
    }

    // Return
    if (/^return$/i.test(line)) {
      if (inHotkey) {
        logs.push({ type: 'system', text: `↩️ Завершение обработки ${currentHotkey}`, time: now() });
        inHotkey = false;
      }
      continue;
    }

    // Send
    const sendMatch = line.match(/^send(?:input|play|raw|event)?,\s*(.+)/i);
    if (sendMatch) {
      logs.push({ type: 'action', text: `⌨️ Отправка: "${sendMatch[1]}"`, time: now() });
      logs.push({ type: 'output', text: `   → [в активное окно]: ${sendMatch[1]}`, time: now() });
      continue;
    }

    // Sleep
    const sleepMatch = line.match(/^sleep,\s*(\d+)/i);
    if (sleepMatch) {
      const ms = parseInt(sleepMatch[1]);
      logs.push({ type: 'action', text: `⏱️ Пауза: ${ms}мс`, time: now() });
      continue;
    }

    // Click
    const clickMatch = line.match(/^click,\s*(.+)/i);
    if (clickMatch) {
      logs.push({ type: 'action', text: `🖱️ Клик: ${clickMatch[1]}`, time: now() });
      continue;
    }

    // MouseMove
    const mmMatch = line.match(/^mousemove,\s*(.+)/i);
    if (mmMatch) {
      logs.push({ type: 'action', text: `➡️ Перемещение мыши: ${mmMatch[1]}`, time: now() });
      continue;
    }

    // WinActivate
    const waMatch = line.match(/^winactivate,\s*(.+)/i);
    if (waMatch) {
      logs.push({ type: 'action', text: `🔍 Активация окна: "${waMatch[1]}"`, time: now() });
      logs.push({ type: 'output', text: `   → Окно "${waMatch[1]}" теперь активно`, time: now() });
      continue;
    }

    // WinWait
    const wwMatch = line.match(/^winwait,\s*(.+)/i);
    if (wwMatch) {
      logs.push({ type: 'action', text: `⏳ Ожидание окна: "${wwMatch[1]}"`, time: now() });
      logs.push({ type: 'output', text: `   → Окно найдено (симуляция)`, time: now() });
      continue;
    }

    // Run
    const runMatch = line.match(/^run(?:wait)?,\s*(.+)/i);
    if (runMatch) {
      logs.push({ type: 'action', text: `🚀 Запуск: ${runMatch[1]}`, time: now() });
      logs.push({ type: 'output', text: `   → Процесс запущен (симуляция)`, time: now() });
      continue;
    }

    // MsgBox
    const msgMatch = line.match(/^msgbox,\s*(?:%\s*)?(.+)/i);
    if (msgMatch) {
      logs.push({ type: 'action', text: `💬 MsgBox: "${msgMatch[1]}"`, time: now() });
      logs.push({ type: 'output', text: `   → [Диалог]: ${msgMatch[1]}`, time: now() });
      continue;
    }

    // ToolTip
    const ttMatch = line.match(/^tooltip,\s*(.+)/i);
    if (ttMatch) {
      logs.push({ type: 'action', text: `💡 Подсказка: "${ttMatch[1]}"`, time: now() });
      continue;
    }

    // Variable assignment
    const varMatch = line.match(/^(\w+)\s*:=\s*(.+)/);
    if (varMatch) {
      logs.push({ type: 'action', text: `📦 ${varMatch[1]} := ${varMatch[2]}`, time: now() });
      continue;
    }

    // Loop
    const loopMatch = line.match(/^loop,\s*(\d*)/i);
    if (loopMatch) {
      const count = loopMatch[1] || '∞';
      logs.push({ type: 'action', text: `🔄 Цикл: ${count} итераций`, time: now() });
      continue;
    }

    // If
    const ifMatch = line.match(/^if\s*\((.+)\)/i);
    if (ifMatch) {
      logs.push({ type: 'action', text: `❓ Условие: ${ifMatch[1]}`, time: now() });
      logs.push({ type: 'output', text: `   → Результат: true (симуляция)`, time: now() });
      continue;
    }

    // PixelSearch
    const psMatch = line.match(/^pixelsearch/i);
    if (psMatch) {
      logs.push({ type: 'action', text: `🎨 Поиск пикселя...`, time: now() });
      logs.push({ type: 'output', text: `   → Пиксель найден (симуляция)`, time: now() });
      continue;
    }

    // ImageSearch
    const isMatch = line.match(/^imagesearch/i);
    if (isMatch) {
      logs.push({ type: 'action', text: `🖼️ Поиск изображения...`, time: now() });
      logs.push({ type: 'output', text: `   → Изображение найдено (симуляция)`, time: now() });
      continue;
    }

    // SoundBeep
    const sbMatch = line.match(/^soundbeep/i);
    if (sbMatch) {
      logs.push({ type: 'action', text: `🔊 Звуковой сигнал`, time: now() });
      continue;
    }

    // ExitApp
    if (/^exitapp/i.test(line)) {
      logs.push({ type: 'system', text: `🚪 Завершение скрипта`, time: now() });
      break;
    }

    // Unknown command
    logs.push({ type: 'info', text: `⚙️ ${line.substring(0, 60)}`, time: now() });
  }

  logs.push({ type: 'info', text: '─'.repeat(50), time: now() });
  logs.push({ type: 'system', text: '✅ Симуляция завершена', time: now() });

  return logs;
}

export default function Simulator({ code }: SimulatorProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Очистка интервала при размонтировании
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleRun = () => {
    if (!code.trim()) return;
    
    // Очистка предыдущего интервала если есть
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setIsRunning(true);
    setLogs([]);

    const allLogs = simulateCode(code);
    let index = 0;

    intervalRef.current = setInterval(() => {
      if (index < allLogs.length) {
        const log = allLogs[index];
        if (log) {
          setLogs(prev => [...prev, log]);
        }
        index++;
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsRunning(false);
      }
    }, 100);
  };

  const handleStop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700 bg-gray-800/50">
        <Terminal size={14} className="text-green-400" />
        <Tooltip content="Симулятор выполняет команды AHK в безопасном режиме без реальных действий">
          <span className="text-sm font-medium text-gray-300 cursor-help">Симулятор выполнения</span>
        </Tooltip>
        <div className="flex-1" />
        {!isRunning ? (
          <Tooltip content="Запустить симуляцию текущего скрипта">
            <button
              onClick={handleRun}
              disabled={!code.trim()}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-medium"
            >
              <Play size={12} /> Запустить
            </button>
          </Tooltip>
        ) : (
          <button
            onClick={handleStop}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-medium"
          >
            <Square size={12} /> Остановить
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-600">
            <div className="text-center">
              <Info size={24} className="mx-auto mb-2 opacity-30" />
              <p>Нажмите "Запустить" для симуляции</p>
              <p className="mt-1 text-gray-700">Скрипт выполнится в безопасном режиме</p>
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {logs.filter(log => log).map((log, i) => (
              <div
                key={i}
                className={`py-0.5 ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'system' ? 'text-blue-400' :
                  log.type === 'action' ? 'text-yellow-300' :
                  log.type === 'output' ? 'text-green-300' :
                  'text-gray-400'
                }`}
              >
                <span className="text-gray-600 mr-2">[{log.time}]</span>
                {log.text}
              </div>
            ))}
            {isRunning && <div className="text-green-400 animate-pulse">▊</div>}
          </div>
        )}
      </div>
    </div>
  );
}
