import { MacroBlock } from '../types/ahk';

export const defaultMacroBlocks: Omit<MacroBlock, 'id'>[] = [
  { type: 'hotkey', label: '🔑 Горячая клавиша', params: { keys: '^!h', description: 'Ctrl+Alt+H' } },
  { type: 'send', label: '⌨️ Отправить клавиши', params: { text: 'Hello World', mode: 'Send' } },
  { type: 'delay', label: '⏱️ Задержка', params: { ms: '1000' } },
  { type: 'click', label: '🖱️ Клик мышью', params: { x: '100', y: '200', button: 'Left' } },
  { type: 'loop', label: '🔄 Цикл', params: { count: '5' }, children: [] },
  { type: 'if', label: '❓ Условие', params: { condition: 'x > 10' }, children: [] },
  { type: 'variable', label: '📦 Переменная', params: { name: 'myVar', value: '"текст"' } },
  { type: 'comment', label: '💬 Комментарий', params: { text: 'Описание действия' } },
  { type: 'run', label: '🚀 Запустить программу', params: { program: 'notepad.exe', args: '' } },
  { type: 'msgbox', label: '💬 Сообщение', params: { title: 'Информация', text: 'Текст сообщения' } },
];

export function generateAHKCode(blocks: MacroBlock[], indent: number = 0): string {
  const pad = '    '.repeat(indent);
  let code = '';

  for (const block of blocks) {
    switch (block.type) {
      case 'hotkey':
        code += `${block.params.keys}::\n`;
        break;
      case 'send':
        code += `${pad}${block.params.mode || 'Send'}, ${block.params.text}\n`;
        break;
      case 'delay':
        code += `${pad}Sleep, ${block.params.ms}\n`;
        break;
      case 'click':
        code += `${pad}Click, ${block.params.x}, ${block.params.y}, ${block.params.button}\n`;
        break;
      case 'loop':
        code += `${pad}Loop, ${block.params.count}\n${pad}{\n`;
        if (block.children) {
          code += generateAHKCode(block.children, indent + 1);
        }
        code += `${pad}}\n`;
        break;
      case 'if':
        code += `${pad}if (${block.params.condition})\n${pad}{\n`;
        if (block.children) {
          code += generateAHKCode(block.children, indent + 1);
        }
        code += `${pad}}\n`;
        break;
      case 'variable':
        code += `${pad}${block.params.name} := ${block.params.value}\n`;
        break;
      case 'comment':
        code += `${pad}; ${block.params.text}\n`;
        break;
      case 'run':
        const args = block.params.args ? `, ${block.params.args}` : '';
        code += `${pad}Run, ${block.params.program}${args}\n`;
        break;
      case 'msgbox':
        code += `${pad}MsgBox, % ${block.params.text}\n`;
        break;
    }

    if (block.type === 'hotkey') {
      if (block.children) {
        code += generateAHKCode(block.children, indent + 1);
      }
      code += `${pad}return\n\n`;
    }
  }

  return code;
}

export const macroTemplates = [
  {
    name: 'Автоматический набор текста',
    description: 'Горячая клавиша для быстрой вставки текста',
    blocks: [
      { id: '1', type: 'hotkey' as const, label: '🔑 Ctrl+Shift+T', params: { keys: '^+t', description: 'Ctrl+Shift+T' }, children: [
        { id: '2', type: 'send' as const, label: '⌨️ Текст', params: { text: 'Спасибо за обращение! Мы ответим в ближайшее время.', mode: 'Send' } },
      ]},
    ]
  },
  {
    name: 'Повторяющееся действие',
    description: 'Цикл с задержкой между действиями',
    blocks: [
      { id: '1', type: 'hotkey' as const, label: '🔑 F5', params: { keys: 'F5', description: 'F5' }, children: [
        { id: '2', type: 'loop' as const, label: '🔄 10 раз', params: { count: '10' }, children: [
          { id: '3', type: 'send' as const, label: '⌨️ Нажатие', params: { text: '{Enter}', mode: 'Send' } },
          { id: '4', type: 'delay' as const, label: '⏱️ 500мс', params: { ms: '500' } },
        ]},
      ]},
    ]
  },
  {
    name: 'Запуск приложения',
    description: 'Горячая клавиша для запуска программы',
    blocks: [
      { id: '1', type: 'hotkey' as const, label: '🔑 Win+N', params: { keys: '#n', description: 'Win+N' }, children: [
        { id: '2', type: 'run' as const, label: '🚀 Notepad', params: { program: 'notepad.exe', args: '' } },
        { id: '3', type: 'delay' as const, label: '⏱️ Ждать', params: { ms: '500' } },
        { id: '4', type: 'send' as const, label: '⌨️ Заголовок', params: { text: 'Мои заметки', mode: 'Send' } },
      ]},
    ]
  },
  {
    name: 'Условный макрос',
    description: 'Макрос с проверкой условия',
    blocks: [
      { id: '1', type: 'hotkey' as const, label: '🔑 F7', params: { keys: 'F7', description: 'F7' }, children: [
        { id: '2', type: 'variable' as const, label: '📦 Счётчик', params: { name: 'counter', value: 'counter + 1' } },
        { id: '3', type: 'if' as const, label: '❓ counter > 5', params: { condition: 'counter > 5' }, children: [
          { id: '4', type: 'msgbox' as const, label: '💬 Сообщение', params: { title: 'Лимит', text: '"Достигнут лимит!"' } },
          { id: '5', type: 'variable' as const, label: '📦 Сброс', params: { name: 'counter', value: '0' } },
        ]},
      ]},
    ]
  }
];
