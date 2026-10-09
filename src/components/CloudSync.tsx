import { useState, useEffect } from 'react';
import { Cloud, Upload, Download, RefreshCw, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import Tooltip from './Tooltip';

interface CloudSyncProps {
  code: string;
  onLoadCode: (code: string) => void;
}

interface CloudFile {
  name: string;
  content: string;
  lastModified: number;
}

export default function CloudSync({ code, onLoadCode }: CloudSyncProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      if ((window as any).puter) {
        setIsConnected(true);
        await loadFileList();
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      setIsConnected(false);
    }
  };

  const loadFileList = async () => {
    try {
      const puter = (window as any).puter;
      if (!puter) return;

      const items = await puter.fs.readdir('/ahk-scripts');
      const fileList: CloudFile[] = [];

      for (const item of items) {
        if (item.name.endsWith('.ahk')) {
          const file = await puter.fs.read(`/ahk-scripts/${item.name}`);
          const content = await file.text();
          fileList.push({
            name: item.name,
            content,
            lastModified: item.modified || Date.now(),
          });
        }
      }

      setFiles(fileList);
    } catch (err) {
      console.error('Error loading file list:', err);
    }
  };

  const uploadToCloud = async () => {
    if (!code.trim()) {
      showStatus('error', 'Нет кода для загрузки');
      return;
    }

    setIsLoading(true);
    try {
      const puter = (window as any).puter;
      if (!puter) {
        throw new Error('Puter.js не загружен');
      }

      // Создаём папку если её нет
      try {
        await puter.fs.mkdir('/ahk-scripts');
      } catch (err) {
        // Папка уже существует
      }

      // Генерируем имя файла
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `script-${timestamp}.ahk`;

      // Загружаем файл
      await puter.fs.write(`/ahk-scripts/${filename}`, code);

      showStatus('success', `Скрипт загружен как ${filename}`);
      await loadFileList();
    } catch (err) {
      showStatus('error', `Ошибка загрузки: ${err instanceof Error ? err.message : 'неизвестная ошибка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFromCloud = async (file: CloudFile) => {
    setIsLoading(true);
    try {
      onLoadCode(file.content);
      showStatus('success', `Скрипт "${file.name}" загружен в редактор`);
    } catch (err) {
      showStatus('error', `Ошибка загрузки: ${err instanceof Error ? err.message : 'неизвестная ошибка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFromCloud = async (filename: string) => {
    if (!confirm(`Удалить файл "${filename}" из облака?`)) return;

    setIsLoading(true);
    try {
      const puter = (window as any).puter;
      if (!puter) {
        throw new Error('Puter.js не загружен');
      }

      await puter.fs.delete(`/ahk-scripts/${filename}`);
      showStatus('success', `Файл "${filename}" удалён`);
      await loadFileList();
    } catch (err) {
      showStatus('error', `Ошибка удаления: ${err instanceof Error ? err.message : 'неизвестная ошибка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatus(type);
    setStatusMessage(message);
    setTimeout(() => {
      setStatus('idle');
      setStatusMessage('');
    }, 3000);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700 bg-gray-800/50">
        <Cloud size={20} className="text-blue-400" />
        <h3 className="text-sm font-bold text-white">Облачная синхронизация</h3>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <CheckCircle size={14} className="text-green-400" />
              <span className="text-xs text-green-400">Подключено</span>
            </>
          ) : (
            <>
              <AlertCircle size={14} className="text-red-400" />
              <span className="text-xs text-red-400">Не подключено</span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {/* Status Message */}
        {status !== 'idle' && (
          <div
            className={`mb-4 p-3 rounded-lg border ${
              status === 'success'
                ? 'bg-green-900/20 border-green-700/30 text-green-300'
                : 'bg-red-900/20 border-red-700/30 text-red-300'
            }`}
          >
            {statusMessage}
          </div>
        )}

        {/* Upload Section */}
        <div className="mb-4">
          <h4 className="text-sm font-bold text-gray-300 mb-2">Загрузить текущий скрипт:</h4>
          <Tooltip content="Сохранить текущий код в облако Puter.com">
            <button
              onClick={uploadToCloud}
              disabled={!isConnected || isLoading || !code.trim()}
              className="w-full px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Загрузка...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Загрузить в облако
                </>
              )}
            </button>
          </Tooltip>
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-gray-300">Файлы в облаке:</h4>
              <Tooltip content="Обновить список файлов">
                <button
                  onClick={loadFileList}
                  className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
                >
                  <RefreshCw size={14} />
                </button>
              </Tooltip>
            </div>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {file.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(file.lastModified).toLocaleString('ru-RU')}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {file.content.split('\n').length} строк, {file.content.length} символов
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <Tooltip content="Загрузить скрипт в редактор">
                      <button
                        onClick={() => downloadFromCloud(file)}
                        disabled={isLoading}
                        className="flex-1 px-3 py-1.5 rounded bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-medium"
                      >
                        <Download size={12} className="inline mr-1" />
                        Загрузить
                      </button>
                    </Tooltip>
                    <Tooltip content="Удалить файл из облака">
                      <button
                        onClick={() => deleteFromCloud(file.name)}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded bg-red-900/30 hover:bg-red-800/40 text-red-300 text-xs border border-red-700/30"
                      >
                        <Trash2 size={12} />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {files.length === 0 && isConnected && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Cloud size={48} className="mx-auto mb-4 text-gray-500 opacity-30" />
              <p className="text-gray-400">Нет файлов в облаке</p>
              <p className="text-sm text-gray-500 mt-2">
                Загрузите текущий скрипт для начала работы
              </p>
            </div>
          </div>
        )}

        {/* Not Connected State */}
        {!isConnected && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <AlertCircle size={48} className="mx-auto mb-4 text-red-400 opacity-50" />
              <p className="text-gray-300 mb-2">Puter.js не загружен</p>
              <p className="text-sm text-gray-500">
                Для использования облачной синхронизации необходимо интернет-соединение.
                Проверьте подключение и обновите страницу.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
