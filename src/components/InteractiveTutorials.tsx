import { useState, useEffect } from 'react';
import { tutorials, achievements, Tutorial, TutorialStep } from '../data/tutorialData';
import { BookOpen, CheckCircle, Lock, Trophy, ChevronRight, Lightbulb, RotateCcw } from 'lucide-react';
import Tooltip from './Tooltip';
import CodeEditor from './CodeEditor';

interface InteractiveTutorialsProps {
  onInsertCode?: (code: string) => void;
}

export default function InteractiveTutorials({ onInsertCode }: InteractiveTutorialsProps) {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set());
  const [earnedAchievements, setEarnedAchievements] = useState<Set<string>>(new Set());
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [validationResult, setValidationResult] = useState<'pending' | 'success' | 'error'>('pending');

  // Загрузка прогресса из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ahk-tutorial-progress');
    if (saved) {
      const data = JSON.parse(saved);
      setCompletedSteps(new Set(data.completedSteps || []));
      setCompletedTutorials(new Set(data.completedTutorials || []));
      setEarnedAchievements(new Set(data.earnedAchievements || []));
    }
  }, []);

  // Сохранение прогресса
  const saveProgress = (steps: Set<string>, tutorialsSet: Set<string>, achievementsSet: Set<string>) => {
    localStorage.setItem('ahk-tutorial-progress', JSON.stringify({
      completedSteps: Array.from(steps),
      completedTutorials: Array.from(tutorialsSet),
      earnedAchievements: Array.from(achievementsSet),
    }));
  };

  const currentStep = selectedTutorial?.steps[currentStepIndex];

  const handleCheckSolution = () => {
    if (!currentStep) return;
    
    const isValid = currentStep.validation(userCode);
    setValidationResult(isValid ? 'success' : 'error');

    if (isValid) {
      // Добавляем шаг в выполненные
      const newCompletedSteps = new Set(completedSteps);
      newCompletedSteps.add(currentStep.id);
      setCompletedSteps(newCompletedSteps);

      // Проверяем, завершён ли урок
      if (selectedTutorial) {
        const allStepsCompleted = selectedTutorial.steps.every(step => 
          newCompletedSteps.has(step.id)
        );

        if (allStepsCompleted) {
          // Добавляем урок в завершённые
          const newCompletedTutorials = new Set(completedTutorials);
          newCompletedTutorials.add(selectedTutorial.id);
          setCompletedTutorials(newCompletedTutorials);

          // Добавляем достижения
          const newEarnedAchievements = new Set(earnedAchievements);
          selectedTutorial.achievements.forEach(ach => newEarnedAchievements.add(ach));
          setEarnedAchievements(newEarnedAchievements);

          saveProgress(newCompletedSteps, newCompletedTutorials, newEarnedAchievements);

          // Показываем уведомление о завершении
          setTimeout(() => {
            alert(`🎉 Поздравляем! Вы завершили урок "${selectedTutorial.title}"!`);
          }, 500);
        } else {
          saveProgress(newCompletedSteps, completedTutorials, earnedAchievements);
        }
      }
    }
  };

  const handleNextStep = () => {
    if (!selectedTutorial) return;
    
    if (currentStepIndex < selectedTutorial.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setUserCode('');
      setValidationResult('pending');
      setShowHint(false);
      setShowSolution(false);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setUserCode('');
      setValidationResult('pending');
      setShowHint(false);
      setShowSolution(false);
    }
  };

  const handleResetStep = () => {
    setUserCode('');
    setValidationResult('pending');
    setShowHint(false);
    setShowSolution(false);
  };

  const handleLoadSolution = () => {
    if (currentStep) {
      setUserCode(currentStep.solution);
      setShowSolution(true);
    }
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

  // Список уроков
  if (!selectedTutorial) {
    return (
      <div className="h-full flex">
        {/* Список уроков */}
        <div className="w-96 border-r border-gray-700 overflow-y-auto bg-gray-800/30">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen size={20} className="text-blue-400" />
              Интерактивные уроки
            </h2>
            <div className="mt-2 flex items-center gap-2">
              <Trophy size={14} className="text-yellow-400" />
              <span className="text-sm text-gray-400">
                Пройдено: {completedTutorials.size} / {tutorials.length}
              </span>
            </div>
            <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${(completedTutorials.size / tutorials.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-2">
            {tutorials.map((tutorial) => {
              const isCompleted = completedTutorials.has(tutorial.id);
              const completedStepsCount = tutorial.steps.filter(step => 
                completedSteps.has(step.id)
              ).length;
              const progress = (completedStepsCount / tutorial.steps.length) * 100;

              return (
                <button
                  key={tutorial.id}
                  onClick={() => {
                    setSelectedTutorial(tutorial);
                    setCurrentStepIndex(0);
                    setUserCode('');
                    setValidationResult('pending');
                  }}
                  className={`w-full text-left px-3 py-3 rounded-lg mb-2 transition-all ${
                    isCompleted
                      ? 'bg-green-900/20 border border-green-600/30'
                      : 'hover:bg-gray-700/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <CheckCircle size={20} className="text-green-400" />
                      ) : progress > 0 ? (
                        <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-white">{tutorial.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{tutorial.description}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(tutorial.difficulty)}`}>
                          {getDifficultyLabel(tutorial.difficulty)}
                        </span>
                        <span className="text-xs text-gray-500">⏱️ {tutorial.estimatedTime}</span>
                      </div>
                      {progress > 0 && !isCompleted && (
                        <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-gray-500 mt-1" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Достижения */}
          <div className="p-4 border-t border-gray-700">
            <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
              <Trophy size={16} className="text-yellow-400" />
              Достижения ({earnedAchievements.size}/{achievements.length})
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {achievements.map(ach => {
                const isEarned = earnedAchievements.has(ach.id);
                return (
                  <Tooltip key={ach.id} content={`${ach.title}: ${ach.description}`}>
                    <div
                      className={`aspect-square rounded-lg flex items-center justify-center text-2xl ${
                        isEarned
                          ? 'bg-yellow-900/30 border border-yellow-600/50'
                          : 'bg-gray-800/50 border border-gray-700 opacity-30'
                      }`}
                    >
                      {ach.icon}
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>

        {/* Контент */}
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Выберите урок для начала</p>
            <p className="text-sm mt-2">Уроки расположены от простого к сложному</p>
          </div>
        </div>
      </div>
    );
  }

  // Прохождение урока
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedTutorial(null)}
            className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
          >
            ← Назад
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{selectedTutorial.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">
                Шаг {currentStepIndex + 1} из {selectedTutorial.steps.length}
              </span>
              <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden max-w-xs">
                <div 
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${((currentStepIndex + 1) / selectedTutorial.steps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {currentStep && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Instructions */}
          <div className="w-96 border-r border-gray-700 overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{currentStep.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{currentStep.description}</p>
              </div>

              <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                <h4 className="text-sm font-bold text-blue-400 mb-2">📝 Задание:</h4>
                <p className="text-sm text-blue-200">{currentStep.task}</p>
              </div>

              {showHint && currentStep.hint && (
                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2">
                    <Lightbulb size={14} />
                    Подсказка:
                  </h4>
                  <p className="text-sm text-yellow-200">{currentStep.hint}</p>
                </div>
              )}

              {showSolution && (
                <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-green-400 mb-2">✅ Решение:</h4>
                  <pre className="text-xs text-green-200 bg-black/30 rounded p-2 overflow-x-auto">
                    <code>{currentStep.solution}</code>
                  </pre>
                </div>
              )}

              <div className="flex gap-2">
                <Tooltip content="Показать подсказку">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="flex-1 px-3 py-2 rounded bg-yellow-900/30 hover:bg-yellow-800/40 text-yellow-300 text-sm border border-yellow-700/30"
                  >
                    <Lightbulb size={14} className="inline mr-1" />
                    {showHint ? 'Скрыть' : 'Подсказка'}
                  </button>
                </Tooltip>
                <Tooltip content="Показать решение">
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="flex-1 px-3 py-2 rounded bg-green-900/30 hover:bg-green-800/40 text-green-300 text-sm border border-green-700/30"
                  >
                    <CheckCircle size={14} className="inline mr-1" />
                    {showSolution ? 'Скрыть' : 'Решение'}
                  </button>
                </Tooltip>
              </div>

              {/* Validation result */}
              {validationResult === 'success' && (
                <div className="bg-green-900/30 border border-green-600/50 rounded-lg p-3 text-center">
                  <CheckCircle size={24} className="mx-auto text-green-400 mb-2" />
                  <p className="text-sm text-green-300 font-medium">Отлично! Задание выполнено!</p>
                </div>
              )}

              {validationResult === 'error' && (
                <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-3 text-center">
                  <p className="text-sm text-red-300">Пока не совсем верно. Попробуйте ещё раз!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Code Editor */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              <CodeEditor
                value={userCode}
                onChange={setUserCode}
              />
            </div>

            {/* Actions */}
            <div className="p-3 border-t border-gray-700 bg-gray-800/50 flex items-center gap-2">
              <Tooltip content="Сбросить текущий шаг">
                <button
                  onClick={handleResetStep}
                  className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
                >
                  <RotateCcw size={14} className="inline mr-1" />
                  Сбросить
                </button>
              </Tooltip>
              <Tooltip content="Загрузить решение в редактор">
                <button
                  onClick={handleLoadSolution}
                  className="px-3 py-2 rounded bg-green-900/30 hover:bg-green-800/40 text-green-300 text-sm border border-green-700/30"
                >
                  Загрузить решение
                </button>
              </Tooltip>
              <div className="flex-1" />
              <Tooltip content="Проверить ваше решение">
                <button
                  onClick={handleCheckSolution}
                  disabled={!userCode.trim()}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium"
                >
                  Проверить
                </button>
              </Tooltip>
              {validationResult === 'success' && currentStepIndex < selectedTutorial.steps.length - 1 && (
                <Tooltip content="Перейти к следующему шагу">
                  <button
                    onClick={handleNextStep}
                    className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-white text-sm font-medium"
                  >
                    Далее →
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
