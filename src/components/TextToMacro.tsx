import { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import Tooltip from './Tooltip';

interface TextToMacroProps {
  onCodeGenerated: (code: string) => void;
}

interface Pattern {
  keywords: string[];
  generate: (params: Record<string, string>) => string;
  description: string;
}

const patterns: Pattern[] = [
  {
    keywords: ['открыть', 'запустить', 'блокнот', 'notepad'],
    description: 'Открыть блокнот',
    generate: () => `; Открытие блокнота\nRun, notepad.exe\nSleep, 500\nWinActivate, Блокнот\n`,
  },
  {
    keywords: ['копировать', 'копирование', 'ctrl+c', 'copy'],
    description: 'Копирование выделенного текста',
    generate: () => `; Копирование выделенного текста\nSend, ^c\n`,
  },
  {
    keywords: ['вставить', 'вставка', 'ctrl+v', 'paste'],
    description: 'Вставка из буфера обмена',
    generate: () => `; Вставка из буфера обмена\nSend, ^v\n`,
  },
  {
    keywords: ['печать', 'печатать', 'написать', 'ввод', 'текст'],
    description: 'Ввод текста',
    generate: (p) => `; Ввод текста\nSend, ${p.text || 'Ваш текст'}\n`,
  },
  {
    keywords: ['клик', 'нажать', 'мышь', 'click'],
    description: 'Клик мышью',
    generate: (p) => `; Клик мышью\nClick, ${p.x || '500'}, ${p.y || '500'}\n`,
  },
  {
    keywords: ['задержка', 'пауза', 'ждать', 'sleep'],
    description: 'Пауза',
    generate: (p) => `; Пауза\nSleep, ${p.ms || '1000'}\n`,
  },
  {
    keywords: ['цикл', 'повтор', 'loop', 'несколько раз'],
    description: 'Цикл',
    generate: (p) => `; Цикл\nLoop, ${p.count || '5'}\n{\n    ; действия\n    Sleep, 100\n}\n`,
  },
  {
    keywords: ['окно', 'активировать', 'переключить', 'window'],
    description: 'Активация окна',
    generate: (p) => `; Активация окна\nWinActivate, ${p.title || 'Блокнот'}\n`,
  },
  {
    keywords: ['скриншот', 'снимок', 'screenshot', 'printscreen'],
    description: 'Сделать скриншот',
    generate: () => `; Скриншот\nSend, {PrintScreen}\nSleep, 500\nMsgBox, Скриншот сохранён в буфер обмена\n`,
  },
  {
    keywords: ['громкость', 'звук', 'volume'],
    description: 'Изменение громкости',
    generate: (p) => `; Изменение громкости\nSoundSet, ${p.value || '50'}\n`,
  },
  {
    keywords: ['автокликер', 'быстро', 'много раз'],
    description: 'Автокликер',
    generate: (p) => `; Автокликер\nLoop, ${p.count || '10'}\n{\n    Click\n    Sleep, ${p.delay || '100'}\n}\n`,
  },
  {
    keywords: ['сообщение', 'msgbox', 'диалог', 'уведомление'],
    description: 'Показать сообщение',
    generate: (p) => `; Сообщение\nMsgBox, ${p.text || 'Привет!'}\n`,
  },
  {
    keywords: ['горячая клавиша', 'hotkey', 'комбинация', 'кнопка'],
    description: 'Горячая клавиша',
    generate: (p) => `; Горячая клавиша\n${p.keys || '^!h'}::\n    ; действия\n    return\n`,
  },
  {
    keywords: ['переменная', 'variable'],
    description: 'Переменная',
    generate: (p) => `; Переменная\n${p.name || 'myVar'} := ${p.value || '"значение"'}\n`,
  },
  {
    keywords: ['файл', 'file', 'читать', 'записать'],
    description: 'Работа с файлами',
    generate: (p) => `; Чтение файла\nFileRead, content, ${p.path || 'C:\\file.txt'}\nMsgBox, % content\n`,
  },
  {
    keywords: ['пиксель', 'цвет', 'pixel', 'поиск цвета'],
    description: 'Поиск пикселя',
    generate: () => `; Поиск пикселя\nPixelSearch, foundX, foundY, 0, 0, 1920, 1080, 0xFF0000, 10\nif ErrorLevel\n    MsgBox, Пиксель не найден\nelse\n    MsgBox, Пиксель найден: %foundX%, %foundY%\n`,
  },
  {
    keywords: ['изображение', 'картинка', 'image', 'поиск изображения'],
    description: 'Поиск изображения',
    generate: () => `; Поиск изображения\nImageSearch, foundX, foundY, 0, 0, 1920, 1080, image.png\nif ErrorLevel\n    MsgBox, Изображение не найдено\nelse\n    MsgBox, Найдено: %foundX%, %foundY%\n`,
  },
  {
    keywords: ['игра', 'game', 'автоматизация игры'],
    description: 'Автоматизация для игры',
    generate: () => `; Автоматизация для игры\n#IfWinActive, GameWindow\nF1::\n    Loop, 10\n    {\n        Click\n        Sleep, 100\n    }\n    return\n#IfWinActive\n`,
  },
];

function analyzeText(text: string): { matched: Pattern[]; params: Record<string, string> } {
  const lower = text.toLowerCase();
  const matched: Pattern[] = [];
  const params: Record<string, string> = {};

  // Извлечение параметров
  const numMatch = text.match(/(\d+)\s*(мс|сек|секунд|раз|ms|sec)/i);
  if (numMatch) {
    const num = parseInt(numMatch[1]);
    const unit = numMatch[2].toLowerCase();
    if (unit === 'мс' || unit === 'ms') params.ms = String(num);
    else if (unit === 'сек' || unit === 'секунд' || unit === 'sec') params.ms = String(num * 1000);
    else if (unit === 'раз') params.count = String(num);
  }

  // Извлечение координат
  const coordMatch = text.match(/(\d+)\s*[xх,]\s*(\d+)/);
  if (coordMatch) {
    params.x = coordMatch[1];
    params.y = coordMatch[2];
  }

  // Извлечение текста в кавычках
  const quoteMatch = text.match(/[""«»]([^""«»]+)[""«»]/);
  if (quoteMatch) params.text = quoteMatch[1];

  // Извлечение горячих клавиш
  const hotkeyMatch = text.match(/(?:ctrl|alt|shift|win|ф1-ф12|f1-f12|\w)\s*(?:\+\s*(?:ctrl|alt|shift|win|\w))+/i);
  if (hotkeyMatch) params.keys = hotkeyMatch[0];

  for (const pattern of patterns) {
    for (const keyword of pattern.keywords) {
      if (lower.includes(keyword)) {
        matched.push(pattern);
        break;
      }
    }
  }

  return { matched, params };
}

export default function TextToMacro({ onCodeGenerated }: TextToMacroProps) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ matched: Pattern[]; params: Record<string, string> } | null>(null);

  const handleAnalyze = () => {
    if (!input.trim()) return;
    const analysis = analyzeText(input);
    setResult(analysis);
  };

  const handleGenerate = () => {
    if (!result || result.matched.length === 0) return;
    let code = '; Сгенерировано из описания\n';
    code += `; Описание: "${input}"\n\n`;
    for (const pattern of result.matched) {
      code += pattern.generate(result.params);
      code += '\n';
    }
    onCodeGenerated(code);
  };

  return (
    <div className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} className="text-yellow-400" />
        <h3 className="text-sm font-bold text-white">Генератор макросов из описания</h3>
        <Tooltip content="Опишите что нужно сделать, и система создаст макрос. Примеры: 'открыть блокнот', 'клик в 100x200', 'цикл 10 раз'">
          <span className="text-xs text-gray-500 cursor-help">(?)</span>
        </Tooltip>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          placeholder="Опишите макрос: 'открыть блокнот', 'клик в 500x500', 'цикл 10 раз'..."
          className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
        />
        <Tooltip content="Анализировать описание и предложить макрос">
          <button
            onClick={handleAnalyze}
            className="px-4 py-2 rounded bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-medium"
          >
            Анализ
          </button>
        </Tooltip>
      </div>

      {result && (
        <div className="mt-3">
          {result.matched.length === 0 ? (
            <div className="text-sm text-gray-400">
              Не удалось распознать описание. Попробуйте: "открыть блокнот", "клик в 100x200", "пауза 500мс"
            </div>
          ) : (
            <>
              <div className="text-xs text-gray-400 mb-2">
                Распознано: {result.matched.map(p => p.description).join(', ')}
              </div>
              <Tooltip content="Сгенерировать AHK код и вставить в редактор">
                <button
                  onClick={handleGenerate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-green-600 hover:bg-green-500 text-white text-sm font-medium"
                >
                  <ArrowRight size={14} /> Сгенерировать и вставить
                </button>
              </Tooltip>
            </>
          )}
        </div>
      )}
    </div>
  );
}
