import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Tooltip from './Tooltip';
import { importAHKCode } from '../utils/ahkParser';
import { HotkeyContainer } from '../types/ahk';

interface ImportAHKProps {
  onImport: (containers: HotkeyContainer[]) => void;
}

export default function ImportAHK({ onImport }: ImportAHKProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.ahk') && !file.name.endsWith('.txt')) {
      setStatus('error');
      setMessage('Поддерживаются только файлы .ahk и .txt');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const code = e.target?.result as string;
        const containers = importAHKCode(code);
        
        if (containers.length === 0) {
          setStatus('error');
          setMessage('Не удалось найти горячие клавиши в файле');
          return;
        }

        onImport(containers);
        setStatus('success');
        setMessage(`Импортировано ${containers.length} горячих клавиш`);
        
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 3000);
      } catch (err) {
        setStatus('error');
        setMessage('Ошибка при парсинге файла');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
        isDragging
          ? 'border-blue-500 bg-blue-900/20'
          : 'border-gray-700 hover:border-gray-500'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".ahk,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-3">
        {status === 'idle' && (
          <>
            <Upload size={32} className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-300">
                Перетащите .ahk файл сюда или{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  выберите файл
                </button>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Поддерживаются файлы AutoHotkey (.ahk) и текст (.txt)
              </p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={32} className="text-green-400" />
            <p className="text-sm text-green-300">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle size={32} className="text-red-400" />
            <p className="text-sm text-red-300">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
