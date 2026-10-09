import { useState, useRef, useEffect } from 'react';
import { MousePointer2, Copy, Check, X } from 'lucide-react';
import Tooltip from './Tooltip';

interface CoordinateHelperProps {
  onInsertCode?: (code: string) => void;
}

export default function CoordinateHelper({ onInsertCode }: CoordinateHelperProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [coordinates, setCoordinates] = useState<{ x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [screenSize, setScreenSize] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    setScreenSize({
      width: window.screen.width,
      height: window.screen.height
    });
  }, []);

  const startCapture = async () => {
    try {
      // Запрашиваем разрешение на захват экрана
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      // Создаём canvas для отображения
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Устанавливаем размеры canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Рисуем видео на canvas
      const drawFrame = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (isCapturing) {
          requestAnimationFrame(drawFrame);
        }
      };
      drawFrame();

      setIsCapturing(true);

      // Обработчик клика для получения координат
      canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const x = Math.round((e.clientX - rect.left) * scaleX);
        const y = Math.round((e.clientY - rect.top) * scaleY);
        
        setCoordinates({ x, y });
        stopCapture(stream);
      };

      // Остановка при закрытии окна захвата
      video.onended = () => {
        stopCapture(stream);
      };

    } catch (err) {
      console.error('Ошибка захвата экрана:', err);
      alert('Не удалось захватить экран. Убедитесь, что вы дали разрешение.');
    }
  };

  const stopCapture = (stream?: MediaStream) => {
    setIsCapturing(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const copyCoordinates = () => {
    if (!coordinates) return;
    const text = `${coordinates.x}, ${coordinates.y}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateClickCode = (): string => {
    if (!coordinates) return '';
    return `Click, ${coordinates.x}, ${coordinates.y}`;
  };

  const generateMouseMoveCode = (): string => {
    if (!coordinates) return '';
    return `MouseMove, ${coordinates.x}, ${coordinates.y}`;
  };

  const insertClickCode = () => {
    if (!coordinates || !onInsertCode) return;
    onInsertCode(generateClickCode());
  };

  const insertMouseMoveCode = () => {
    if (!coordinates || !onInsertCode) return;
    onInsertCode(generateMouseMoveCode());
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700 bg-gray-800/50">
        <MousePointer2 size={20} className="text-blue-400" />
        <h3 className="text-sm font-bold text-white">Координатный помощник</h3>
        <div className="flex-1" />
        <span className="text-xs text-gray-400">
          Разрешение экрана: {screenSize.width}x{screenSize.height}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {!isCapturing && !coordinates && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <MousePointer2 size={48} className="mx-auto mb-4 text-gray-500 opacity-30" />
              <p className="text-lg text-gray-300 mb-2">Определение координат мыши</p>
              <p className="text-sm text-gray-500 mb-4">
                Нажмите кнопку ниже, выберите область экрана и кликните в нужное место для получения координат
              </p>
              <button
                onClick={startCapture}
                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
              >
                <MousePointer2 size={16} className="inline mr-2" />
                Захватить экран
              </button>
            </div>
          </div>
        )}

        {isCapturing && (
          <div className="flex-1 flex flex-col">
            <div className="mb-3 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
              <p className="text-sm text-yellow-300">
                🎯 Кликните в нужное место на экране для получения координат
              </p>
            </div>
            <div className="flex-1 relative border-2 border-blue-500 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full h-full cursor-crosshair"
                style={{ maxHeight: '600px' }}
              />
            </div>
            <button
              onClick={() => stopCapture()}
              className="mt-3 px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white text-sm"
            >
              <X size={14} className="inline mr-1" />
              Отмена
            </button>
          </div>
        )}

        {coordinates && !isCapturing && (
          <div className="space-y-4">
            {/* Результат */}
            <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
              <h4 className="text-sm font-bold text-green-400 mb-2">📍 Координаты:</h4>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-lg text-green-300 font-mono bg-black/30 px-3 py-2 rounded">
                  X: {coordinates.x}, Y: {coordinates.y}
                </code>
                <Tooltip content="Копировать координаты">
                  <button
                    onClick={copyCoordinates}
                    className="p-2 rounded bg-green-600 hover:bg-green-500 text-white"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Сгенерированный код */}
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
              <h4 className="text-sm font-bold text-blue-400 mb-2">💻 Сгенерированный код:</h4>
              
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Клик мышью:</div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm text-blue-300 font-mono bg-black/30 px-3 py-2 rounded">
                      {generateClickCode()}
                    </code>
                    <Tooltip content="Вставить в редактор">
                      <button
                        onClick={insertClickCode}
                        className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm"
                      >
                        Вставить
                      </button>
                    </Tooltip>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-1">Перемещение мыши:</div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm text-blue-300 font-mono bg-black/30 px-3 py-2 rounded">
                      {generateMouseMoveCode()}
                    </code>
                    <Tooltip content="Вставить в редактор">
                      <button
                        onClick={insertMouseMoveCode}
                        className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm"
                      >
                        Вставить
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-2">
              <button
                onClick={() => setCoordinates(null)}
                className="flex-1 px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
              >
                <MousePointer2 size={14} className="inline mr-1" />
                Новая координата
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
