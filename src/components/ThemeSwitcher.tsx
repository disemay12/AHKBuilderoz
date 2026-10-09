import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import Tooltip from './Tooltip';

type Theme = 'light' | 'dark' | 'system';

interface ThemeSwitcherProps {
  onThemeChange?: (theme: Theme) => void;
}

export default function ThemeSwitcher({ onThemeChange }: ThemeSwitcherProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('ahk-theme');
    return (saved as Theme) || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Определяем эффективную тему
    let effectiveTheme: 'light' | 'dark';
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      effectiveTheme = theme;
    }
    
    // Применяем тему через класс
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    
    localStorage.setItem('ahk-theme', theme);
    onThemeChange?.(theme);
  }, [theme, onThemeChange]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      root.classList.toggle('dark', e.matches);
      root.classList.toggle('light', !e.matches);
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const themes: { id: Theme; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'light', label: 'Светлая', icon: <Sun size={16} />, description: 'Светлая тема оформления' },
    { id: 'dark', label: 'Тёмная', icon: <Moon size={16} />, description: 'Тёмная тема оформления' },
    { id: 'system', label: 'Системная', icon: <Monitor size={16} />, description: 'Автоматически по настройкам системы' },
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
      {themes.map(t => (
        <Tooltip key={t.id} content={t.description} position="bottom">
          <button
            onClick={() => setTheme(t.id)}
            className={`p-2 rounded transition-colors ${
              theme === t.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title={t.label}
          >
            {t.icon}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
