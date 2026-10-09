import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Loader2 } from 'lucide-react';
import Tooltip from './Tooltip';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AIChatProps {
  onCodeGenerated?: (code: string) => void;
}

export default function AIChat({ onCodeGenerated }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Загружаем Puter.js если ещё не загружен
      if (!(window as any).puter) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://js.puter.com/v2/';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Puter.js'));
          document.head.appendChild(script);
        });
      }

      const puter = (window as any).puter;
      
      // Формируем контекст из истории сообщений
      const context = messages.map(m => `${m.role === 'user' ? 'Пользователь' : 'Ассистент'}: ${m.content}`).join('\n');
      const prompt = `Ты — эксперт по AutoHotkey v1.1. Отвечай на русском языке. Помогай пользователям создавать макросы, объяснять код и решать проблемы с AHK.

История диалога:
${context}

Пользователь: ${input}

Ассистент:`;

      const response = await puter.ai.chat(prompt, {
        model: 'gpt-4o-mini'
      });

      let result = typeof response === 'string' ? response : response?.message?.content || response?.text || '';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Проверяем, есть ли в ответе код AHK
      const codeMatch = result.match(/```(?:ahk|autohotkey)?\n?([\s\S]*?)```/);
      if (codeMatch && onCodeGenerated) {
        // Можно предложить вставить код
      }
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Извините, произошла ошибка при обработке запроса. Попробуйте ещё раз.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm('Очистить историю чата?')) {
      setMessages([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-purple-400" />
          <h3 className="text-sm font-bold text-white">ИИ-помощник по AHK</h3>
        </div>
        <Tooltip content="Очистить историю чата">
          <button
            onClick={clearChat}
            className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
          >
            <Trash2 size={16} />
          </button>
        </Tooltip>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center max-w-md">
              <Bot size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg mb-2">Задайте вопрос по AutoHotkey</p>
              <p className="text-sm">
                Я помогу вам создать макрос, объяснить код или решить проблему с AHK.
                Примеры вопросов:
              </p>
              <ul className="text-xs mt-2 space-y-1 text-left">
                <li>• "Как создать автокликер?"</li>
                <li>• "Объясни этот код: ..."</li>
                <li>• "Как найти пиксель на экране?"</li>
                <li>• "Как переключаться между окнами?"</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center">
                    <Bot size={16} className="text-purple-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                  <div className="text-xs opacity-50 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center">
                  <Bot size={16} className="text-purple-400" />
                </div>
                <div className="bg-gray-800 rounded-lg px-4 py-2">
                  <Loader2 size={16} className="animate-spin text-purple-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 p-4 bg-gray-800/50">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Задайте вопрос по AutoHotkey... (Enter для отправки, Shift+Enter для новой строки)"
            className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
            rows={2}
            disabled={isLoading}
          />
          <Tooltip content="Отправить сообщение">
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium transition-colors"
            >
              <Send size={16} />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
