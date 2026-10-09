import { useState, useEffect, useRef, useCallback } from 'react';
import { Keyboard, X, Check, AlertCircle } from 'lucide-react';
import Tooltip from './Tooltip';
import { parseHotkey, hotkeyToReadable } from '../utils/hotkeyParser';

interface HotkeyRecorderProps {
  value: string;
  onChange: (ahkFormat: string) => void;
  existingHotkeys?: string[];
  placeholder?: string;
}

interface KeyState {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  win: boolean;
  mainKey: string;
}

const MODIFIER_KEYS = new Set([
  'Control', 'ControlLeft', 'ControlRight',
  'Alt', 'AltLeft', 'AltRight',
  'Shift', 'ShiftLeft', 'ShiftRight',
  'Meta', 'MetaLeft', 'MetaRight',
]);

const KEY_DISPLAY: Record<string, string> = {
  ' ': 'Space',
  'Spacebar': 'Space',
  'Escape': 'Esc',
  'ArrowUp': '↑',
  'ArrowDown': '↓',
  'ArrowLeft': '←',
  'ArrowRight': '→',
  'Backspace': '⌫',
  'Delete': 'Del',
  'Enter': '↵',
  'Tab': '⇥',
};

export default function HotkeyRecorder({
  value,
  onChange,
  existingHotkeys = [],
  placeholder = 'Нажмите комбинацию клавиш...',
}: HotkeyRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [keyState, setKeyState] = useState<KeyState>({
    ctrl: false,
    alt: false,
    shift: false,
    win: false,
    mainKey: '',
  });
  const [conflict, setConflict] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Проверка конфликтов
  const checkConflict = useCallback((ahkFormat: string) => {
    if (!ahkFormat) {
      setConflict(null);
      return;
    }
    const normalized = ahkFormat.toLowerCase();
    const found = existingHotkeys.find(h => h.toLowerCase() === normalized);
    setConflict(found || null);
  }, [existingHotkeys]);

  useEffect(() => {
    checkConflict(value);
  }, [value, checkConflict]);

  // Обработка нажатий клавиш
  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (MODIFIER_KEYS.has(e.code)) {
        setKeyState(prev => ({
          ...prev,
          ctrl: e.code.includes('Control') || prev.ctrl,
          alt: e.code.includes('Alt') || prev.alt,
          shift: e.code.includes('Shift') || prev.shift,
          win: e.code.includes('Meta') || prev.win,
        }));
        return;
      }

      // Основная клавиша
      let mainKey = e.key;
      if (e.key.length === 1) {
        mainKey = e.key.toLowerCase();
      } else if (e.key.startsWith('F') && e.key.length <= 3) {
        mainKey = e.key;
      }

      setKeyState(prev => ({ ...prev, mainKey }));

      // Формируем AHK формат
      const ahkFormat = buildAHKFormat({
        ctrl: e.code.includes('Control') || keyState.ctrl,
        alt: e.code.includes('Alt') || keyState.alt,
        shift: e.code.includes('Shift') || keyState.shift,
        win: e.code.includes('Meta') || keyState.win,
        mainKey,
      });

      if (ahkFormat) {
        onChange(ahkFormat);
        checkConflict(ahkFormat);
        setIsRecording(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (MODIFIER_KEYS.has(e.code)) {
        setKeyState(prev => ({
          ...prev,
          ctrl: e.code.includes('Control') ? false : prev.ctrl,
          alt: e.code.includes('Alt') ? false : prev.alt,
          shift: e.code.includes('Shift') ? false : prev.shift,
          win: e.code.includes('Meta') ? false : prev.win,
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [isRecording, keyState, onChange, checkConflict]);

  // Построение AHK формата из состояния клавиш
  const buildAHKFormat = (state: KeyState): string => {
    if (!state.mainKey) return '';
    
    let modifiers = '';
    if (state.ctrl) modifiers += '^';
    if (state.alt) modifiers += '!';
    if (state.shift) modifiers += '+';
    if (state.win) modifiers += '#';

    let key = state.mainKey;
    
    // Специальные клавиши
    const specialMap: Record<string, string> = {
      'Enter': '{Enter}',
      'Tab': '{Tab}',
      ' ': '{Space}',
      'Space': '{Space}',
      'Escape': '{Esc}',
      'Backspace': '{Backspace}',
      'Delete': '{Delete}',
      'ArrowUp': '{Up}',
      'ArrowDown': '{Down}',
      'ArrowLeft': '{Left}',
      'ArrowRight': '{Right}',
      'Home': '{Home}',
      'End': '{End}',
      'PageUp': '{PgUp}',
      'PageDown': '{PgDn}',
      'Insert': '{Insert}',
    };

    if (specialMap[key]) {
      key = specialMap[key];
    } else if (key.startsWith('F') && /^F\d+$/.test(key)) {
      // F1-F24 оставляем как есть
    } else if (key.length > 1) {
      key = `{${key}}`;
    }

    return modifiers + key;
  };

  // Отображение текущего состояния клавиш
  const renderKeyPreview = () => {
    const parts: string[] = [];
    if (keyState.ctrl) parts.push('Ctrl');
    if (keyState.alt) parts.push('Alt');
    if (keyState.shift) parts.push('Shift');
    if (keyState.win) parts.push('Win');
    
    if (keyState.mainKey) {
      const display = KEY_DISPLAY[keyState.mainKey] || keyState.mainKey.toUpperCase();
      parts.push(display);
    }
    
    return parts.join(' + ');
  };

  const clearHotkey = () => {
    onChange('');
    setKeyState({ ctrl: false, alt: false, shift: false, win: false, mainKey: '' });
    setConflict(null);
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded border-2 transition-all cursor-pointer ${
          isRecording
            ? 'border-red-500 bg-red-900/20 shadow-lg shadow-red-500/20'
            : conflict
            ? 'border-yellow-500 bg-yellow-900/20'
            : 'border-gray-700 bg-gray-900 hover:border-gray-500'
        }`}
        onClick={() => setIsRecording(!isRecording)}
      >
        <Keyboard size={16} className={isRecording ? 'text-red-400 animate-pulse' : 'text-gray-400'} />
        
        <div className="flex-1 min-h-[24px] flex items-center">
          {isRecording ? (
            <span className="text-red-300 font-mono">
              {renderKeyPreview() || placeholder}
            </span>
          ) : value ? (
            <span className="text-yellow-300 font-mono">
              {hotkeyToReadable(value)}
            </span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>

        {value && !isRecording && (
          <Tooltip content="Очистить горячую клавишу">
            <button
              onClick={(e) => { e.stopPropagation(); clearHotkey(); }}
              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </Tooltip>
        )}

        {value && !isRecording && !conflict && (
          <Check size={16} className="text-green-400" />
        )}
      </div>

      {/* Подсказки */}
      {isRecording && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-gray-800 border border-gray-700 rounded text-xs text-gray-400 z-10">
          <div>🎹 Нажмите комбинацию клавиш</div>
          <div className="mt-1 text-gray-500">
            Примеры: Ctrl+S, Alt+F4, Win+D, Ctrl+Shift+T
          </div>
        </div>
      )}

      {/* Предупреждение о конфликте */}
      {conflict && (
        <div className="mt-1 flex items-center gap-1.5 text-xs text-yellow-400">
          <AlertCircle size={12} />
          <span>Эта комбинация уже используется</span>
        </div>
      )}

      {/* AHK формат */}
      {value && !isRecording && (
        <div className="mt-1 text-xs text-gray-500 font-mono">
          AHK: <code className="bg-gray-800 px-1 rounded text-green-400">{value}</code>
        </div>
      )}
    </div>
  );
}
