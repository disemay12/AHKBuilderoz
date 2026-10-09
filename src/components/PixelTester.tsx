import { useState, useRef } from 'react';
import { Palette, Copy, Check, X, Eye } from 'lucide-react';
import Tooltip from './Tooltip';

interface PixelTesterProps {
  onInsertCode?: (code: string) => void;
}

export default function PixelTester({ onInsertCode }: PixelTesterProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [variation, setVariation] = useState(10);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const drawFrame = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (isCapturing) {
          requestAnimationFrame(drawFrame);
        }
      };
      drawFrame();

      setIsCapturing(true);

      canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const x = Math.round((e.clientX - rect.left) * scaleX);
        const y = Math.round((e.clientY - rect.top) * scaleY);
        
        // Получаем цвет пикселя
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];
        const hex = `0x${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
        
        setSelectedColor(hex);
        setCoordinates({ x, y });
        stopCapture(stream);
      };

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

  const copyColor = () => {
    if (!selectedColor) return;
    navigator.clipboard.writeText(selectedColor);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generatePixelSearchCode = (): string => {
    if (!selectedColor || !coordinates) return '';
    return `PixelSearch, foundX, foundY, 0, 0, A_ScreenWidth, A_ScreenHeight, ${selectedColor}, ${variation}`;
  };

  const generatePixelGetColorCode = (): string => {
    if (!coordinates) return '';
    return `PixelGetColor, color, ${coordinates.x}, ${coordinates.y}`;
  };

  const insertPixelSearchCode = () => {
    if (!selectedColor || !onInsertCode) return;
    onInsertCode(generatePixelSearchCode());
  };

  const insertPixelGetColorCode = () => {
    if (!coordinates || !onInsertCode) return;
    onInsertCode(generatePixelGetColorCode());
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700 bg-gray-800/50">
        <Palette size={20} className="text-purple-400" />
        <h3 className="text-sm font-bold text-white">Тестировщик пикселей</h3>
        <div className="flex-1" />
        {selectedColor && (
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded border-2 border-gray-600"
              style={{ backgroundColor: selectedColor }}
            />
            <code className="text-sm text-purple-300 font-mono">{selectedColor}</code>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {!isCapturing && !selectedColor && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <Palette size={48} className="mx-auto mb-4 text-gray-500 opacity-30" />
              <p className="text-lg text-gray-300 mb-2">Поиск цвета на экране</p>
              <p className="text-sm text-gray-500 mb-4">
                Нажмите кнопку ниже, выберите область экрана и кликните на пиксель для получения его цвета
              </p>
              <button
                onClick={startCapture}
                className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
              >
                <Eye size={16} className="inline mr-2" />
                Захватить экран
              </button>
            </div>
          </div>
        )}

        {isCapturing && (
          <div className="flex-1 flex flex-col">
            <div className="mb-3 p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg">
              <p className="text-sm text-purple-300">
                🎨 Кликните на пиксель для получения его цвета
              </p>
            </div>
            <div className="flex-1 relative border-2 border-purple-500 rounded-lg overflow-hidden">
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

        {selectedColor && !isCapturing && (
          <div className="space-y-4">
            {/* Результат */}
            <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
              <h4 className="text-sm font-bold text-purple-400 mb-2">🎨 Цвет пикселя:</h4>
              <div className="flex items-center gap-3">
                <div 
                  className="w-16 h-16 rounded-lg border-2 border-gray-600"
                  style={{ backgroundColor: selectedColor }}
                />
                <div className="flex-1">
                  <code className="text-lg text-purple-300 font-mono bg-black/30 px-3 py-2 rounded block mb-2">
                    {selectedColor}
                  </code>
                  {coordinates && (
                    <div className="text-xs text-gray-400">
                      Координаты: X={coordinates.x}, Y={coordinates.y}
                    </div>
                  )}
                </div>
                <Tooltip content="Копировать цвет">
                  <button
                    onClick={copyColor}
                    className="p-2 rounded bg-purple-600 hover:bg-purple-500 text-white"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Настройки */}
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
              <h4 className="text-sm font-bold text-blue-400 mb-2">⚙️ Настройки поиска:</h4>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-300">Допустимое отклонение:</label>
                <input
                  type="number"
                  value={variation}
                  onChange={(e) => setVariation(Number(e.target.value))}
                  min="0"
                  max="255"
                  className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
                <span className="text-xs text-gray-500">(0-255)</span>
              </div>
            </div>

            {/* Сгенерированный код */}
            <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
              <h4 className="text-sm font-bold text-green-400 mb-2">💻 Сгенерированный код:</h4>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Поиск пикселя на экране:</div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm text-green-300 font-mono bg-black/30 px-3 py-2 rounded">
                      {generatePixelSearchCode()}
                    </code>
                    <Tooltip content="Вставить в редактор">
                      <button
                        onClick={insertPixelSearchCode}
                        className="px-3 py-2 rounded bg-green-600 hover:bg-green-500 text-white text-sm"
                      >
                        Вставить
                      </button>
                    </Tooltip>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-1">Получить цвет пикселя:</div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm text-green-300 font-mono bg-black/30 px-3 py-2 rounded">
                      {generatePixelGetColorCode()}
                    </code>
                    <Tooltip content="Вставить в редактор">
                      <button
                        onClick={insertPixelGetColorCode}
                        className="px-3 py-2 rounded bg-green-600 hover:bg-green-500 text-white text-sm"
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
                onClick={() => { setSelectedColor(null); setCoordinates(null); }}
                className="flex-1 px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
              >
                <Palette size={14} className="inline mr-1" />
                Новый пиксель
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
