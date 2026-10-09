import { useState } from 'react';
import { ahkDocumentation } from '../data/ahkData';
import { Search, BookOpen, Code, Lightbulb } from 'lucide-react';

interface DocumentationProps {
  onInsertExample: (code: string) => void;
}

export default function Documentation({ onInsertExample }: DocumentationProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = ['all', ...new Set(ahkDocumentation.map(d => d.category))];

  const filtered = ahkDocumentation.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-gray-700 bg-gray-800/50">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по документации..."
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2 mt-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {cat === 'all' ? 'Все' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.map(doc => (
          <div
            key={doc.id}
            className="border border-gray-700 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(expandedId === doc.id ? null : doc.id)}
              className="w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-blue-400" />
                <span className="font-medium text-white">{doc.title}</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">
                  {doc.category}
                </span>
              </div>
            </button>

            {expandedId === doc.id && (
              <div className="px-4 py-4 bg-gray-900/50 space-y-4">
                {/* Description */}
                <p className="text-gray-300 text-sm leading-relaxed">{doc.content}</p>

                {/* Example */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Code size={14} className="text-green-400" />
                    <span className="text-sm font-medium text-green-400">Пример кода:</span>
                    <button
                      onClick={() => onInsertExample(doc.example)}
                      className="ml-auto text-xs px-2 py-1 rounded bg-green-900/50 text-green-300 hover:bg-green-800/50 transition-colors"
                    >
                      Вставить в редактор
                    </button>
                  </div>
                  <pre className="bg-black/50 rounded-lg p-3 text-sm text-gray-200 overflow-x-auto border border-gray-700">
                    <code>{doc.example}</code>
                  </pre>
                </div>

                {/* Explanation */}
                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={14} className="text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-400">Объяснение:</span>
                  </div>
                  <p className="text-sm text-yellow-200/80 leading-relaxed">{doc.explanation}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Search size={32} className="mx-auto mb-3 opacity-50" />
            <p>Ничего не найдено</p>
            <p className="text-sm">Попробуйте изменить поисковый запрос</p>
          </div>
        )}
      </div>
    </div>
  );
}
