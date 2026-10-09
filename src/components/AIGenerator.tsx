import { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, AlertCircle, Bot, Settings2 } from 'lucide-react';
import Tooltip from './Tooltip';

interface AIGeneratorProps {
  onCodeGenerated: (code: string) => void;
}

type AIModel = 'openai' | 'mistral' | 'llama' | 'deepseek';

const models: { id: AIModel; name: string; description: string }[] = [
  { id: 'openai', name: 'GPT (OpenAI)', description: 'Универсальная модель, хорошее понимание русского' },
  { id: 'mistral', name: 'Mistral', description: 'Быстрая модель, хорошо работает с кодом' },
  { id: 'llama', name: 'Llama', description: 'Открытая модель от Meta' },
  { id: 'deepseek', name: 'DeepSeek', description: 'Специализация на коде' },
];

const SYSTEM_PROMPT = `Ты — эксперт по AutoHotkey v1.1. Пользователь описывает макрос на русском языке, а ты генерируешь готовый AHK код.

ПРАВИЛА:
1. Возвращай ТОЛЬКО код AHK, без объяснений и markdown
2. Используй AutoHotkey v1.1 синтаксис (не v2)
3. Добавляй комментарии на русском языке
4. Если пользователь не указал горячую клавишу — используй F1 или другую свободную
5. Используй правильные модификаторы: ^ (Ctrl), ! (Alt), # (Win), + (Shift)
6. Для спец. клавиш используй {}: {Enter}, {Tab}, {Space}, {Esc}
7. Sleep в миллисекундах (1000 = 1 сек)
8. Добавляй Sleep между действиями для стабильности
9. Используй WinActivate для работы с окнами
10. Для поиска пикселей: PixelSearch, для изображений: ImageSearch

ПРИМЕРЫ:
Запрос: "макрос для автокликера по F1, 10 кликов с интервалом 100мс"
Ответ:
; Автокликер по F1
F1::
    Loop, 10
    {
        Click
        Sleep, 100
    }
    return

Запрос: "при нажатии Ctrl+Alt+T открывать блокнот и писать дату"
Ответ:
^!t::
    Run, notepad.exe
    WinWait, Блокнот
    Send, %A_DD%.%A_MM%.%A_YYYY%
    return

Запрос: "найти красный пиксель и кликнуть по нему"
Ответ:
F2::
    PixelSearch, px, py, 0, 0, 1920, 1080, 0xFF0000, 10
    if !ErrorLevel
    {
        Click, %px%, %py%
        MsgBox, Пиксель найден и кликнут!
    }
    else
    {
        MsgBox, Красный пиксель не найден
    }
    return`;

async function generateWithAI(description: string, model: AIModel): Promise<string> {
  const response = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: description },
      ],
      model: model,
      seed: Math.floor(Math.random() * 10000),
    }),
  });

  if (!response.ok) {
    throw new Error(`Ошибка API: ${response.status}`);
  }

  let result = await response.text();
  
  // Очистка ответа от markdown
  result = result.replace(/```ahk\n?/g, '').replace(/```\n?/g, '');
  result = result.replace(/```autohotkey\n?/g, '').replace(/```\n?/g, '');
  result = result.trim();
  
  return result;
}

export default function AIGenerator({ onCodeGenerated }: AIGeneratorProps) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>('openai');
  const [showSettings, setShowSettings] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const code = await generateWithAI(input, selectedModel);
      setResult(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка генерации');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = () => {
    if (result) {
      onCodeGenerated(result);
    }
  };

  const examples = [
    'Автокликер по F1, 10 кликов с интервалом 100мс',
    'При нажатии Ctrl+Alt+T открывать блокнот и писать текущую дату',
    'Найти красный пиксель на экране и кликнуть по нему',
    'Переключение между окнами Блокнот и Калькулятор по F2',
    'Макрос для игры: при нажатии F3 быстро нажимать 1, 2, 3 с задержкой 50мс',
    'При нажатии Win+N запускать Notepad++ и вставлять шаблон комментария',
  ];

  return (
    <div className="p-4 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-700/30 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Bot size={20} className="text-purple-400" />
        <h3 className="text-sm font-bold text-white">ИИ-генератор макросов</h3>
        <span className="text-xs text-gray-500">(Pollinations AI — бесплатно, без ключей)</span>
        <div className="flex-1" />
        <Tooltip content="Настройки модели ИИ">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
          >
            <Settings2 size={14} />
          </button>
        </Tooltip>
      </div>

      {showSettings && (
        <div className="mb-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Выберите модель ИИ:</div>
          <div className="grid grid-cols-2 gap-2">
            {models.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={`text-left p-2 rounded border text-xs transition-colors ${
                  selectedModel === m.id
                    ? 'bg-purple-900/50 border-purple-500 text-purple-200'
                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                <div className="font-medium">{m.name}</div>
                <div className="text-xs opacity-70 mt-0.5">{m.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Опишите макрос на русском языке... Например: 'макрос для автокликера по F1, 10 кликов с интервалом 100мс'"
          className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              handleGenerate();
            }
          }}
        />
        <Tooltip content="Сгенерировать AHK код через ИИ (Ctrl+Enter)">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Генерация...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Создать
              </>
            )}
          </button>
        </Tooltip>
      </div>

      {/* Примеры запросов */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1.5">Примеры запросов (кликните для использования):</div>
        <div className="flex flex-wrap gap-1.5">
          {examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => setInput(ex)}
              className="text-xs px-2 py-1 rounded bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white border border-gray-700/50 hover:border-gray-600 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="mb-3 p-2 rounded bg-red-900/30 border border-red-700/50 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Результат */}
      {result && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-green-400 font-medium">✓ Сгенерированный код:</div>
            <Tooltip content="Вставить сгенерированный код в редактор">
              <button
                onClick={handleInsert}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-green-600 hover:bg-green-500 text-white text-xs font-medium"
              >
                <ArrowRight size={12} /> Вставить в редактор
              </button>
            </Tooltip>
          </div>
          <pre className="bg-black/50 rounded-lg p-3 text-xs text-gray-200 overflow-x-auto border border-gray-700 max-h-64 overflow-y-auto">
            <code>{result}</code>
          </pre>
        </div>
      )}

      {/* Индикатор загрузки */}
      {isLoading && (
        <div className="mt-3 flex items-center gap-2 text-purple-400 text-xs">
          <Loader2 size={14} className="animate-spin" />
          ИИ генерирует код... Обычно занимает 3-10 секунд
        </div>
      )}
    </div>
  );
}
