/**
 * Утилита для преобразования пользовательского ввода горячих клавиш
 * в формат AHK (например, "alt+ctrl+h" -> "^!h")
 */

const modifierMap: Record<string, string> = {
  'ctrl': '^',
  'control': '^',
  'alt': '!',
  'shift': '+',
  'win': '#',
  'windows': '#',
  'лctrl': '^',
  'рctrl': '^',
  'лalt': '!',
  'рalt': '!',
  'лshift': '+',
  'рshift': '+',
  'лwin': '#',
  'рwin': '#',
};

const specialKeys: Record<string, string> = {
  'enter': '{Enter}',
  'ввод': '{Enter}',
  'tab': '{Tab}',
  'таб': '{Tab}',
  'tabulation': '{Tab}',
  'space': '{Space}',
  'пробел': '{Space}',
  'esc': '{Esc}',
  'escape': '{Esc}',
  'backspace': '{Backspace}',
  'delete': '{Delete}',
  'удалить': '{Delete}',
  'home': '{Home}',
  'end': '{End}',
  'pageup': '{PgUp}',
  'pagedown': '{PgDn}',
  'up': '{Up}',
  'down': '{Down}',
  'left': '{Left}',
  'right': '{Right}',
  'вверх': '{Up}',
  'вниз': '{Down}',
  'влево': '{Left}',
  'вправо': '{Right}',
  'insert': '{Insert}',
  'pause': '{Pause}',
  'capslock': '{CapsLock}',
  'numlock': '{NumLock}',
  'scrolllock': '{ScrollLock}',
  'printscreen': '{PrintScreen}',
  'f1': 'F1', 'f2': 'F2', 'f3': 'F3', 'f4': 'F4',
  'f5': 'F5', 'f6': 'F6', 'f7': 'F7', 'f8': 'F8',
  'f9': 'F9', 'f10': 'F10', 'f11': 'F11', 'f12': 'F12',
  'numpad0': 'Numpad0', 'numpad1': 'Numpad1', 'numpad2': 'Numpad2',
  'numpad3': 'Numpad3', 'numpad4': 'Numpad4', 'numpad5': 'Numpad5',
  'numpad6': 'Numpad6', 'numpad7': 'Numpad7', 'numpad8': 'Numpad8',
  'numpad9': 'Numpad9',
  'appskey': 'AppsKey',
  'lbutton': 'LButton',
  'rbutton': 'RButton',
  'mbutton': 'MButton',
  'wheelup': 'WheelUp',
  'wheeldown': 'WheelDown',
};

/**
 * Преобразует пользовательский ввод в AHK формат
 */
export function parseHotkey(input: string): string {
  if (!input.trim()) return '';
  
  const parts = input.toLowerCase().split(/[+\s,]+/).map(p => p.trim()).filter(p => p);
  
  let modifiers = '';
  let mainKey = '';
  
  for (const part of parts) {
    if (modifierMap[part]) {
      if (!modifiers.includes(modifierMap[part])) {
        modifiers += modifierMap[part];
      }
    } else if (specialKeys[part]) {
      mainKey = specialKeys[part];
    } else {
      // Обычная буква или цифра
      mainKey = part.length === 1 ? part : part;
    }
  }
  
  return modifiers + mainKey;
}

/**
 * Преобразует AHK формат в читаемый вид
 */
export function hotkeyToReadable(hotkey: string): string {
  const parts: string[] = [];
  let i = 0;
  
  while (i < hotkey.length) {
    const char = hotkey[i];
    if (char === '^') { parts.push('Ctrl'); i++; }
    else if (char === '!') { parts.push('Alt'); i++; }
    else if (char === '+') { parts.push('Shift'); i++; }
    else if (char === '#') { parts.push('Win'); i++; }
    else {
      // Оставшаяся часть - это клавиша
      const key = hotkey.substring(i);
      if (key.startsWith('{') && key.endsWith('}')) {
        parts.push(key.slice(1, -1));
      } else {
        parts.push(key);
      }
      break;
    }
  }
  
  return parts.join(' + ');
}

/**
 * Проверяет валидность горячих клавиш
 */
export function isValidHotkey(input: string): boolean {
  const parsed = parseHotkey(input);
  return parsed.length > 0;
}

/**
 * Описания горячих клавиш для тултипов
 */
export const hotkeyHelp = {
  modifiers: 'Модификаторы: Ctrl, Alt, Shift, Win (или ^, !, +, #)',
  examples: 'Примеры: "ctrl+s", "alt+f4", "win+d", "ctrl+shift+t", "f1"',
  russian: 'Можно писать по-русски: "ctrl+пробел", "alt+ввод"',
  special: 'Спец. клавиши: Enter, Tab, Esc, F1-F12, стрелки',
};
