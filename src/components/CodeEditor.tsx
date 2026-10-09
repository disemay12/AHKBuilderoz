import { useEffect, useRef } from 'react';
import Editor, { OnMount, loader } from '@monaco-editor/react';
import { ahkKeywords, ahkCommands, ahkBuiltinVars } from '../data/ahkData';

// Configure Monaco to load from CDN
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
  }
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export default function CodeEditor({ value, onChange, readOnly = false }: CodeEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Register AHK language
    monaco.languages.register({ id: 'ahk' });

    // Define AHK syntax highlighting
    monaco.languages.setMonarchTokensProvider('ahk', {
      defaultToken: '',
      ignoreCase: true,

      keywords: ahkKeywords,
      
      commands: ahkCommands.map(c => c.toLowerCase()),
      
      builtinVars: ahkBuiltinVars.map(v => v.toLowerCase()),

      tokenizer: {
        root: [
          // Comments
          [/[;].*$/, 'comment'],
          
          // Hotstrings
          [/::.*::/, 'string.hotstring'],
          
          // Hotkeys (e.g., ^!h::)
          [/^[#\^!+]*[a-zA-Z0-9]+(::)/, 'keyword.hotkey'],
          
          // Labels
          [/^[a-zA-Z_]\w*:/, 'tag.label'],
          
          // Strings
          [/"[^"]*"/, 'string'],
          
          // Numbers
          [/\b\d+(\.\d+)?\b/, 'number'],
          
          // Variables with %
          [/%[a-zA-Z_]\w*%/, 'variable.predefined'],
          
          // Assignment operators
          [/(:=|\.=|\+=|-=|\*=|\/=)/, 'operator'],
          
          // Comparison operators
          [/(=|==|!=|<>|<|>|<=|>=)/, 'operator'],
          
          // Logical operators
          [/(&&|\|\||!|AND|OR|NOT)/, 'operator'],
          
          // Brackets
          [/[{}()\[\]]/, '@brackets'],
          
          // Built-in variables
          [/\b(A_\w+)\b/, 'variable.predefined'],
          
          // Commands (first word on line)
          [/^(\s*)(\w+)(\s*,|\s)/, {
            cases: {
              '$2@commands': 'keyword.command',
              '@default': 'identifier'
            }
          }],
          
          // Keywords
          [/\b(if|else|loop|while|for|break|continue|return|goto|gosub|global|local|static|byref|try|catch|finally|throw|class|extends|func)\b/, 'keyword'],
          
          // Functions
          [/\b(MsgBox|Send|SendInput|Sleep|Run|WinActivate|WinClose|ToolTip|InputBox|FileRead|FileAppend|MouseClick|PixelGetColor|RegExMatch|RegExReplace|Gui|GuiControl|Format|SubStr|InStr|StrLen|Abs|Ceil|Floor|Round|Mod|FileExist|GetKeyState|Clipboard)\b/, 'keyword.command'],
          
          // Identifiers
          [/[a-zA-Z_]\w*/, 'identifier'],
        ],
      },
    });

    // Register completion provider
    monaco.languages.registerCompletionItemProvider('ahk', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          ...ahkKeywords.map(kw => ({
            label: kw,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: kw,
            range,
          })),
          ...ahkCommands.map(cmd => ({
            label: cmd,
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: cmd,
            range,
            detail: 'AHK команда',
          })),
          ...ahkBuiltinVars.map(v => ({
            label: v,
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: v,
            range,
            detail: 'Встроенная переменная',
          })),
          // Snippets
          {
            label: 'hotkey',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '${1:^!h}::\n    ${2:; действия}\n    return',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            detail: 'Горячая клавиша',
          },
          {
            label: 'loop',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'Loop, ${1:10}\n{\n    ${2:; тело цикла}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            detail: 'Цикл',
          },
          {
            label: 'if',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'if (${1:условие})\n{\n    ${2:; действия}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            detail: 'Условие',
          },
          {
            label: 'gui',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'Gui, Add, ${1|Text,Edit,Button,ListBox,DropDownList|}, ${2:vMyControl}, ${3:Текст}\nGui, Show,, ${4:Заголовок}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            detail: 'GUI окно',
          },
          {
            label: 'function',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '${1:MyFunction}(${2:params}) {\n    ${3:; тело функции}\n    return ${4:result}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            detail: 'Функция',
          },
        ];

        return { suggestions };
      },
    });
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setValue(value);
    }
  }, []);

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage="ahk"
        value={value}
        onChange={(val) => onChange(val || '')}
        onMount={handleEditorMount}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: false,
          folding: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          parameterHints: { enabled: true },
        }}
      />
    </div>
  );
}
