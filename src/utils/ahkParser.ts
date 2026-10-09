import { MacroBlock, BlockType, HotkeyContainer } from '../types/ahk';
import { v4 as uuidv4 } from 'uuid';

/**
 * Парсер AHK скриптов для импорта в визуальный конструктор
 */

interface ParsedSection {
  type: 'hotkey' | 'code';
  hotkey?: string;
  description?: string;
  lines: string[];
}

/**
 * Разбивает AHK код на секции (горячие клавиши и обычный код)
 */
function splitIntoSections(code: string): ParsedSection[] {
  const lines = code.split('\n');
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Пропускаем пустые строки и комментарии в начале
    if (!trimmed || trimmed.startsWith(';')) {
      if (currentSection) {
        currentSection.lines.push(line);
      }
      continue;
    }

    // Проверяем, является ли строка определением горячей клавиши
    const hotkeyMatch = trimmed.match(/^([#!^+<>*~$]*[a-zA-Z0-9_]+(?:\s+&\s+[a-zA-Z0-9_]+)?)::(.*)$/);
    
    if (hotkeyMatch) {
      // Сохраняем предыдущую секцию
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // Создаём новую секцию горячей клавиши
      currentSection = {
        type: 'hotkey',
        hotkey: hotkeyMatch[1],
        description: hotkeyMatch[2] || '',
        lines: []
      };
    } else {
      // Обычная строка кода
      if (!currentSection) {
        currentSection = {
          type: 'code',
          lines: []
        };
      }
      currentSection.lines.push(line);
    }
  }

  // Добавляем последнюю секцию
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Парсит одну строку AHK кода в визуальный блок
 */
function parseLine(line: string): MacroBlock | null {
  const trimmed = line.trim();
  
  // Пропускаем пустые строки
  if (!trimmed) return null;

  // Комментарии
  if (trimmed.startsWith(';')) {
    return {
      id: uuidv4(),
      type: 'comment',
      label: '💬 Комментарий',
      params: { text: trimmed.substring(1).trim() }
    };
  }

  // Return
  if (trimmed === 'return') {
    return null; // Не создаём блок для return
  }

  // Send команды
  const sendMatch = trimmed.match(/^Send(?:Input|Play|Raw|Event)?[,\s]+(.+)$/i);
  if (sendMatch) {
    const mode = trimmed.match(/^Send(Input|Play|Raw|Event)/i)?.[1] || '';
    return {
      id: uuidv4(),
      type: 'send',
      label: '⌨️ Отправить клавиши',
      params: {
        text: sendMatch[1],
        mode: mode ? `Send${mode}` : 'Send'
      }
    };
  }

  // Sleep
  const sleepMatch = trimmed.match(/^Sleep[,\s]+(\d+)$/i);
  if (sleepMatch) {
    return {
      id: uuidv4(),
      type: 'delay',
      label: '⏱️ Задержка',
      params: { ms: sleepMatch[1] }
    };
  }

  // Click
  const clickMatch = trimmed.match(/^Click[,\s]+(.+)$/i);
  if (clickMatch) {
    const parts = clickMatch[1].split(',').map(p => p.trim());
    return {
      id: uuidv4(),
      type: 'click',
      label: '🖱️ Клик мышью',
      params: {
        x: parts[0] || '0',
        y: parts[1] || '0',
        button: parts[2] || 'Left',
        count: parts[3] || '1'
      }
    };
  }

  // MouseMove
  const mouseMoveMatch = trimmed.match(/^MouseMove[,\s]+(.+)$/i);
  if (mouseMoveMatch) {
    const parts = mouseMoveMatch[1].split(',').map(p => p.trim());
    return {
      id: uuidv4(),
      type: 'mousemove',
      label: '➡️ Движение мыши',
      params: {
        x: parts[0] || '0',
        y: parts[1] || '0',
        speed: parts[2] || '',
        relative: parts[3] === 'R' ? 'true' : 'false'
      }
    };
  }

  // WinActivate
  const winActivateMatch = trimmed.match(/^WinActivate[,\s]+(.+)$/i);
  if (winActivateMatch) {
    return {
      id: uuidv4(),
      type: 'findwindow',
      label: '🔍 Поиск окна',
      params: {
        title: winActivateMatch[1],
        action: 'WinActivate',
        class: '',
        process: ''
      }
    };
  }

  // Run
  const runMatch = trimmed.match(/^Run(?:Wait)?[,\s]+(.+)$/i);
  if (runMatch) {
    const parts = runMatch[1].split(',').map(p => p.trim());
    return {
      id: uuidv4(),
      type: 'run',
      label: '🚀 Запустить программу',
      params: {
        program: parts[0] || '',
        args: parts[1] || '',
        wait: trimmed.toLowerCase().includes('runwait') ? 'true' : 'false'
      }
    };
  }

  // MsgBox
  const msgBoxMatch = trimmed.match(/^MsgBox[,\s]+(.+)$/i);
  if (msgBoxMatch) {
    return {
      id: uuidv4(),
      type: 'msgbox',
      label: '💬 Сообщение',
      params: {
        title: 'Информация',
        text: msgBoxMatch[1],
        buttons: 'OK'
      }
    };
  }

  // ToolTip
  const toolTipMatch = trimmed.match(/^ToolTip[,\s]+(.+)$/i);
  if (toolTipMatch) {
    const parts = toolTipMatch[1].split(',').map(p => p.trim());
    return {
      id: uuidv4(),
      type: 'tooltip',
      label: '💡 Всплывающая подсказка',
      params: {
        text: parts[0] || '',
        x: parts[1] || '',
        y: parts[2] || '',
        duration: parts[3] || '2000'
      }
    };
  }

  // Переменные (присваивание)
  const varMatch = trimmed.match(/^(\w+)\s*:=\s*(.+)$/);
  if (varMatch) {
    return {
      id: uuidv4(),
      type: 'variable',
      label: '📦 Переменная',
      params: {
        name: varMatch[1],
        value: varMatch[2]
      }
    };
  }

  // Loop
  const loopMatch = trimmed.match(/^Loop[,\s]*(\d*)$/i);
  if (loopMatch) {
    return {
      id: uuidv4(),
      type: 'loop',
      label: '🔄 Цикл',
      params: { count: loopMatch[1] || '1' },
      children: []
    };
  }

  // If
  const ifMatch = trimmed.match(/^if\s*(.+)$/i);
  if (ifMatch) {
    return {
      id: uuidv4(),
      type: 'if',
      label: '❓ Условие',
      params: { condition: ifMatch[1] },
      children: []
    };
  }

  // Если не удалось распарсить, создаём комментарий
  return {
    id: uuidv4(),
    type: 'comment',
    label: '💬 Нераспознанная команда',
    params: { text: `[Импорт] ${trimmed}` }
  };
}

/**
 * Парсит секцию горячей клавиши в контейнер
 */
function parseHotkeySection(section: ParsedSection): HotkeyContainer {
  const blocks: MacroBlock[] = [];
  let inLoop = false;
  let inIf = false;
  let currentParent: MacroBlock | null = null;

  for (const line of section.lines) {
    const trimmed = line.trim();
    
    // Пропускаем пустые строки и return
    if (!trimmed || trimmed === 'return') continue;

    // Начало блока
    if (trimmed === '{') {
      continue;
    }

    // Конец блока
    if (trimmed === '}') {
      if (inLoop) {
        inLoop = false;
        currentParent = null;
      } else if (inIf) {
        inIf = false;
        currentParent = null;
      }
      continue;
    }

    // Парсим строку
    const block = parseLine(trimmed);
    if (!block) continue;

    // Если это loop или if, запоминаем как родителя
    if (block.type === 'loop') {
      inLoop = true;
      currentParent = block;
      blocks.push(block);
    } else if (block.type === 'if') {
      inIf = true;
      currentParent = block;
      blocks.push(block);
    } else if (currentParent && currentParent.children) {
      // Добавляем в родителя
      currentParent.children.push(block);
    } else {
      // Добавляем в основной список
      blocks.push(block);
    }
  }

  return {
    id: uuidv4(),
    hotkey: section.hotkey || '',
    description: section.description || '',
    blocks,
    enabled: true
  };
}

/**
 * Основной функция импорта AHK кода
 */
export function importAHKCode(code: string): HotkeyContainer[] {
  const sections = splitIntoSections(code);
  const containers: HotkeyContainer[] = [];

  for (const section of sections) {
    if (section.type === 'hotkey') {
      containers.push(parseHotkeySection(section));
    }
    // Секции type === 'code' пока игнорируем
  }

  return containers;
}
