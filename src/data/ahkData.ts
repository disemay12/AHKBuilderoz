import { DocEntry, Lesson } from '../types/ahk';

export const ahkDocumentation: DocEntry[] = [
  {
    id: 'hotkeys',
    title: 'Горячие клавиши (Hotkeys)',
    category: 'Основы',
    content: 'Горячие клавиши позволяют назначить действие на комбинацию клавиш. Используйте символ # для Win, ^ для Ctrl, ! для Alt, + для Shift.',
    example: `; Ctrl+Alt+H показывает сообщение
^!h::
    MsgBox, Привет! Вы нажали Ctrl+Alt+H
    return

; Win+N открывает блокнот
#n::
    Run, notepad.exe
    return`,
    explanation: '::  — обозначает начало горячей клавиши. Всё что между :: и return выполняется при нажатии комбинации. Символы-модификаторы: ^ (Ctrl), ! (Alt), # (Win), + (Shift).'
  },
  {
    id: 'send-keys',
    title: 'Отправка нажатий клавиш (Send)',
    category: 'Основы',
    content: 'Команда Send эмулирует нажатия клавиш и ввод текста в активное окно.',
    example: `; Отправляет текст "Hello World"
Send, Hello World

; Эмулирует Ctrl+C (копирование)
Send, ^c

; Эмулирует Enter
Send, {Enter}

; Комбинация: Ctrl+A, затем Delete
Send, ^a{Delete}`,
    explanation: 'Send — основная команда для эмуляции ввода. Специальные клавиши заключаются в {}: {Enter}, {Tab}, {Space}, {Esc}. Модификаторы: ^ (Ctrl), ! (Alt), # (Win), + (Shift).'
  },
  {
    id: 'variables',
    title: 'Переменные',
    category: 'Основы',
    content: 'AHK поддерживает переменные для хранения данных. Переменные не требуют объявления типа.',
    example: `; Присваивание значения
myVar := "Привет мир"
counter := 0

; Использование в выражениях
counter := counter + 1
MsgBox, %myVar% (счётчик: %counter%)

; Ввод от пользователя
InputBox, userName, Имя, Введите ваше имя:
MsgBox, Привет, %userName%!`,
    explanation: ':= — оператор присваивания (рекомендуемый). %variable% — подстановка значения переменной в текст. InputBox показывает диалог ввода.'
  },
  {
    id: 'loops',
    title: 'Циклы',
    category: 'Средние',
    content: 'Циклы позволяют повторять действия заданное количество раз или до выполнения условия.',
    example: `; Простой цикл 10 раз
Loop, 10
{
    Send, Итерация номер %A_Index%{Enter}
    Sleep, 500
}

; Бесконечный цикл с условием выхода
Loop
{
    PixelGetColor, color, 100, 100
    if (color = "0xFFFFFF")
        break
    Sleep, 100
}

; Цикл по файлам
Loop, C:\\*.txt
{
    MsgBox, Файл: %A_LoopFileName%
}`,
    explanation: 'Loop — базовый цикл. A_Index — встроенная переменная с номером текущей итерации. break — выход из цикла. Sleep — пауза в миллисекундах. A_LoopFileName — имя текущего файла в цикле.'
  },
  {
    id: 'conditions',
    title: 'Условные операторы',
    category: 'Средние',
    content: 'Условные операторы позволяют выполнять разные действия в зависимости от условий.',
    example: `; Простое условие
if (x > 10)
{
    MsgBox, x больше 10
}
else if (x = 10)
{
    MsgBox, x равно 10
}
else
{
    MsgBox, x меньше 10
}

; Проверка существования файла
if FileExist("C:\\test.txt")
    MsgBox, Файл существует!

; Проверка состояния клавиши
if GetKeyState("CapsLock", "T")
    MsgBox, CapsLock включен`,
    explanation: 'if/else — стандартные условные операторы. FileExist() проверяет существование файла. GetKeyState() проверяет состояние клавиши. Условие должно быть в скобках.'
  },
  {
    id: 'functions',
    title: 'Функции',
    category: 'Средние',
    content: 'Функции позволяют организовать код в переиспользуемые блоки.',
    example: `; Определение функции
Add(a, b) {
    return a + b
}

; Вызов функции
result := Add(5, 3)
MsgBox, Результат: %result%

; Функция с необязательным параметром
Greet(name, greeting := "Привет") {
    return greeting . ", " . name . "!"
}

MsgBox, % Greet("Мир")
MsgBox, % Greet("Мир", "Здравствуй")`,
    explanation: 'Функции определяются именем и параметрами в скобках. return — возвращает значение. := "Привет" — значение по умолчанию. . — оператор конкатенации строк.'
  },
  {
    id: 'gui',
    title: 'Графический интерфейс (GUI)',
    category: 'Продвинутые',
    content: 'AHK позволяет создавать окна с элементами управления: кнопками, полями ввода, списками.',
    example: `Gui, Add, Text,, Введите ваше имя:
Gui, Add, Edit, vUserName
Gui, Add, Button, gSubmit, Отправить
Gui, Show,, Моё окно
return

Submit:
    GuiControlGet, userName
    MsgBox, Привет, %userName%!
    Gui, Destroy
return

GuiClose:
    ExitApp
return`,
    explanation: 'Gui, Add — добавляет элемент. vUserName — имя переменной для значения. gSubmit — метка, вызываемая при нажатии кнопки. Gui, Show — показывает окно. GuiControlGet — получает значение элемента.'
  },
  {
    id: 'window',
    title: 'Управление окнами',
    category: 'Продвинутые',
    content: 'AHK может находить, перемещать, изменять размер и управлять окнами приложений.',
    example: `; Активировать окно
WinActivate, Блокнот

; Переместить и изменить размер
WinMove, Блокнот,, 100, 100, 800, 600

; Скрыть/показать окно
WinHide, Блокнот
Sleep, 1000
WinShow, Блокнот

; Получить информацию об активном окне
WinGetTitle, title, A
WinGet, process, ProcessName, A
MsgBox, Активное окно: %title% (%process%)`,
    explanation: 'WinActivate — делает окно активным. WinMove — перемещает и изменяет размер (x, y, width, height). A — специальное имя для активного окна. WinGet — получает информацию об окне.'
  },
  {
    id: 'clipboard',
    title: 'Работа с буфером обмена',
    category: 'Средние',
    content: 'AHK предоставляет простой доступ к буферу обмена через переменную Clipboard.',
    example: `; Копировать текст в буфер
Clipboard := "Текст для буфера"

; Прочитать из буфера
MsgBox, В буфере: %Clipboard%

; Скопировать выделенное и обработать
Send, ^c
ClipWait, 2
text := Clipboard
StringUpper, text, text
MsgBox, Текст в верхнем регистре: %text%

; Очистить буфер
Clipboard :=`,
    explanation: 'Clipboard — встроенная переменная для работы с буфером. ClipWait — ожидает появления данных в буфере. StringUpper — преобразует строку в верхний регистр.'
  },
  {
    id: 'regex',
    title: 'Регулярные выражения',
    category: 'Продвинутые',
    content: 'AHK поддерживает регулярные выражения для сложного поиска и замены текста.',
    example: `; Поиск с RegExMatch
text := "Email: user@example.com"
if RegExMatch(text, "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z]{2,}\\b", match)
    MsgBox, Найден email: %match%

; Замена с RegExReplace
result := RegExReplace("Hello 123 World 456", "\\d+", "#")
MsgBox, Результат: %result%

; Извлечение группы
RegExMatch("Price: $42.50", "\\$(\\d+\\.\\d+)", match)
MsgBox, Цена: %match1%`,
    explanation: 'RegExMatch — ищет совпадение. RegExReplace — заменяет по шаблону. \\b — граница слова. \\d+ — одна или более цифр. match1, match2 — захваченные группы.'
  }
];

export const lessons: Lesson[] = [
  {
    id: 'lesson-1',
    title: 'Урок 1: Первый скрипт',
    description: 'Создайте свой первый AHK скрипт — горячую клавишу для вставки подписи',
    difficulty: 'beginner',
    content: `В AutoHotkey скрипты — это текстовые файлы с расширением .ahk. Каждый скрипт содержит команды, которые выполняются последовательно.

**Горячие клавиши** — это комбинации клавиш, которые запускают определённые действия.

Синтаксис горячей клавиши:
\`\`\`
модификатор+клавиша::
    ; действия
    return
\`\`\`

Модификаторы:
- ^ = Ctrl
- ! = Alt  
- # = Win
- + = Shift`,
    exercise: `Создайте горячую клавишу Ctrl+Shift+S, которая отправляет текст "С уважением, Иван" и нажимает Enter.`,
    solution: `^+s::
    Send, С уважением, Иван{Enter}
    return`
  },
  {
    id: 'lesson-2',
    title: 'Урок 2: Переменные и ввод',
    description: 'Научитесь использовать переменные и получать ввод от пользователя',
    difficulty: 'beginner',
    content: `Переменные в AHK хранят данные. Используйте := для присваивания значений.

**Типы данных:**
- Строки: "текст"
- Числа: 42, 3.14
- Переменные хранят любой тип

**Ввод от пользователя:**
- InputBox — диалог ввода текста
- MsgBox — диалог с кнопками

**Подстановка переменных:**
Используйте %имя% для вставки значения в текст.`,
    exercise: `Создайте скрипт, который спрашивает имя пользователя через InputBox, затем показывает приветствие в MsgBox.`,
    solution: `InputBox, userName, Приветствие, Введите ваше имя:
MsgBox, Здравствуйте, %userName%! Добро пожаловать.`
  },
  {
    id: 'lesson-3',
    title: 'Урок 3: Циклы и автоматизация',
    description: 'Автоматизируйте повторяющиеся действия с помощью циклов',
    difficulty: 'intermediate',
    content: `Циклы позволяют повторять действия автоматически.

**Loop** — базовый цикл:
\`\`\`
Loop, количество {
    ; действия
}
\`\`\`

**A_Index** — номер текущей итерации (начинается с 1).

**Sleep** — пауза в миллисекундах (1000 = 1 секунда).

**Break** — выход из цикла.
**Continue** — переход к следующей итерации.`,
    exercise: `Создайте скрипт с горячей клавишей F1, которая печатает числа от 1 до 5, каждое на новой строке, с паузой 500мс между ними.`,
    solution: `F1::
    Loop, 5
    {
        Send, %A_Index%{Enter}
        Sleep, 500
    }
    return`
  },
  {
    id: 'lesson-4',
    title: 'Урок 4: Условия и логика',
    description: 'Принимайте решения в скриптах с помощью условных операторов',
    difficulty: 'intermediate',
    content: `Условные операторы позволяют выполнять разные действия в зависимости от условий.

**if/else:**
\`\`\`
if (условие) {
    ; если истина
} else {
    ; если ложь
}
\`\`\`

**Операторы сравнения:**
- = или == — равно
- != — не равно
- > < >= <= — больше/меньше

**Логические операторы:**
- && — И
- || — ИЛИ
- ! — НЕ`,
    exercise: `Создайте скрипт, который считает нажатия F2. После 5 нажатий показывает MsgBox "Достигнуто!" и сбрасывает счётчик.`,
    solution: `counter := 0

F2::
    counter := counter + 1
    if (counter >= 5) {
        MsgBox, Достигнуто! (5 нажатий)
        counter := 0
    } else {
        ToolTip, Нажатий: %counter%
    }
    return`
  },
  {
    id: 'lesson-5',
    title: 'Урок 5: Функции и организация кода',
    description: 'Создавайте переиспользуемые блоки кода с помощью функций',
    difficulty: 'advanced',
    content: `Функции помогают организовать код и избежать повторений.

**Определение функции:**
\`\`\`
Имя(параметр1, параметр2) {
    ; тело функции
    return результат
}
\`\`\`

**Вызов функции:**
\`\`\`
результат := Имя(значение1, значение2)
\`\`\`

**Значения по умолчанию:**
\`\`\`
Функция(парам := "значение") {
\`\`\`

Функции могут вызывать другие функции и рекурсивно вызывать себя.`,
    exercise: `Создайте функцию FormatGreeting(name, timeOfDay), которая возвращает приветствие в зависимости от времени дня ("утро", "день", "вечер").`,
    solution: `FormatGreeting(name, timeOfDay) {
    if (timeOfDay = "утро")
        return "Доброе утро, " . name . "!"
    else if (timeOfDay = "день")
        return "Добрый день, " . name . "!"
    else
        return "Добрый вечер, " . name . "!"
}

MsgBox, % FormatGreeting("Иван", "утро")
MsgBox, % FormatGreeting("Мария", "вечер")`
  }
];

export const ahkKeywords = [
  'if', 'else', 'loop', 'while', 'for', 'break', 'continue', 'return',
  'goto', 'gosub', 'func', 'class', 'extends', 'try', 'catch', 'finally',
  'throw', 'global', 'local', 'static', 'byref'
];

export const ahkCommands = [
  'Send', 'SendInput', 'SendPlay', 'SendRaw', 'SendEvent',
  'MsgBox', 'InputBox', 'ToolTip', 'TrayTip',
  'Run', 'RunWait', 'RunAs',
  'WinActivate', 'WinClose', 'WinMinimize', 'WinMaximize', 'WinHide', 'WinShow',
  'WinMove', 'WinGet', 'WinGetTitle', 'WinGetText', 'WinWait', 'WinWaitActive',
  'WinSet', 'WinExist', 'WinActive',
  'Sleep', 'SetTimer', 'Hotkey', 'Suspend', 'Pause', 'ExitApp', 'Reload',
  'FileRead', 'FileAppend', 'FileDelete', 'FileCopy', 'FileMove',
  'StringUpper', 'StringLower', 'StringReplace', 'StringSplit', 'StringLen',
  'StringLeft', 'StringRight', 'StringMid', 'StringTrimLeft', 'StringTrimRight',
  'RegExMatch', 'RegExReplace',
  'ClipWait', 'Clipboard',
  'MouseClick', 'MouseMove', 'MouseGetPos', 'Click',
  'PixelGetColor', 'PixelSearch', 'ImageSearch',
  'ControlSend', 'ControlClick', 'ControlGet', 'ControlGetText',
  'Process', 'SoundPlay', 'SoundBeep',
  'Gui', 'GuiControl', 'GuiControlGet', 'Menu',
  'Format', 'SubStr', 'InStr', 'StrLen', 'StrReplace',
  'Abs', 'Ceil', 'Floor', 'Round', 'Mod', 'Min', 'Max',
  'FileExist', 'GetKeyState'
];

export const ahkBuiltinVars = [
  'A_Index', 'A_LoopField', 'A_LoopFileName', 'A_LoopFileExt',
  'A_ScriptDir', 'A_ScriptName', 'A_ScriptFullPath',
  'A_Desktop', 'A_Programs', 'A_StartMenu',
  'A_UserName', 'A_ComputerName', 'A_OSVersion',
  'A_Hour', 'A_Min', 'A_Sec', 'A_MSec',
  'A_YYYY', 'A_MM', 'A_DD',
  'A_Now', 'A_TickCount',
  'A_Space', 'A_Tab',
  'A_Cursor', 'A_CaretX', 'A_CaretY',
  'A_ScreenWidth', 'A_ScreenHeight',
  'Clipboard', 'ClipboardAll', 'ErrorLevel'
];
