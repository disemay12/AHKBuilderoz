# AHK Script Editor - Редактор AutoHotkey скриптов

Веб-приложение для создания, редактирования и изучения скриптов AutoHotkey с поддержкой Monaco Editor, визуального конструктора макросов, документации и обучающего режима.

## 🚀 Возможности

- **Редактор кода** с подсветкой синтаксиса AHK, автодополнением и сниппетами
- **Визуальный конструктор макросов** с генерацией AHK-кода
- **Встроенная документация** с примерами и объяснениями
- **Обучающий режим** из 5 уроков от простого к сложному
- **Менеджер скриптов** с сохранением в LocalStorage, экспортом/импортом .ahk файлов
- **Анализатор кода** с разбором структуры и статистикой
- **Тёмная тема** и адаптивный дизайн

## 📦 Установка и запуск

### Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev
```

Откройте http://localhost:3000

### Production-сборка

```bash
npm run build
```

Собранные файлы будут в папке `dist/`

## 🌐 Деплой на GitHub Pages

### Автоматический деплой (рекомендуется)

1. **Создайте репозиторий на GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/ВАШ_ЛОГИН/ahk-script-editor.git
   git push -u origin main
   ```

2. **Настройте GitHub Pages:**
   - Перейдите в Settings → Pages
   - В разделе "Build and deployment" выберите "GitHub Actions"
   - Workflow уже настроен в `.github/workflows/deploy.yml`

3. **Обновите `vite.config.js`** (замените `ahk-script-editor` на имя вашего репозитория):
   ```javascript
   export default defineConfig({
     base: '/ahk-script-editor/',
     plugins: [react(), tailwindcss()],
     // ... остальной код
   });
   ```

4. **Запушьте изменения:**
   ```bash
   git add .
   git commit -m "Configure for GitHub Pages"
   git push
   ```

5. **Дождитесь завершения GitHub Actions** (обычно 1-2 минуты)

6. **Ваш сайт будет доступен по адресу:**
   ```
   https://ВАШ_ЛОГИН.github.io/ahk-script-editor/
   ```

### Альтернативный способ: ручная загрузка

Если не хотите использовать GitHub Actions:

```bash
# Соберите проект
npm run build

# Создайте ветку gh-pages
git checkout -b gh-pages
git add -f dist
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix dist origin gh-pages
```

Затем в Settings → Pages выберите ветку `gh-pages` и папку `/ (root)`.

## 🛠 Технологии

- **React 18** + TypeScript
- **Vite** - сборщик
- **Tailwind CSS** - стили
- **Monaco Editor** - редактор кода
- **Lucide React** - иконки
- **LocalStorage** - хранение скриптов

## 📝 Использование

### Горячие клавиши

- `Ctrl+S` - Сохранить скрипт
- `Ctrl+Space` - Автодополнение
- `Ctrl+/` - Закомментировать строку
- `Ctrl+F` - Поиск

### AHK модификаторы

- `#` - Win
- `^` - Ctrl
- `!` - Alt
- `+` - Shift

## 📄 Лицензия

MIT

## 🤝 Вклад

Pull requests приветствуются! Для крупных изменений сначала откройте issue.
