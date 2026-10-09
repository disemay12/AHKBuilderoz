export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  task: string;
  hint?: string;
  solution: string;
  validation: (code: string) => boolean;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  steps: TutorialStep[];
  achievements: string[];
}

export const tutorials: Tutorial[] = [
  {
    id: 'tutorial-1',
    title: 'Первый макрос: Приветствие',
    description: 'Создайте свой первый макрос, который показывает сообщение при нажатии горячей клавиши',
    difficulty: 'beginner',
    estimatedTime: '5 минут',
    steps: [
      {
        id: 'step-1',
        title: 'Создание горячей клавиши',
        description: 'Горячая клавиша позволяет запускать макрос по нажатию комбинации клавиш.',
        task: 'Создайте горячую клавишу Ctrl+Alt+H',
        hint: 'Используйте формат: ^!h::',
        solution: '^!h::\n    return',
        validation: (code) => {
          const normalized = code.replace(/\s+/g, '').toLowerCase();
          return normalized.includes('^!h::');
        }
      },
      {
        id: 'step-2',
        title: 'Добавление сообщения',
        description: 'Команда MsgBox показывает диалоговое окно с сообщением.',
        task: 'Добавьте команду MsgBox с текстом "Привет, мир!"',
        hint: 'Используйте: MsgBox, Текст сообщения',
        solution: '^!h::\n    MsgBox, Привет, мир!\n    return',
        validation: (code) => {
          const normalized = code.toLowerCase();
          return normalized.includes('msgbox') && normalized.includes('привет');
        }
      },
      {
        id: 'step-3',
        title: 'Завершение макроса',
        description: 'Команда return завершает выполнение горячей клавиши.',
        task: 'Убедитесь, что макрос завершается командой return',
        hint: 'Добавьте return после MsgBox',
        solution: '^!h::\n    MsgBox, Привет, мир!\n    return',
        validation: (code) => {
          const normalized = code.replace(/\s+/g, '').toLowerCase();
          return normalized.includes('return');
        }
      }
    ],
    achievements: ['first-macro', 'hotkey-master']
  },
  {
    id: 'tutorial-2',
    title: 'Автоматизация ввода текста',
    description: 'Научитесь автоматически вставлять текст по горячей клавише',
    difficulty: 'beginner',
    estimatedTime: '7 минут',
    steps: [
      {
        id: 'step-1',
        title: 'Горячая клавиша для вставки',
        description: 'Создайте горячую клавишу для быстрой вставки текста.',
        task: 'Создайте горячую клавишу Ctrl+Shift+T',
        hint: 'Используйте формат: ^+t::',
        solution: '^+t::\n    return',
        validation: (code) => {
          const normalized = code.replace(/\s+/g, '').toLowerCase();
          return normalized.includes('^+t::');
        }
      },
      {
        id: 'step-2',
        title: 'Команда Send',
        description: 'Команда Send эмулирует нажатия клавиш и ввод текста.',
        task: 'Добавьте команду Send для ввода текста "Спасибо за обращение!"',
        hint: 'Используйте: Send, Текст',
        solution: '^+t::\n    Send, Спасибо за обращение!\n    return',
        validation: (code) => {
          const normalized = code.toLowerCase();
          return normalized.includes('send') && normalized.includes('спасибо');
        }
      },
      {
        id: 'step-3',
        title: 'Добавление Enter',
        description: 'Специальные клавиши заключаются в фигурные скобки.',
        task: 'Добавьте нажатие Enter после текста',
        hint: 'Используйте {Enter} для.special клавиш',
        solution: '^+t::\n    Send, Спасибо за обращение!{Enter}\n    return',
        validation: (code) => {
          const normalized = code.toLowerCase();
          return normalized.includes('{enter}');
        }
      }
    ],
    achievements: ['text-automation', 'send-expert']
  },
  {
    id: 'tutorial-3',
    title: 'Работа с окнами',
    description: 'Научитесь управлять окнами приложений',
    difficulty: 'intermediate',
    estimatedTime: '10 минут',
    steps: [
      {
        id: 'step-1',
        title: 'Активация окна',
        description: 'Команда WinActivate делает окно активным.',
        task: 'Создайте горячую клавишу F1 для активации Блокнота',
        hint: 'Используйте: WinActivate, ahk_class Notepad',
        solution: 'F1::\n    WinActivate, ahk_class Notepad\n    return',
        validation: (code) => {
          const normalized = code.toLowerCase();
          return normalized.includes('winactivate') && 
                 (normalized.includes('notepad') || normalized.includes('блокнот'));
        }
      },
      {
        id: 'step-2',
        title: 'Ожидание окна',
        description: 'Команда WinWait ждёт появления окна.',
        task: 'Добавьте ожидание появления окна Блокнота',
        hint: 'Используйте: WinWait, ahk_class Notepad',
        solution: 'F1::\n    Run, notepad.exe\n    WinWait, ahk_class Notepad\n    return',
        validation: (code) => {
          const normalized = code.toLowerCase();
          return normalized.includes('winwait');
        }
      },
      {
        id: 'step-3',
        title: 'Запуск программы',
        description: 'Команда Run запускает программу.',
        task: 'Добавьте запуск Блокнота перед активацией',
        hint: 'Используйте: Run, notepad.exe',
        solution: 'F1::\n    Run, notepad.exe\n    WinWait, ahk_class Notepad\n    WinActivate, ahk_class Notepad\n    return',
        validation: (code) => {
          const normalized = code.toLowerCase();
          return normalized.includes('run') && normalized.includes('notepad');
        }
      }
    ],
    achievements: ['window-master', 'automation-pro']
  },
  {
    id: 'tutorial-4',
    title: 'Циклы и повторения',
    description: 'Научитесь использовать циклы для автоматизации повторяющихся действий',
    difficulty: 'intermediate',
    estimatedTime: '12 минут',
    steps: [
      {
        id: 'step-1',
        title: 'Простой цикл',
        description: 'Цикл Loop повторяет действия указанное количество раз.',
        task: 'Создайте горячую клавишу F2 с циклом на 5 итераций',
        hint: 'Используйте: Loop, 5',
        solution: 'F2::\n    Loop, 5\n    {\n    }\n    return',
        validation: (code) => {
          const normalized = code.toLowerCase();
          return normalized.includes('loop') && normalized.includes('5');
        }
      },
      {
        id: 'step-2',
        title: 'Действия в цикле',
        description: 'Внутри цикла можно выполнять любые команды.',
        task: 'Добавьте в цикл команду Send для ввода номера итерации',
        hint: 'Используйте A_Index для номера итерации',
        solution: 'F2::\n    Loop, 5\n    {\n        Send, Итерация %A_Index%{Enter}\n    }\n    return',
        validation: (code) => {
          const normalized = code.toLowerCase();
          return normalized.includes('send') && normalized.includes('a_index');
        }
      },
      {
        id: 'step-3',
        title: 'Задержка в цикле',
        description: 'Команда Sleep добавляет паузу между действиями.',
        task: 'Добавьте задержку 500мс между итерациями',
        hint: 'Используйте: Sleep, 500',
        solution: 'F2::\n    Loop, 5\n    {\n        Send, Итерация %A_Index%{Enter}\n        Sleep, 500\n    }\n    return',
        validation: (code) => {
          const normalized = code.toLowerCase();
          return normalized.includes('sleep') && normalized.includes('500');
        }
      }
    ],
    achievements: ['loop-master', 'automation-expert']
  }
];

export const achievements = [
  {
    id: 'first-macro',
    title: 'Первый макрос',
    description: 'Создан первый макрос',
    icon: '🎉'
  },
  {
    id: 'hotkey-master',
    title: 'Мастер горячих клавиш',
    description: 'Изучены горячие клавиши',
    icon: '⌨️'
  },
  {
    id: 'text-automation',
    title: 'Автоматизация текста',
    description: 'Автоматизирован ввод текста',
    icon: '📝'
  },
  {
    id: 'send-expert',
    title: 'Эксперт Send',
    description: 'Освоена команда Send',
    icon: '🚀'
  },
  {
    id: 'window-master',
    title: 'Мастер окон',
    description: 'Изучено управление окнами',
    icon: '🪟'
  },
  {
    id: 'automation-pro',
    title: 'Профи автоматизации',
    description: 'Завершены базовые уроки',
    icon: '⭐'
  },
  {
    id: 'loop-master',
    title: 'Мастер циклов',
    description: 'Изучены циклы',
    icon: '🔄'
  },
  {
    id: 'automation-expert',
    title: 'Эксперт автоматизации',
    description: 'Завершены все уроки',
    icon: '🏆'
  }
];
