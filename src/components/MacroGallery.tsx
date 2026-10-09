import { useState, useEffect } from 'react';
import { GalleryVertical, Star, Download, Trash2, Plus, Search } from 'lucide-react';
import Tooltip from './Tooltip';

interface MacroGalleryProps {
  onLoadCode: (code: string) => void;
}

interface MacroTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  code: string;
  rating: number;
  downloads: number;
  author: string;
  createdAt: number;
}

const defaultTemplates: MacroTemplate[] = [
  {
    id: '1',
    name: 'Автоматический набор текста',
    description: 'Быстрая вставка стандартных ответов',
    category: 'Работа',
    code: `; Автоматический набор текста
; Нажмите Ctrl+Shift+T для вставки

^+t::
    Send, Спасибо за обращение! Мы ответим в ближайшее время.{Enter}
    return`,
    rating: 4.5,
    downloads: 150,
    author: 'AHK Editor',
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: '2',
    name: 'Автокликер для игр',
    description: 'Быстрые клики с настраиваемой скоростью',
    category: 'Игры',
    code: `; Автокликер для игр
; F1 - начать/остановить
; F2 - увеличить скорость
; F3 - уменьшить скорость

#SingleInstance Force
speed := 100

F1::
    Toggle := !Toggle
    if Toggle {
        SetTimer, Click, %speed%
        ToolTip, Автокликер ВКЛ
    } else {
        SetTimer, Click, Off
        ToolTip
    }
    return

Click:
    Click
    return

F2::
    speed := Max(10, speed - 10)
    if Toggle
        SetTimer, Click, %speed%
    ToolTip, Скорость: %speed%мс
    return

F3::
    speed := speed + 10
    if Toggle
        SetTimer, Click, %speed%
    ToolTip, Скорость: %speed%мс
    return`,
    rating: 4.8,
    downloads: 320,
    author: 'AHK Editor',
    createdAt: Date.now() - 86400000 * 60,
  },
  {
    id: '3',
    name: 'Переключение между окнами',
    description: 'Быстрое переключение между рабочими приложениями',
    category: 'Работа',
    code: `; Переключение между окнами
; Win+1 - Блокнот
; Win+2 - Калькулятор
; Win+3 - Проводник

#1::
    if WinExist("Блокнот")
        WinActivate
    else
        Run, notepad.exe
    return

#2::
    if WinExist("Калькулятор")
        WinActivate
    else
        Run, calc.exe
    return

#3::
    if WinExist("Проводник")
        WinActivate
    else
        Run, explorer.exe
    return`,
    rating: 4.3,
    downloads: 89,
    author: 'AHK Editor',
    createdAt: Date.now() - 86400000 * 45,
  },
  {
    id: '4',
    name: 'Скриншот с уведомлением',
    description: 'Создание скриншота с звуковым уведомлением',
    category: 'Утилиты',
    code: `; Скриншот с уведомлением
; PrintScreen - сделать скриншот

PrintScreen::
    Send, {PrintScreen}
    SoundBeep, 1000, 100
    ToolTip, Скриншот сохранён!
    Sleep, 2000
    ToolTip
    return`,
    rating: 4.0,
    downloads: 67,
    author: 'AHK Editor',
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: '5',
    name: 'Горячие строки для email',
    description: 'Быстрая вставка email адресов',
    category: 'Работа',
    code: `; Горячие строки для email
; Напишите @@ для вставки основного email
; Напишите @w для вставки рабочего email

::@@::myemail@example.com
::@w::work@company.com
::@p::personal@gmail.com`,
    rating: 4.6,
    downloads: 134,
    author: 'AHK Editor',
    createdAt: Date.now() - 86400000 * 15,
  },
];

export default function MacroGallery({ onLoadCode }: MacroGalleryProps) {
  const [templates, setTemplates] = useState<MacroTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');

  useEffect(() => {
    // Загружаем пользовательские шаблоны из localStorage
    const saved = localStorage.getItem('ahk-custom-macros');
    const customMacros: MacroTemplate[] = saved ? JSON.parse(saved) : [];
    setTemplates([...defaultTemplates, ...customMacros]);
  }, []);

  const categories = ['Все', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Все' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const loadTemplate = (template: MacroTemplate) => {
    onLoadCode(template.code);
  };

  const deleteCustomMacro = (id: string) => {
    if (!confirm('Удалить этот макрос?')) return;
    
    const saved = localStorage.getItem('ahk-custom-macros');
    const customMacros: MacroTemplate[] = saved ? JSON.parse(saved) : [];
    const updated = customMacros.filter(m => m.id !== id);
    localStorage.setItem('ahk-custom-macros', JSON.stringify(updated));
    
    // Перезагружаем список
    setTemplates([...defaultTemplates, ...updated]);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={12}
          className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
        />
      );
    }
    return stars;
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700 bg-gray-800/50">
        <GalleryVertical size={20} className="text-purple-400" />
        <h3 className="text-sm font-bold text-white">Галерея макросов</h3>
        <div className="flex-1" />
        <span className="text-xs text-gray-400">
          {templates.length} шаблонов
        </span>
      </div>

      {/* Search and Filter */}
      <div className="p-4 border-b border-gray-700 bg-gray-800/30">
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск макросов..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-purple-600/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white mb-1">{template.name}</h4>
                  <p className="text-xs text-gray-400">{template.description}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-purple-900/30 text-purple-300 border border-purple-700/30">
                  {template.category}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  {renderStars(template.rating)}
                  <span className="ml-1">{template.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download size={12} />
                  <span>{template.downloads}</span>
                </div>
                <div>by {template.author}</div>
              </div>

              <div className="flex gap-2">
                <Tooltip content="Загрузить макрос в редактор">
                  <button
                    onClick={() => loadTemplate(template)}
                    className="flex-1 px-3 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
                  >
                    <Download size={12} className="inline mr-1" />
                    Загрузить
                  </button>
                </Tooltip>
                {!defaultTemplates.find(t => t.id === template.id) && (
                  <Tooltip content="Удалить пользовательский макрос">
                    <button
                      onClick={() => deleteCustomMacro(template.id)}
                      className="px-3 py-2 rounded bg-red-900/30 hover:bg-red-800/40 text-red-300 text-xs border border-red-700/30"
                    >
                      <Trash2 size={12} />
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Search size={48} className="mx-auto mb-4 text-gray-500 opacity-30" />
              <p className="text-gray-400">Макросы не найдены</p>
              <p className="text-sm text-gray-500 mt-2">
                Попробуйте изменить поисковый запрос
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
