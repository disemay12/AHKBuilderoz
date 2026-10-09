export interface AHKScript {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export type BlockType =
  | 'send' | 'delay' | 'click' | 'mousemove' | 'loop' | 'if' | 'hotkey'
  | 'variable' | 'comment' | 'run' | 'msgbox' | 'findwindow'
  | 'pixel' | 'imagesearch' | 'clipboard' | 'file' | 'sound'
  | 'tray' | 'tooltip' | 'regwrite' | 'regread' | 'process'
  | 'sendtext' | 'keywait' | 'winwait' | 'controlsend'
  | 'group' | 'label' | 'return' | 'exit' | 'reload'
  | 'sleep' | 'random' | 'format' | 'stringop' | 'math'
  | 'coordmode' | 'settitlematch' | 'suspend' | 'pause';

export interface MacroBlock {
  id: string;
  type: BlockType;
  label: string;
  params: Record<string, string>;
  children?: MacroBlock[];
  collapsed?: boolean;
}

export interface HotkeyContainer {
  id: string;
  hotkey: string;
  description: string;
  blocks: MacroBlock[];
  enabled: boolean;
}

export interface DocEntry {
  id: string;
  title: string;
  category: string;
  content: string;
  example: string;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  exercise?: string;
  solution?: string;
}

export interface HistoryEntry {
  timestamp: number;
  action: string;
  data: any;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  autoSave: boolean;
  language: 'ru' | 'en';
  editorFontSize: number;
  showMinimap: boolean;
  tabSize: number;
  autoCloseBrackets: boolean;
}
