import { useState } from 'react';
import { lessons } from '../data/ahkData';
import { BookOpen, CheckCircle, ChevronRight, Eye, Lightbulb, Award } from 'lucide-react';

interface LearningProps {
  onInsertCode: (code: string) => void;
}

export default function Learning({ onInsertCode }: LearningProps) {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('ahk-completed-lessons');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const currentLesson = lessons.find(l => l.id === selectedLesson);

  const markComplete = (id: string) => {
    const newCompleted = new Set(completedLessons);
    newCompleted.add(id);
    setCompletedLessons(newCompleted);
    localStorage.setItem('ahk-completed-lessons', JSON.stringify([...newCompleted]));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-900/50 text-green-300 border-green-700/30';
      case 'intermediate': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700/30';
      case 'advanced': return 'bg-red-900/50 text-red-300 border-red-700/30';
      default: return 'bg-gray-900/50 text-gray-300 border-gray-700/30';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🟢 Начальный';
      case 'intermediate': return '🟡 Средний';
      case 'advanced': return '🔴 Продвинутый';
      default: return difficulty;
    }
  };

  return (
    <div className="h-full flex">
      {/* Lesson List */}
      <div className="w-80 border-r border-gray-700 overflow-y-auto bg-gray-800/30">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen size={20} className="text-blue-400" />
            Обучение AHK
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <Award size={14} className="text-yellow-400" />
            <span className="text-sm text-gray-400">
              Пройдено: {completedLessons.size} / {lessons.length}
            </span>
          </div>
          <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${(completedLessons.size / lessons.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-2">
          {lessons.map((lesson, index) => (
            <button
              key={lesson.id}
              onClick={() => { setSelectedLesson(lesson.id); setShowSolution(false); }}
              className={`w-full text-left px-3 py-3 rounded-lg mb-1 transition-all ${
                selectedLesson === lesson.id
                  ? 'bg-blue-900/40 border border-blue-600/50'
                  : 'hover:bg-gray-700/50 border border-transparent'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {completedLessons.has(lesson.id) ? (
                    <CheckCircle size={18} className="text-green-400" />
                  ) : (
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-600 flex items-center justify-center text-xs text-gray-500">
                      {index + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-white truncate">{lesson.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5 truncate">{lesson.description}</div>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(lesson.difficulty)}`}>
                    {getDifficultyLabel(lesson.difficulty)}
                  </span>
                </div>
                <ChevronRight size={16} className="text-gray-500 mt-1" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lesson Content */}
      <div className="flex-1 overflow-y-auto">
        {!currentLesson ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">Выберите урок для начала</p>
              <p className="text-sm mt-2">Уроки расположены от простого к сложному</p>
            </div>
          </div>
        ) : (
          <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">{currentLesson.title}</h1>
              <p className="text-gray-400">{currentLesson.description}</p>
              <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full border ${getDifficultyColor(currentLesson.difficulty)}`}>
                {getDifficultyLabel(currentLesson.difficulty)}
              </span>
            </div>

            {/* Content */}
            <div className="prose prose-invert max-w-none mb-8">
              <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700 text-gray-200 leading-relaxed whitespace-pre-wrap">
                {currentLesson.content}
              </div>
            </div>

            {/* Exercise */}
            {currentLesson.exercise && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
                  <Lightbulb size={20} />
                  Практическое задание:
                </h3>
                <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                  <p className="text-blue-200">{currentLesson.exercise}</p>
                </div>
              </div>
            )}

            {/* Solution */}
            {currentLesson.solution && (
              <div className="mb-6">
                {!showSolution ? (
                  <button
                    onClick={() => setShowSolution(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
                  >
                    <Eye size={16} />
                    Показать решение
                  </button>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-green-400 flex items-center gap-2">
                        <CheckCircle size={20} />
                        Решение:
                      </h3>
                      <button
                        onClick={() => onInsertCode(currentLesson.solution!)}
                        className="text-xs px-3 py-1.5 rounded bg-green-900/50 text-green-300 hover:bg-green-800/50 transition-colors"
                      >
                        Вставить в редактор
                      </button>
                    </div>
                    <pre className="bg-black/50 rounded-lg p-4 text-sm text-gray-200 overflow-x-auto border border-gray-700">
                      <code>{currentLesson.solution}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Complete button */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              {!completedLessons.has(currentLesson.id) ? (
                <button
                  onClick={() => markComplete(currentLesson.id)}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium transition-all shadow-lg shadow-green-900/30"
                >
                  ✓ Отметить как пройденный
                </button>
              ) : (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle size={20} />
                  <span className="font-medium">Урок пройден!</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
