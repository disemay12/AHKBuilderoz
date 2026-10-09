export interface AHKScript {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export interface MacroBlock {
  id: string;
  type: 'send' | 'delay' | 'click' | 'loop' | 'if' | 'hotkey' | 'variable' | 'comment' | 'run' | 'msgbox' | 'findwindow';
  label: string;
  params: Record<string, string>;
  children?: MacroBlock[];
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
