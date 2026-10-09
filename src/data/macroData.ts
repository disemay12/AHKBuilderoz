import { MacroBlock, BlockType, HotkeyContainer } from '../types/ahk';

export interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: string;
  category: string;
  description: string;
  defaultParams: Record<string, string>;
  paramDescriptions: Record<string, string>;
  canHaveChildren?: boolean;
}

export const blockDefinitions: BlockDefinition[] = [
  // === Основные ===
  {
    type: 'send', icon: '⌨️', label: 'Отправить клавиши', category: 'Основные',
    description: 'Эмулирует нажатия клавиш и ввод текста',
    defaultParams: { text: 'Hello World', mode: 'Send' },
    paramDescriptions: {
      text: 'Текст или клавиши. Спец.: {Enter}, {Tab}, {Space}, {Esc}, {Ctrl down}, {Ctrl up}',
      mode: 'Send (обычный), SendInput (быстрый), SendPlay (для игр), SendRaw (без спец. символов)',
    },
  },
  {
    type: 'sendtext', icon: '📝', label: 'Отправить текст', category: 'Основные',
    description: 'Отправляет текст без обработки спец. символов',
    defaultParams: { text: 'Привет мир' },
    paramDescriptions: { text: 'Текст для отправки (как есть, без обработки)' },
  },
  {
    type: 'delay', icon: '⏱️', label: 'Задержка', category: 'Основные',
    description: 'Пауза между действиями в миллисекундах',
    defaultParams: { ms: '1000' },
    paramDescriptions: { ms: 'Задержка в мс (1000 = 1 сек). Минимум 10мс' },
  },
  {
    type: 'sleep', icon: '💤', label: 'Сон (Sleep)', category: 'Основные',
    description: 'Альтернатива задержке с проверкой прерываний',
    defaultParams: { ms: '1000', check: 'true' },
    paramDescriptions: {
      ms: 'Длительность в миллисекундах',
      check: 'Проверять прерывания (true/false)',
    },
  },
  {
    type: 'comment', icon: '💬', label: 'Комментарий', category: 'Основные',
    description: 'Комментарий в коде (игнорируется при выполнении)',
    defaultParams: { text: 'Описание действия' },
    paramDescriptions: { text: 'Текст комментария' },
  },
  {
    type: 'variable', icon: '📦', label: 'Переменная', category: 'Основные',
    description: 'Создать или изменить переменную',
    defaultParams: { name: 'myVar', value: '"текст"' },
    paramDescriptions: {
      name: 'Имя переменной (латиница, без пробелов)',
      value: 'Значение. Строки: "текст", числа: 42, выражения: x + 1',
    },
  },

  // === Мышь ===
  {
    type: 'click', icon: '🖱️', label: 'Клик мышью', category: 'Мышь',
    description: 'Клик в указанных координатах',
    defaultParams: { x: '100', y: '200', button: 'Left', count: '1' },
    paramDescriptions: {
      x: 'Координата X от левого края',
      y: 'Координата Y от верхнего края',
      button: 'Left (левая), Right (правая), Middle (средняя)',
      count: 'Количество кликов',
    },
  },
  {
    type: 'mousemove', icon: '➡️', label: 'Движение мыши', category: 'Мышь',
    description: 'Переместить курсор в указанные координаты',
    defaultParams: { x: '500', y: '500', speed: '2', relative: 'false' },
    paramDescriptions: {
      x: 'Координата X',
      y: 'Координата Y',
      speed: 'Скорость 0 (мгновенно) - 100 (медленно)',
      relative: 'Относительно текущей позиции (true/false)',
    },
  },

  // === Окна ===
  {
    type: 'findwindow', icon: '🔍', label: 'Поиск/активация окна', category: 'Окна',
    description: 'Найти, активировать или управлять окном',
    defaultParams: { title: 'Блокнот', action: 'WinActivate', class: '', process: '' },
    paramDescriptions: {
      title: 'Заголовок окна (или часть). "A" = активное окно',
      action: 'WinActivate, WinClose, WinMinimize, WinMaximize, WinHide, WinShow',
      class: 'Класс окна (ahk_class Notepad)',
      process: 'Имя процесса (notepad.exe)',
    },
  },
  {
    type: 'winwait', icon: '⏳', label: 'Ожидание окна', category: 'Окна',
    description: 'Ждать появления или активности окна',
    defaultParams: { title: 'Блокнот', timeout: '5', action: 'WinWait' },
    paramDescriptions: {
      title: 'Заголовок окна',
      timeout: 'Таймаут в секундах (пусто = бесконечно)',
      action: 'WinWait (появление), WinWaitActive (активность), WinWaitClose (закрытие)',
    },
  },

  // === Поиск и автоматизация ===
  {
    type: 'pixel', icon: '🎨', label: 'Поиск по пикселю', category: 'Автоматизация',
    description: 'Найти пиксель определённого цвета на экране',
    defaultParams: {
      color: '0xFFFFFF',
      x1: '0', y1: '0', x2: '1920', y2: '1080',
      variation: '10',
      resultX: 'foundX', resultY: 'foundY',
    },
    paramDescriptions: {
      color: 'Цвет в формате 0xRRGGBB (например, 0xFF0000 = красный)',
      x1: 'Левая граница области поиска',
      y1: 'Верхняя граница области поиска',
      x2: 'Правая граница области поиска',
      y2: 'Нижняя граница области поиска',
      variation: 'Допустимое отклонение цвета (0-255)',
      resultX: 'Имя переменной для X координаты',
      resultY: 'Имя переменной для Y координаты',
    },
  },
  {
    type: 'imagesearch', icon: '🖼️', label: 'Поиск по изображению', category: 'Автоматизация',
    description: 'Найти изображение на экране (шаблон)',
    defaultParams: {
      imagePath: 'image.png',
      x1: '0', y1: '0', x2: '1920', y2: '1080',
      resultX: 'foundX', resultY: 'foundY',
      variation: '50',
    },
    paramDescriptions: {
      imagePath: 'Путь к файлу изображения (PNG, BMP, GIF)',
      x1: 'Левая граница поиска',
      y1: 'Верхняя граница поиска',
      x2: 'Правая граница поиска',
      y2: 'Нижняя граница поиска',
      resultX: 'Переменная для X координаты найденного',
      resultY: 'Переменная для Y координаты найденного',
      variation: 'Допустимое отклонение (0-255)',
    },
  },

  // === Управление ===
  {
    type: 'loop', icon: '🔄', label: 'Цикл', category: 'Управление',
    description: 'Повторить действия несколько раз',
    defaultParams: { count: '5' },
    paramDescriptions: { count: 'Количество повторений (пусто = бесконечно)' },
    canHaveChildren: true,
  },
  {
    type: 'if', icon: '❓', label: 'Условие', category: 'Управление',
    description: 'Выполнить действия если условие истинно',
    defaultParams: { condition: 'x > 10' },
    paramDescriptions: { condition: 'Условие: x > 10, var = "текст", FileExist("file.txt")' },
    canHaveChildren: true,
  },
  {
    type: 'keywait', icon: '⏸️', label: 'Ожидание клавиши', category: 'Управление',
    description: 'Ждать нажатия или отпускания клавиши',
    defaultParams: { key: 'Space', timeout: '5', mode: 'down' },
    paramDescriptions: {
      key: 'Клавиша для ожидания (Space, Enter, a, F1 и т.д.)',
      timeout: 'Таймаут в секундах (пусто = бесконечно)',
      mode: 'down (нажатие) или up (отпускание)',
    },
  },

  // === Буфер обмена ===
  {
    type: 'clipboard', icon: '📋', label: 'Буфер обмена', category: 'Данные',
    description: 'Работа с буфером обмена',
    defaultParams: { action: 'set', text: 'Текст для буфера', variable: 'clipContent' },
    paramDescriptions: {
      action: 'set (записать), get (прочитать), clear (очистить), append (добавить)',
      text: 'Текст для записи в буфер',
      variable: 'Переменная для сохранения содержимого буфера',
    },
  },

  // === Файлы ===
  {
    type: 'file', icon: '📁', label: 'Операции с файлами', category: 'Данные',
    description: 'Читать, записывать, копировать файлы',
    defaultParams: { action: 'read', path: 'C:\\file.txt', content: 'Текст', variable: 'fileContent' },
    paramDescriptions: {
      action: 'read, write, append, delete, copy, move, exist',
      path: 'Путь к файлу',
      content: 'Текст для записи',
      variable: 'Переменная для результата чтения',
    },
  },

  // === Звук ===
  {
    type: 'sound', icon: '🔊', label: 'Звуковые команды', category: 'Другое',
    description: 'Воспроизвести звук или изменить громкость',
    defaultParams: { action: 'beep', frequency: '750', duration: '500', file: '' },
    paramDescriptions: {
      action: 'beep (сигнал), play (файл), volume (громкость)',
      frequency: 'Частота звука в Гц (37-32767)',
      duration: 'Длительность в мс',
      file: 'Путь к звуковому файлу',
    },
  },

  // === Программы ===
  {
    type: 'run', icon: '🚀', label: 'Запустить программу', category: 'Программы',
    description: 'Запустить программу, документ или URL',
    defaultParams: { program: 'notepad.exe', args: '', wait: 'false' },
    paramDescriptions: {
      program: 'Путь к программе или URL',
      args: 'Аргументы командной строки',
      wait: 'Ждать завершения (true/false)',
    },
  },
  {
    type: 'process', icon: '⚙️', label: 'Управление процессами', category: 'Программы',
    description: 'Проверить, закрыть или изменить приоритет процесса',
    defaultParams: { action: 'exist', name: 'notepad.exe', priority: 'Normal', variable: 'pid' },
    paramDescriptions: {
      action: 'exist (существует), close (закрыть), priority (приоритет)',
      name: 'Имя процесса',
      priority: 'Low, BelowNormal, Normal, AboveNormal, High',
      variable: 'Переменная для PID',
    },
  },

  // === Сообщения ===
  {
    type: 'msgbox', icon: '💬', label: 'Сообщение', category: 'Другое',
    description: 'Показать диалоговое окно',
    defaultParams: { title: 'Информация', text: 'Текст сообщения', buttons: 'OK' },
    paramDescriptions: {
      title: 'Заголовок окна',
      text: 'Текст сообщения. %переменная% для подстановки',
      buttons: 'OK, YesNo, YesNoCancel, OKCancel',
    },
  },
  {
    type: 'tooltip', icon: '💡', label: 'Всплывающая подсказка', category: 'Другое',
    description: 'Показать всплывающую подсказку',
    defaultParams: { text: 'Подсказка', x: '', y: '', duration: '2000' },
    paramDescriptions: {
      text: 'Текст подсказки',
      x: 'Координата X (пусто = у курсора)',
      y: 'Координата Y (пусто = у курсора)',
      duration: 'Время показа в мс (пусто = до отмены)',
    },
  },
  {
    type: 'tray', icon: '🔔', label: 'Уведомление в трее', category: 'Другое',
    description: 'Показать уведомление в области уведомлений',
    defaultParams: { title: 'AHK', text: 'Уведомление', duration: '3000', icon: 'info' },
    paramDescriptions: {
      title: 'Заголовок уведомления',
      text: 'Текст уведомления',
      duration: 'Время показа в мс',
      icon: 'info, warning, error',
    },
  },

  // === Реестр ===
  {
    type: 'regwrite', icon: '🗝️', label: 'Запись в реестр', category: 'Данные',
    description: 'Записать значение в реестр Windows',
    defaultParams: { key: 'HKCU\\Software\\MyApp', name: 'Setting', value: '1', type: 'REG_SZ' },
    paramDescriptions: {
      key: 'Путь к ключу реестра',
      name: 'Имя параметра',
      value: 'Значение',
      type: 'REG_SZ, REG_DWORD, REG_BINARY',
    },
  },
  {
    type: 'regread', icon: '🔑', label: 'Чтение из реестра', category: 'Данные',
    description: 'Прочитать значение из реестра Windows',
    defaultParams: { key: 'HKCU\\Software\\MyApp', name: 'Setting', variable: 'regValue' },
    paramDescriptions: {
      key: 'Путь к ключу реестра',
      name: 'Имя параметра',
      variable: 'Переменная для результата',
    },
  },

  // === Управление скриптом ===
  {
    type: 'label', icon: '🏷️', label: 'Метка (Label)', category: 'Скрипт',
    description: 'Создать метку для перехода',
    defaultParams: { name: 'MyLabel' },
    paramDescriptions: { name: 'Имя метки (латиница)' },
  },
  {
    type: 'return', icon: '↩️', label: 'Возврат', category: 'Скрипт',
    description: 'Вернуться из подпрограммы',
    defaultParams: {},
    paramDescriptions: {},
  },
  {
    type: 'exit', icon: '🚪', label: 'Выход', category: 'Скрипт',
    description: 'Завершить скрипт',
    defaultParams: {},
    paramDescriptions: {},
  },
  {
    type: 'reload', icon: '🔃', label: 'Перезагрузка', category: 'Скрипт',
    description: 'Перезагрузить скрипт',
    defaultParams: {},
    paramDescriptions: {},
  },
  {
    type: 'suspend', icon: '⏸️', label: 'Приостановить', category: 'Скрипт',
    description: 'Приостановить/возобновить скрипт',
    defaultParams: { state: 'toggle' },
    paramDescriptions: { state: 'toggle, on, off, permit' },
  },
  {
    type: 'pause', icon: '⏯️', label: 'Пауза', category: 'Скрипт',
    description: 'Поставить скрипт на паузу',
    defaultParams: { state: 'toggle' },
    paramDescriptions: { state: 'toggle, on, off' },
  },

  // === Настройки ===
  {
    type: 'coordmode', icon: '📐', label: 'Режим координат', category: 'Настройки',
    description: 'Установить систему координат',
    defaultParams: { target: 'Mouse', mode: 'Screen' },
    paramDescriptions: {
      target: 'Mouse, Pixel, Tooltip, Caret, Menu',
      mode: 'Screen (относительно экрана), Window, Client',
    },
  },
  {
    type: 'settitlematch', icon: '🔤', label: 'Режим поиска заголовка', category: 'Настройки',
    description: 'Установить режим поиска окон по заголовку',
    defaultParams: { mode: '2' },
    paramDescriptions: {
      mode: '1 (начало), 2 (содержит), 3 (точно), RegEx',
    },
  },

  // === Прочее ===
  {
    type: 'controlsend', icon: '🎯', label: 'Отправить в контроль', category: 'Другое',
    description: 'Отправить клавиши в конкретный элемент управления',
    defaultParams: { control: 'Edit1', keys: 'Hello', window: 'Блокнот' },
    paramDescriptions: {
      control: 'Имя или класс элемента (Edit1, Button1)',
      keys: 'Клавиши для отправки',
      window: 'Окно, содержащее элемент',
    },
  },
  {
    type: 'random', icon: '🎲', label: 'Случайное число', category: 'Другое',
    description: 'Сгенерировать случайное число',
    defaultParams: { variable: 'rnd', min: '1', max: '100' },
    paramDescriptions: {
      variable: 'Имя переменной для результата',
      min: 'Минимальное значение',
      max: 'Максимальное значение',
    },
  },
  {
    type: 'math', icon: '🧮', label: 'Математическая операция', category: 'Другое',
    description: 'Выполнить математическую операцию',
    defaultParams: { variable: 'result', expression: '2 + 2' },
    paramDescriptions: {
      variable: 'Имя переменной для результата',
      expression: 'Математическое выражение',
    },
  },
  {
    type: 'stringop', icon: '🔤', label: 'Операция со строкой', category: 'Другое',
    description: 'Преобразовать строку',
    defaultParams: { variable: 'result', operation: 'upper', input: 'текст' },
    paramDescriptions: {
      variable: 'Имя переменной для результата',
      operation: 'upper, lower, length, replace, substr, trim',
      input: 'Исходная строка',
    },
  },
  {
    type: 'format', icon: '📝', label: 'Форматирование', category: 'Другое',
    description: 'Форматировать строку',
    defaultParams: { variable: 'formatted', template: 'Привет, {}!', args: 'Мир' },
    paramDescriptions: {
      variable: 'Имя переменной для результата',
      template: 'Шаблон с {} для подстановки',
      args: 'Значения для подстановки',
    },
  },
];

export const blockCategories = [
  'Основные', 'Мышь', 'Окна', 'Автоматизация', 'Управление',
  'Данные', 'Программы', 'Другое', 'Скрипт', 'Настройки',
];

/**
 * Генерация AHK кода из блоков
 */
export function generateAHKCode(blocks: MacroBlock[], indent: number = 0): string {
  const pad = '    '.repeat(indent);
  let code = '';

  for (const block of blocks) {
    code += generateBlockCode(block, pad);
  }

  return code;
}

function generateBlockCode(block: MacroBlock, pad: string): string {
  let code = '';
  const p = block.params;

  switch (block.type) {
    case 'send':
      code += `${pad}${p.mode || 'Send'}, ${p.text}\n`;
      break;
    case 'sendtext':
      code += `${pad}SendText, ${p.text}\n`;
      break;
    case 'delay':
    case 'sleep':
      code += `${pad}Sleep, ${p.ms}\n`;
      break;
    case 'click':
      code += `${pad}Click, ${p.x}, ${p.y}, ${p.button}${p.count && p.count !== '1' ? `, ${p.count}` : ''}\n`;
      break;
    case 'mousemove':
      const rel = p.relative === 'true' ? 'R' : '';
      code += `${pad}MouseMove, ${p.x}, ${p.y}${p.speed ? `, ${p.speed}` : ''}${rel ? `, ${rel}` : ''}\n`;
      break;
    case 'findwindow':
      code += `${pad}${p.action || 'WinActivate'}, ${p.title || 'A'}\n`;
      break;
    case 'winwait':
      const timeout = p.timeout ? `, , ${p.timeout}` : '';
      code += `${pad}${p.action || 'WinWait'}, ${p.title}${timeout}\n`;
      break;
    case 'pixel':
      code += `${pad}PixelSearch, ${p.resultX}, ${p.resultY}, ${p.x1}, ${p.y1}, ${p.x2}, ${p.y2}, ${p.color}, ${p.variation || 0}\n`;
      break;
    case 'imagesearch':
      code += `${pad}ImageSearch, ${p.resultX}, ${p.resultY}, ${p.x1}, ${p.y1}, ${p.x2}, ${p.y2}, *${p.variation || 0} ${p.imagePath}\n`;
      break;
    case 'loop':
      code += `${pad}Loop, ${p.count}\n${pad}{\n`;
      if (block.children) code += generateAHKCode(block.children, pad.length / 4 + 1);
      code += `${pad}}\n`;
      return code;
    case 'if':
      code += `${pad}if (${p.condition})\n${pad}{\n`;
      if (block.children) code += generateAHKCode(block.children, pad.length / 4 + 1);
      code += `${pad}}\n`;
      return code;
    case 'keywait':
      const options = p.mode === 'up' ? ' D' : '';
      code += `${pad}KeyWait, ${p.key}${p.timeout ? `, T${p.timeout}` : ''}${options}\n`;
      break;
    case 'variable':
      code += `${pad}${p.name} := ${p.value}\n`;
      break;
    case 'comment':
      code += `${pad}; ${p.text}\n`;
      break;
    case 'run':
      const wait = p.wait === 'true' ? 'Wait' : '';
      code += `${pad}Run${wait}, ${p.program}${p.args ? `, , , ${p.args}` : ''}\n`;
      break;
    case 'process':
      if (p.action === 'exist') {
        code += `${pad}Process, Exist, ${p.name}\n${pad}${p.variable} := ErrorLevel\n`;
      } else if (p.action === 'close') {
        code += `${pad}Process, Close, ${p.name}\n`;
      } else if (p.action === 'priority') {
        code += `${pad}Process, Priority, ${p.name}, ${p.priority}\n`;
      }
      break;
    case 'msgbox':
      code += `${pad}MsgBox, % "${p.text}"\n`;
      break;
    case 'tooltip':
      code += `${pad}ToolTip, ${p.text}${p.x ? `, ${p.x}` : ''}${p.y ? `, ${p.y}` : ''}\n`;
      if (p.duration) code += `${pad}Sleep, ${p.duration}\n${pad}ToolTip\n`;
      break;
    case 'tray':
      code += `${pad}TrayTip, ${p.title}, ${p.text}, ${p.duration ? Math.floor(parseInt(p.duration) / 1000) : 3}\n`;
      break;
    case 'clipboard':
      if (p.action === 'set') code += `${pad}Clipboard := "${p.text}"\n`;
      else if (p.action === 'get') code += `${pad}${p.variable} := Clipboard\n`;
      else if (p.action === 'clear') code += `${pad}Clipboard :=\n`;
      else if (p.action === 'append') code += `${pad}Clipboard := Clipboard . "${p.text}"\n`;
      break;
    case 'file':
      if (p.action === 'read') code += `${pad}FileRead, ${p.variable}, ${p.path}\n`;
      else if (p.action === 'write') code += `${pad}FileDelete, ${p.path}\n${pad}FileAppend, ${p.content}, ${p.path}\n`;
      else if (p.action === 'append') code += `${pad}FileAppend, ${p.content}, ${p.path}\n`;
      else if (p.action === 'delete') code += `${pad}FileDelete, ${p.path}\n`;
      else if (p.action === 'copy') code += `${pad}FileCopy, ${p.path}, ${p.variable}\n`;
      else if (p.action === 'move') code += `${pad}FileMove, ${p.path}, ${p.variable}\n`;
      else if (p.action === 'exist') code += `${pad}if FileExist("${p.path}")\n`;
      break;
    case 'sound':
      if (p.action === 'beep') code += `${pad}SoundBeep, ${p.frequency}, ${p.duration}\n`;
      else if (p.action === 'play') code += `${pad}SoundPlay, ${p.file}\n`;
      else if (p.action === 'volume') code += `${pad}SoundSet, ${p.frequency}\n`;
      break;
    case 'regwrite':
      code += `${pad}RegWrite, ${p.type}, ${p.key}, ${p.name}, ${p.value}\n`;
      break;
    case 'regread':
      code += `${pad}RegRead, ${p.variable}, ${p.key}, ${p.name}\n`;
      break;
    case 'controlsend':
      code += `${pad}ControlSend, ${p.control}, ${p.keys}, ${p.window}\n`;
      break;
    case 'label':
      code += `${p.name}:\n`;
      break;
    case 'return':
      code += `${pad}return\n`;
      break;
    case 'exit':
      code += `${pad}ExitApp\n`;
      break;
    case 'reload':
      code += `${pad}Reload\n`;
      break;
    case 'suspend':
      code += `${pad}Suspend, ${p.state}\n`;
      break;
    case 'pause':
      code += `${pad}Pause, ${p.state}\n`;
      break;
    case 'coordmode':
      code += `${pad}CoordMode, ${p.target}, ${p.mode}\n`;
      break;
    case 'settitlematch':
      code += `${pad}SetTitleMatchMode, ${p.mode}\n`;
      break;
    case 'random':
      code += `${pad}Random, ${p.variable}, ${p.min}, ${p.max}\n`;
      break;
    case 'math':
      code += `${pad}${p.variable} := ${p.expression}\n`;
      break;
    case 'stringop':
      if (p.operation === 'upper') code += `${pad}StringUpper, ${p.variable}, ${p.input}\n`;
      else if (p.operation === 'lower') code += `${pad}StringLower, ${p.variable}, ${p.input}\n`;
      else if (p.operation === 'length') code += `${pad}StringLen, ${p.variable}, ${p.input}\n`;
      else if (p.operation === 'replace') code += `${pad}StringReplace, ${p.variable}, ${p.input}\n`;
      else if (p.operation === 'substr') code += `${pad}StringMid, ${p.variable}, ${p.input}\n`;
      else if (p.operation === 'trim') code += `${pad}StringTrimLeft, ${p.variable}, ${p.input}, 0\n`;
      break;
    case 'format':
      code += `${pad}${p.variable} := Format("${p.template}", ${p.args})\n`;
      break;
  }

  return code;
}

/**
 * Генерация кода из контейнеров горячих клавиш
 */
export function generateFromContainers(containers: HotkeyContainer[]): string {
  let code = '; Скрипт создан в AHK Script Editor\n';
  code += '; Дата: ' + new Date().toLocaleDateString('ru-RU') + '\n\n';

  for (const container of containers) {
    if (!container.enabled) continue;
    
    code += `; --- ${container.description || container.hotkey} ---\n`;
    code += `${container.hotkey}::\n`;
    code += generateAHKCode(container.blocks, 1);
    code += 'return\n\n';
  }

  return code;
}

/**
 * Шаблоны макросов для игр
 */
export const gameTemplates = [
  {
    name: '🎮 Авто-кликер',
    description: 'Быстрое нажатие клавиши с интервалом',
    hotkey: 'F1',
    blocks: [
      { type: 'loop' as BlockType, label: 'Цикл', params: { count: '10' }, children: [
        { type: 'click' as BlockType, label: 'Клик', params: { x: '500', y: '500', button: 'Left' } },
        { type: 'delay' as BlockType, label: 'Задержка', params: { ms: '100' } },
      ]},
    ],
  },
  {
    name: '🎯 Быстрое переключение оружия',
    description: 'Переключение между слотами оружия',
    hotkey: 'F2',
    blocks: [
      { type: 'send' as BlockType, label: 'Клавиша 1', params: { text: '1', mode: 'Send' } },
      { type: 'delay' as BlockType, label: 'Задержка', params: { ms: '50' } },
      { type: 'click' as BlockType, label: 'Клик', params: { x: '960', y: '540', button: 'Left' } },
    ],
  },
];

/**
 * Шаблоны макросов для работы
 */
export const workTemplates = [
  {
    name: '💼 Быстрый ответ',
    description: 'Вставка стандартного ответа',
    hotkey: '^+r',
    blocks: [
      { type: 'send' as BlockType, label: 'Текст', params: { text: 'Спасибо за обращение! Мы ответим в ближайшее время.', mode: 'Send' } },
    ],
  },
  {
    name: '🪟 Переключение окон',
    description: 'Быстрое переключение между рабочими окнами',
    hotkey: '#1',
    blocks: [
      { type: 'findwindow' as BlockType, label: 'Окно', params: { title: 'Блокнот', action: 'WinActivate' } },
    ],
  },
];
