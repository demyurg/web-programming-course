<<<<<<< HEAD
# Лабораторная работа 7: Testing - Vitest & Playwright

## Описание

В этой лабораторной работе вы научитесь тестировать React приложения. Вы возьмете готовое Quiz приложение из LR5+LR6, декомпозируете его на компоненты и покроете тестами.

**Цели:**
- Научиться писать unit тесты для функций и stores (Vitest)
- Освоить тестирование React компонентов (React Testing Library)
- Познакомиться с E2E тестированием (Playwright)
- Улучшить архитектуру приложения через декомпозицию
- Достичь 70%+ test coverage

---

## Материалы лекции

### 📊 Презентация
- [Слайды (HTML)](./docs/slides-standalone/slides.html) - 30 слайдов, ~90 минут
- Открыть в браузере и использовать стрелки для навигации

### 📝 Документация
- [Конспект лекции](./docs/lecture-script.md) - подробный план для преподавателя
- [Cheatsheet](./docs/cheatsheet.md) - краткая справка по тестированию
- [Подробное руководство](./docs/guide.md) - теория и примеры
- [Интерактивные примеры](./docs/interactive.html) - поиск по коду с подсветкой

---

## Шаг 0: Подготовка окружения

### Вариант 1: Создание ветки на основе LR6

Рекомендуемый подход - создать новую ветку от вашей выполненной LR6:

```bash
# Перейдите в директорию с LR5/LR6
cd lessons/lr5

# Убедитесь, что вся работа сохранена
git status
git add .
git commit -m "Complete LR6 - Essay questions implementation"

# Создайте новую ветку для LR7
git checkout -b lr7

# Получите последние изменения из upstream
git fetch upstream

# Влейте изменения из upstream/main
git merge upstream/main
```

**⚠️ Возможны конфликты слияния** - разрешите их вручную, сохранив вашу функциональность.

### Вариант 2: Начать с чистого upstream

Если хотите начать с актуальной версии:

```bash
cd lessons/lr5

# Создайте ветку от upstream/main
git fetch upstream
git checkout -b lr7 upstream/main

# Перенесите нужные файлы из вашей lr6 ветки (опционально)
git checkout lr6 -- src/tasks/Task4.tsx
git checkout lr6 -- src/stores/gameStore.ts
# и т.д.
```

---

## Шаг 1: Установка Vitest

### 1.1 Установка зависимостей

```bash
npm install -D vitest @vitest/ui @vitest/coverage-v8
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D jsdom
```

**Что установили:**
- `vitest` - test runner (аналог Jest, но для Vite)
- `@vitest/ui` - веб-интерфейс для тестов
- `@vitest/coverage-v8` - измерение покрытия кода
- `@testing-library/react` - тестирование React компонентов
- `@testing-library/jest-dom` - дополнительные matchers для DOM
- `@testing-library/user-event` - симуляция действий пользователя
- `jsdom` - эмуляция браузера в Node.js

### 1.2 Создание конфигурации

Создайте `vitest.config.ts` в корне проекта:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'generated/',
        'mock-server/',
      ],
    },
  },
});
```

### 1.3 Создание setup файла

Создайте `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
```

Этот файл подключает дополнительные matchers для тестирования DOM:
- `toBeInTheDocument()`
- `toBeVisible()`
- `toBeDisabled()`
- и другие...

### 1.4 Обновление package.json

Добавьте scripts:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

### 1.5 Проверка установки

```bash
npm run test
```

Должно показать: `No test files found` (это нормально, тесты мы напишем дальше).

---

## Шаг 2: Декомпозиция Task4 на компоненты

### 2.1 Анализ текущего кода

Ваш `Task4.tsx` сейчас - монолитный компонент ~200-300 строк, который делает всё:
- Управляет состоянием игры
- Рендерит UI для multiple-select вопросов
- Рендерит UI для essay вопросов
- Обрабатывает отправку ответов
- Показывает результаты

### 2.2 Создание структуры компонентов

Создайте директории:

```bash
mkdir -p src/components/quiz
mkdir -p src/utils
```

### 2.3 Выделите переиспользуемые компоненты

Создайте следующие компоненты:

#### `src/components/quiz/QuizButton.tsx`
```typescript
interface QuizButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function QuizButton({
  children,
  onClick,
  disabled,
  variant = 'primary'
}: QuizButtonProps) {
  const baseClass = 'px-4 py-2 rounded font-medium transition-colors';
  const variantClass = variant === 'primary'
    ? 'bg-blue-500 text-white hover:bg-blue-600'
    : 'bg-gray-200 text-gray-800 hover:bg-gray-300';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${disabledClass}`}
    >
      {children}
    </button>
  );
}
```

#### `src/components/quiz/MultipleSelectQuestion.tsx`
```typescript
import { observer } from 'mobx-react-lite';
import type { Question } from '../../types/quiz';

interface Props {
  question: Question;
  selectedAnswers: number[];
  onToggleAnswer: (index: number) => void;
}

export const MultipleSelectQuestion = observer(({
  question,
  selectedAnswers,
  onToggleAnswer
}: Props) => {
  if (!question.options) return null;

  return (
    <div className="space-y-2">
      {question.options.map((option, index) => {
        const isSelected = selectedAnswers.includes(index);
        return (
          <button
            key={index}
            onClick={() => onToggleAnswer(index)}
            className={`w-full text-left p-4 rounded border-2 transition-all ${
              isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <span className="font-bold mr-3 text-lg">
              {isSelected ? '✓' : String.fromCharCode(65 + index)}
            </span>
            <span>{option}</span>
          </button>
        );
      })}
    </div>
  );
});
```

#### `src/components/quiz/EssayQuestion.tsx`
```typescript
import type { Question } from '../../types/quiz';

interface Props {
  question: Question;
  textAnswer: string;
  onTextChange: (text: string) => void;
}

export function EssayQuestion({ question, textAnswer, onTextChange }: Props) {
  const charCount = textAnswer.length;
  const minLength = question.minLength || 0;
  const maxLength = question.maxLength || 1000;
  const isValid = charCount >= minLength;

  return (
    <div className="space-y-2">
      <textarea
        value={textAnswer}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Введите развернутый ответ..."
        minLength={minLength}
        maxLength={maxLength}
        rows={10}
        className="w-full p-4 border-2 border-gray-300 rounded focus:border-blue-500 focus:outline-none"
      />
      <div className={`text-sm ${isValid ? 'text-gray-500' : 'text-red-500'}`}>
        Символов: {charCount}
        {minLength > 0 && ` (минимум: ${minLength})`}
        {` (максимум: ${maxLength})`}
      </div>
    </div>
  );
}
```

#### `src/components/quiz/QuizProgress.tsx`
```typescript
interface Props {
  current: number;
  total: number;
}

export function QuizProgress({ current, total }: Props) {
  const percentage = ((current + 1) / total) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Вопрос {current + 1} из {total}</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

### 2.4 Рефакторинг Task4.tsx

Обновите `Task4.tsx` для использования новых компонентов:

```typescript
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import gameStore from '../stores/gameStore';
import { QuizButton } from '../components/quiz/QuizButton';
import { QuizProgress } from '../components/quiz/QuizProgress';
import { MultipleSelectQuestion } from '../components/quiz/MultipleSelectQuestion';
import { EssayQuestion } from '../components/quiz/EssayQuestion';
import { usePostApiSessions, usePostApiSessionsSessionIdAnswers, usePostApiSessionsSessionIdSubmit } from '../../generated/api/sessions/sessions';

const Task4 = observer(() => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const currentQuestion = gameStore.currentQuestion;

  const createSession = usePostApiSessions();
  const submitAnswer = usePostApiSessionsSessionIdAnswers();
  const submitSession = usePostApiSessionsSessionIdSubmit();

  const handleStartGame = () => {
    // ... ваш код создания сессии ...
  };

  const handleNextQuestion = () => {
    // ... ваш код отправки ответа ...
  };

  const canProceed = currentQuestion?.type === 'multiple-select'
    ? gameStore.selectedAnswers.length > 0
    : gameStore.textAnswer.trim().length >= (currentQuestion?.minLength || 0);

  if (!gameStore.isPlaying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <QuizButton onClick={handleStartGame}>
          Начать игру
        </QuizButton>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <QuizProgress
        current={gameStore.currentQuestionIndex}
        total={gameStore.questions.length}
      />

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{currentQuestion.question}</h2>

        <div className="flex gap-4 mb-6 text-sm">
          <span className="px-3 py-1 bg-gray-100 rounded">
            Тип: {currentQuestion.type}
          </span>
          <span className="px-3 py-1 bg-yellow-100 rounded">
            Сложность: {currentQuestion.difficulty}
          </span>
          <span className="px-3 py-1 bg-green-100 rounded">
            Баллов: {currentQuestion.maxPoints}
          </span>
        </div>

        {currentQuestion.type === 'multiple-select' && (
          <MultipleSelectQuestion
            question={currentQuestion}
            selectedAnswers={gameStore.selectedAnswers}
            onToggleAnswer={(index) => gameStore.toggleAnswer(index)}
          />
        )}

        {currentQuestion.type === 'essay' && (
          <EssayQuestion
            question={currentQuestion}
            textAnswer={gameStore.textAnswer}
            onTextChange={(text) => gameStore.setTextAnswer(text)}
          />
        )}

        {canProceed && (
          <div className="mt-6">
            <QuizButton
              onClick={gameStore.isLastQuestion ? handleFinishGame : handleNextQuestion}
              disabled={submitAnswer.isPending || submitSession.isPending}
            >
              {gameStore.isLastQuestion ? 'Завершить' : 'Следующий вопрос'}
            </QuizButton>
          </div>
        )}
      </div>
    </div>
  );
});

export default Task4;
```

---

## Шаг 3: Написание Unit тестов

### 3.1 Тесты для утилит

Создайте `src/utils/score.ts`:

```typescript
import type { Answer } from '../types/quiz';

export function calculateTotalScore(answers: Answer[]): number {
  return answers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
}

export function getCorrectAnswersCount(answers: Answer[]): number {
  return answers.filter(a => a.isCorrect).length;
}

export function calculateAccuracy(answers: Answer[]): number {
  if (answers.length === 0) return 0;
  const correct = getCorrectAnswersCount(answers);
  return Math.round((correct / answers.length) * 100);
}
```

Создайте `src/utils/score.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateTotalScore, getCorrectAnswersCount, calculateAccuracy } from './score';

describe('score utils', () => {
  describe('calculateTotalScore', () => {
    it('calculates total score from answers', () => {
      const answers = [
        { questionId: '1', pointsEarned: 5, isCorrect: true },
        { questionId: '2', pointsEarned: 3, isCorrect: true },
      ];
      expect(calculateTotalScore(answers)).toBe(8);
    });

    it('returns 0 for empty array', () => {
      expect(calculateTotalScore([])).toBe(0);
    });

    it('handles answers without pointsEarned', () => {
      const answers = [
        { questionId: '1', isCorrect: false },
      ];
      expect(calculateTotalScore(answers)).toBe(0);
    });

    it('ignores negative points', () => {
      const answers = [
        { questionId: '1', pointsEarned: -2, isCorrect: false },
        { questionId: '2', pointsEarned: 5, isCorrect: true },
      ];
      expect(calculateTotalScore(answers)).toBe(3);
    });
  });

  describe('getCorrectAnswersCount', () => {
    it('counts correct answers', () => {
      const answers = [
        { questionId: '1', isCorrect: true },
        { questionId: '2', isCorrect: false },
        { questionId: '3', isCorrect: true },
      ];
      expect(getCorrectAnswersCount(answers)).toBe(2);
    });

    it('returns 0 for empty array', () => {
      expect(getCorrectAnswersCount([])).toBe(0);
    });

    it('returns 0 when all answers are wrong', () => {
      const answers = [
        { questionId: '1', isCorrect: false },
        { questionId: '2', isCorrect: false },
      ];
      expect(getCorrectAnswersCount(answers)).toBe(0);
    });
  });

  describe('calculateAccuracy', () => {
    it('calculates percentage of correct answers', () => {
      const answers = [
        { questionId: '1', isCorrect: true },
        { questionId: '2', isCorrect: true },
        { questionId: '3', isCorrect: false },
        { questionId: '4', isCorrect: true },
      ];
      expect(calculateAccuracy(answers)).toBe(75);
    });

    it('returns 0 for empty array', () => {
      expect(calculateAccuracy([])).toBe(0);
    });

    it('returns 100 when all correct', () => {
      const answers = [
        { questionId: '1', isCorrect: true },
        { questionId: '2', isCorrect: true },
      ];
      expect(calculateAccuracy(answers)).toBe(100);
    });
  });
});
```

Запустите тесты:

```bash
npm run test
```

Должны пройти все тесты! ✅

---

## Шаг 4: Тесты для MobX stores

Создайте `src/stores/gameStore.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { GameStore } from './gameStore';

describe('GameStore', () => {
  let store: GameStore;

  beforeEach(() => {
    store = new GameStore();
  });

  describe('initialization', () => {
    it('starts with correct default state', () => {
      expect(store.isPlaying).toBe(false);
      expect(store.currentQuestionIndex).toBe(0);
      expect(store.selectedAnswers).toEqual([]);
      expect(store.textAnswer).toBe('');
      expect(store.questions).toEqual([]);
      expect(store.answers).toEqual([]);
    });
  });

  describe('toggleAnswer', () => {
    it('adds answer to selection', () => {
      store.toggleAnswer(0);
      expect(store.selectedAnswers).toEqual([0]);
    });

    it('removes answer if already selected', () => {
      store.selectedAnswers = [0, 1, 2];
      store.toggleAnswer(1);
      expect(store.selectedAnswers).toEqual([0, 2]);
    });

    it('maintains order when adding multiple answers', () => {
      store.toggleAnswer(2);
      store.toggleAnswer(0);
      store.toggleAnswer(1);
      expect(store.selectedAnswers).toEqual([2, 0, 1]);
    });
  });

  describe('setTextAnswer', () => {
    it('updates text answer', () => {
      store.setTextAnswer('My answer');
      expect(store.textAnswer).toBe('My answer');
    });

    it('can clear text answer', () => {
      store.setTextAnswer('Text');
      store.setTextAnswer('');
      expect(store.textAnswer).toBe('');
    });
  });

  describe('nextQuestion', () => {
    beforeEach(() => {
      store.questions = [
        { id: '1', type: 'multiple-select', question: 'Q1', options: [], difficulty: 'easy', maxPoints: 5 },
        { id: '2', type: 'essay', question: 'Q2', difficulty: 'medium', maxPoints: 10 },
      ];
      store.currentQuestionIndex = 0;
    });

    it('increments question index', () => {
      store.nextQuestion();
      expect(store.currentQuestionIndex).toBe(1);
    });

    it('clears selected answers', () => {
      store.selectedAnswers = [0, 1];
      store.nextQuestion();
      expect(store.selectedAnswers).toEqual([]);
    });

    it('clears text answer', () => {
      store.textAnswer = 'Some text';
      store.nextQuestion();
      expect(store.textAnswer).toBe('');
    });

    it('does not go beyond last question', () => {
      store.currentQuestionIndex = 1;
      store.nextQuestion();
      expect(store.currentQuestionIndex).toBe(2); // может быть 1, в зависимости от реализации
    });
  });

  describe('computed properties', () => {
    beforeEach(() => {
      store.questions = [
        { id: '1', type: 'multiple-select', question: 'Q1', options: [], difficulty: 'easy', maxPoints: 5 },
        { id: '2', type: 'essay', question: 'Q2', difficulty: 'medium', maxPoints: 10 },
        { id: '3', type: 'multiple-select', question: 'Q3', options: [], difficulty: 'hard', maxPoints: 15 },
      ];
    });

    it('currentQuestion returns correct question', () => {
      store.currentQuestionIndex = 1;
      expect(store.currentQuestion?.id).toBe('2');
    });

    it('currentQuestion returns undefined for invalid index', () => {
      store.currentQuestionIndex = 99;
      expect(store.currentQuestion).toBeUndefined();
    });

    it('isLastQuestion returns true for last question', () => {
      store.currentQuestionIndex = 2;
      expect(store.isLastQuestion).toBe(true);
    });

    it('isLastQuestion returns false for non-last question', () => {
      store.currentQuestionIndex = 0;
      expect(store.isLastQuestion).toBe(false);
    });
  });
});
```

---

## Шаг 5: Тесты для React компонентов

### 5.1 Тест для QuizButton

Создайте `src/components/quiz/QuizButton.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { QuizButton } from './QuizButton';

describe('QuizButton', () => {
  it('renders with children text', () => {
    render(<QuizButton onClick={() => {}}>Click me</QuizButton>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<QuizButton onClick={handleClick}>Submit</QuizButton>);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<QuizButton onClick={() => {}} disabled>Disabled</QuizButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    render(<QuizButton onClick={handleClick} disabled>Disabled</QuizButton>);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies primary variant styles by default', () => {
    render(<QuizButton onClick={() => {}}>Primary</QuizButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-blue-500');
  });

  it('applies secondary variant styles when specified', () => {
    render(<QuizButton onClick={() => {}} variant="secondary">Secondary</QuizButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-gray-200');
  });
});
```

### 5.2 Тест для EssayQuestion

Создайте `src/components/quiz/EssayQuestion.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { EssayQuestion } from './EssayQuestion';

describe('EssayQuestion', () => {
  const mockQuestion = {
    id: 'q1',
    type: 'essay' as const,
    question: 'Explain React hooks',
    minLength: 50,
    maxLength: 500,
    difficulty: 'medium' as const,
    maxPoints: 10,
  };

  it('renders textarea', () => {
    render(
      <EssayQuestion
        question={mockQuestion}
        textAnswer=""
        onTextChange={() => {}}
      />
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays character count', () => {
    render(
      <EssayQuestion
        question={mockQuestion}
        textAnswer="Hello World"
        onTextChange={() => {}}
      />
    );
    expect(screen.getByText(/Символов: 11/)).toBeInTheDocument();
  });

  it('shows minimum length requirement', () => {
    render(
      <EssayQuestion
        question={mockQuestion}
        textAnswer=""
        onTextChange={() => {}}
      />
    );
    expect(screen.getByText(/минимум: 50/)).toBeInTheDocument();
  });

  it('shows maximum length requirement', () => {
    render(
      <EssayQuestion
        question={mockQuestion}
        textAnswer=""
        onTextChange={() => {}}
      />
    );
    expect(screen.getByText(/максимум: 500/)).toBeInTheDocument();
  });

  it('calls onTextChange when user types', async () => {
    const handleChange = vi.fn();
    render(
      <EssayQuestion
        question={mockQuestion}
        textAnswer=""
        onTextChange={handleChange}
      />
    );

    const user = userEvent.setup();
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'New text');

    expect(handleChange).toHaveBeenCalled();
  });

  it('displays current value in textarea', () => {
    const currentAnswer = 'This is my current answer';
    render(
      <EssayQuestion
        question={mockQuestion}
        textAnswer={currentAnswer}
        onTextChange={() => {}}
      />
    );

    expect(screen.getByRole('textbox')).toHaveValue(currentAnswer);
  });
});
```

### 5.3 Тест для MultipleSelectQuestion

Создайте `src/components/quiz/MultipleSelectQuestion.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MultipleSelectQuestion } from './MultipleSelectQuestion';

describe('MultipleSelectQuestion', () => {
  const mockQuestion = {
    id: 'q1',
    type: 'multiple-select' as const,
    question: 'Which are React hooks?',
    options: ['useState', 'useEffect', 'useClass', 'useMemo'],
    difficulty: 'easy' as const,
    maxPoints: 4,
  };

  it('renders all options', () => {
    render(
      <MultipleSelectQuestion
        question={mockQuestion}
        selectedAnswers={[]}
        onToggleAnswer={() => {}}
      />
    );

    expect(screen.getByText(/useState/)).toBeInTheDocument();
    expect(screen.getByText(/useEffect/)).toBeInTheDocument();
    expect(screen.getByText(/useClass/)).toBeInTheDocument();
    expect(screen.getByText(/useMemo/)).toBeInTheDocument();
  });

  it('displays letter labels for unselected options', () => {
    render(
      <MultipleSelectQuestion
        question={mockQuestion}
        selectedAnswers={[]}
        onToggleAnswer={() => {}}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('A');
    expect(buttons[1]).toHaveTextContent('B');
    expect(buttons[2]).toHaveTextContent('C');
    expect(buttons[3]).toHaveTextContent('D');
  });

  it('displays checkmarks for selected options', () => {
    render(
      <MultipleSelectQuestion
        question={mockQuestion}
        selectedAnswers={[0, 2]}
        onToggleAnswer={() => {}}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('✓');
    expect(buttons[1]).toHaveTextContent('B');
    expect(buttons[2]).toHaveTextContent('✓');
    expect(buttons[3]).toHaveTextContent('D');
  });

  it('calls onToggleAnswer with correct index when clicked', async () => {
    const handleToggle = vi.fn();
    render(
      <MultipleSelectQuestion
        question={mockQuestion}
        selectedAnswers={[]}
        onToggleAnswer={handleToggle}
      />
    );

    const user = userEvent.setup();
    const firstOption = screen.getByText(/useState/);
    await user.click(firstOption);

    expect(handleToggle).toHaveBeenCalledWith(0);
  });

  it('renders nothing when options are undefined', () => {
    const questionWithoutOptions = { ...mockQuestion, options: undefined };
    const { container } = render(
      <MultipleSelectQuestion
        question={questionWithoutOptions}
        selectedAnswers={[]}
        onToggleAnswer={() => {}}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
```

---

## Шаг 6: Запуск и проверка coverage

### 6.1 Запуск всех тестов

```bash
npm run test
```

Все тесты должны пройти! ✅

### 6.2 Проверка coverage

```bash
npm run test:coverage
```

Откройте `coverage/index.html` в браузере для детального отчета.

**Цель:** ≥70% coverage

### 6.3 UI Mode (опционально)

```bash
npm run test:ui
```

Откроется веб-интерфейс на `http://localhost:51204` с интерактивным просмотром тестов.

---

## Шаг 7: Playwright E2E тесты (опционально)

### 7.1 Установка Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

### 7.2 Конфигурация

Создайте `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

Обновите `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### 7.3 Создайте E2E тест

Создайте `e2e/quiz-flow.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Quiz Application E2E', () => {
  test('user can start quiz and answer question', async ({ page }) => {
    await page.goto('/');

    // Начать игру
    await page.click('text=Начать игру');

    // Дождаться загрузки вопроса
    await expect(page.locator('h2')).toBeVisible();

    // Проверить наличие прогресс-бара
    await expect(page.locator('text=/Вопрос \\d+ из \\d+/')).toBeVisible();

    // Если это multiple-select - выбрать вариант
    const firstOption = page.locator('button').filter({ hasText: /^A/ }).first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
      await expect(firstOption).toContainText('✓');
    }
  });

  test('essay question shows textarea and character counter', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Начать игру');

    const textarea = page.locator('textarea');
    if (await textarea.count() > 0) {
      await textarea.fill('A'.repeat(100));
      await expect(page.locator('text=/Символов: 100/')).toBeVisible();
    }
  });
});
```

### 7.4 Запуск E2E тестов

```bash
npm run test:e2e
```

---

## Критерии оценки

- ✅ **Setup (10%):** Vitest корректно настроен
- ✅ **Рефакторинг (25%):** Task4 декомпозирован на ≥4 компонента
- ✅ **Unit тесты (25%):** Тесты для utils и stores (≥10 тестов)
- ✅ **Component тесты (30%):** ≥3 компонента покрыты тестами
- ✅ **Coverage (10%):** ≥70% coverage
- 🌟 **Бонус:** E2E тесты с Playwright (+10%)

---

## Частые проблемы и решения

### Проблема: "Cannot find module '@testing-library/jest-dom'"

**Решение:**
```bash
npm install -D @testing-library/jest-dom
```

### Проблема: "ReferenceError: expect is not defined"

**Решение:** Убедитесь что в `vitest.config.ts` установлен `globals: true`

### Проблема: Тесты не находят компоненты MobX

**Решение:** Оберните тест в observer или используйте `act()`:

```typescript
import { observer } from 'mobx-react-lite';

const TestComponent = observer(() => <MultipleSelectQuestion {...props} />);
render(<TestComponent />);
```

### Проблема: "Cannot read property 'click' of null"

**Решение:** Используйте `await` для async действий:

```typescript
const user = userEvent.setup();
await user.click(element);
```

---

## Полезные ссылки

### Документация
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Jest matchers (работают в Vitest)](https://jestjs.io/docs/expect)

### Cheat Sheets
- [RTL Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)
- [Vitest API](https://vitest.dev/api/)
- [Local Cheatsheet](./docs/cheatsheet.md)

---

## Следующие шаги

После завершения этой лабораторной работы вы можете:

1. **Увеличить coverage** - добавить тесты для остальных компонентов
2. **MSW** - настроить Mock Service Worker для мокирования API
3. **Snapshot тесты** - добавить тесты на соответствие UI
4. **A11y тесты** - проверить accessibility с @axe-core/playwright

=======
# Программа курса "Веб-программирование с TypeScript и React"

## Общая информация

**Продолжительность:** 10 занятий (включая ознакомительное)
**Формат:** 9 лекций (90 мин) + 9 лабораторных работ (180 мин) + 1 ознакомительное занятие
**Целевая аудитория:** Студенты с поверхностным знанием HTML, CSS, JavaScript и React

> **Примечание для текущего семестра:** Занятия 8-9 (React Native и Production Deployment) переносятся на следующий семестр. В этом семестре завершаем на занятии 7.

## Технологический стек

**Frontend (LR1-7):**

- TypeScript, React, Vite, Tailwind CSS
- Управление состоянием: MobX, Zustand
- Тестирование: Vitest, React Testing Library, Playwright

**Backend (LR8-10):**

- Node.js + Hono (TypeScript-first framework)
- Prisma ORM + SQLite (или PostgreSQL в production)
- Zod для валидации + JWT для аутентификации
- REST API + OpenAPI/Swagger спецификации

**DevOps & Deployment (LR11-13):**

- Docker для контейнеризации
- GitHub Actions для CI/CD
- PWA (Service Workers, Web App Manifest)
- Deployment: Vercel/Netlify (frontend) + Railway/Render (backend)

**Инструменты:** ESLint, Prettier, Git, Postman/Insomnia

---

## Занятие 0

### Ознакомительное занятие

**Цели:**

- Онбординг студентов
- Знакомство с процессом работы (fork → pull request)
- Диагностика текущих знаний

**Содержание:**

- Введение в курс и методологию работы
- Диагностическая лабораторная работа (HTML, CSS, JavaScript)
- Настройка рабочего окружения (Git, IDE)

---

## Занятие 1: Основы TypeScript

### Лекция: Введение в TypeScript

**Темы:**

- Мотивация перехода с JavaScript на TypeScript
- Система типов: примитивы, объекты, массивы
- Union и intersection типы
- Интерфейсы и типы (type vs interface)
- Generics для начинающих
- Настройка tsconfig.json
- Работа с внешними библиотеками (@types)

### Лабораторная работа: Практика TypeScript

**Задачи:**

- Рефакторинг существующего JavaScript кода в TypeScript
- Создание типизированных функций и объектов
- Работа с массивами и объектами сложной структуры
- Создание интерфейсов для API responses
- Практика с generics
- Решение типовых проблем типизации

---

## Занятие 2: React + TypeScript

### Лекция: React с типизацией

**Темы:**

- **Быстрое освежение React:** компоненты, props, state, хуки
- **Типизация React компонентов:**
  - Функциональные компоненты с TypeScript
  - Типизация props (включая children и callback props)
  - Типизация состояния (useState, useReducer)
  - Event handlers в TypeScript
  - Типизация useEffect и кастомных хуков
  - Работа с ref'ами

### Лабораторная работа: Практика React + TypeScript

**Задачи:**

- Создание сложных типизированных компонентов
- Передача данных между компонентами с типизацией
- Работа с формами и валидацией
- Условный рендеринг и списки
- Композиция компонентов
- Создание переиспользуемых типизированных компонентов

---

## Занятие 3: Современный стек разработки

### Лекция: Vite + Tailwind CSS

**Темы:**

- Сравнение Vite с Create React App
- Настройка проекта: Vite + React + TypeScript
- Конфигурация Vite (vite.config.ts)
- Введение в Tailwind CSS
- Utility-first подход к стилизации
- Интеграция Tailwind с Vite
- Hot Module Replacement (HMR) и dev experience
- Настройка ESLint + Prettier для TypeScript

### Лабораторная работа: Освоение стека

**Задачи:**

- Инициализация нескольких проектов с нуля
- Настройка полного dev окружения
- Создание компонентной библиотеки с Tailwind
- Responsive дизайн и мобильная адаптация
- Настройка линтинга и форматирования
- Оптимизация dev experience

---

## Занятие 4: Управление состоянием - MobX + Zustand

### Лекция: Современный state management

**MobX:**

- Концепции: Observable, Action, Computed
- Создание stores с TypeScript
- Интеграция с React (observer HOC/hook)
- Архитектурные паттерны с MobX
- Best practices и распространенные ошибки

**Zustand:**

- Минималистичный API
- TypeScript типизация store'ов
- Создание простых глобальных store'ов
- Middleware и persistence

**Комбинирование:**

- Когда использовать MobX vs Zustand
- Паттерны совместного использования
- Архитектурные решения

### Лабораторная работа: Комплексное приложение с состоянием

**Задачи:**

- Создание MobX stores для бизнес-логики
- Zustand для UI состояния и пользовательских настроек
- API интеграция с обработкой ошибок
- Полная типизация всех store'ов
- Реализация оптимистичных обновлений
- Практика с различными сценариями состояния
- Отладка и профилирование состояния

---

## Занятие 5: HTTP и API Fundamentals

### Лекция: Глубокое погружение в работу с API

**Часть 1: HTTP протокол**

- **HTTP методы детально:**
  - GET (идемпотентность, кэширование)
  - POST vs PUT vs PATCH (семантика, idempotency)
  - DELETE
  - OPTIONS, HEAD (preflight, metadata)
- **Коды ответов по категориям:**
  - 2xx: успех (200, 201, 204)
  - 3xx: редиректы (301, 302, 304)
  - 4xx: клиентские ошибки (400, 401, 403, 404, 422, 429)
  - 5xx: серверные ошибки (500, 502, 503)
- **Headers:** Content-Type, Authorization, Cache-Control, CORS

**Часть 2: Форматы передачи данных**

- **JSON:** стандарт для современных API
- **Query params:** фильтрация, сортировка, пагинация
- **URL/Path params:** REST ресурсы
- **Request body:** JSON vs FormData
- **Multipart/form-data:** загрузка файлов
- **XML:** legacy APIs (краткий обзор)
- **gRPC + Protocol Buffers:** обзор (когда нужна производительность)

**Часть 3: REST архитектура**

- Принципы REST
- **CRUD → HTTP методы маппинг:**
  - Create → POST /resources
  - Read → GET /resources/:id
  - Update → PUT/PATCH /resources/:id
  - Delete → DELETE /resources/:id
- Именование endpoints (множественное число, вложенность)
- Stateless коммуникация

**Часть 4: Real-time и альтернативы**

- **WebSockets:** двусторонняя связь
- **Server-Sent Events (SSE):** уведомления от сервера
- **Long polling:** историческая справка
- **HTTP/2 и gRPC:** мультиплексирование, streaming

**Часть 5: Валидация данных**

- **Клиентская vs серверная валидация:**
  - Почему нужны обе
  - UX vs безопасность
- **Валидация на уровне API:**
  - HTTP 422 Unprocessable Entity
  - Структура ошибок валидации в responses
  - Стандарты описания ошибок (RFC 7807, JSON:API)
- **Типы валидации:**
  - Структурная (типы данных, обязательные поля)
  - Бизнес-правила (ограничения, форматы)
  - Референциальная (внешние ключи, связи)

**Часть 6: AAA - Authentication, Authorization, Accounting**

- **Различие понятий:**
  - Authentication (кто ты?)
  - Authorization (что тебе можно?)
  - Accounting (что ты делал?)
- **Механизмы аутентификации:**
  - Session-based (cookies)
  - Token-based (JWT)
  - OAuth 2.0 flows
- **GitHub OAuth детально (для лабы):**
  - Authorization Code flow
  - Redirect URI
  - Access tokens и scopes
- **JWT структура:** header.payload.signature
- **Bearer tokens** в заголовках
- **Refresh tokens** и их ротация

### Лабораторная работа: GitHub OAuth интеграция

**Задачи:**

- Регистрация GitHub OAuth App
- Реализация Authorization Code flow
- Обработка callback и получение access token
- Работа с GitHub API (получение профиля пользователя)
- Хранение токенов (localStorage vs memory, безопасность)
- Protected routes на основе авторизации
- Обработка различных HTTP статусов (401, 403, 422, 429)
- **Валидация ответов от API** (проверка структуры данных)
- Pagination через GitHub API (query params, Link headers)
- Error handling для auth flow с детальными сообщениями валидации
- Refresh token flow (опционально)

> **Примечание:** В следующих семестрах рекомендуется проводить это занятие ПЕРЕД занятием 6, так как оно закладывает фундаментальные знания для работы с react-query и OpenAPI.

---

## Занятие 6: Продвинутые React паттерны + API

### Лекция: Advanced React + работа с данными

**Темы:**

- Кастомные хуки с TypeScript
- Error Boundaries и обработка ошибок
- React.memo, useMemo, useCallback для оптимизации
- Suspense и concurrent features
- Паттерны работы с API (fetch, axios)
- **Валидация на клиенте:**
  - Библиотеки валидации (Zod, Yup, io-ts)
  - React Hook Form + схемы валидации
  - Реактивная валидация и UX
  - TypeScript типы из схем валидации
- **React Query:** декларативная работа с данными
- **OpenAPI/Swagger:** типобезопасная генерация клиентов + схемы валидации
- Композиция компонентов и render props
- Контекст и провайдеры

### Лабораторная работа: Архитектура и API интеграция

**Задачи:**

- Рефакторинг приложения под производительность
- Создание переиспользуемых архитектурных решений
- **Валидация форм:**
  - Интеграция Zod/Yup с React Hook Form
  - Создание переиспользуемых схем валидации
  - Валидация API responses с типобезопасностью
  - Отображение ошибок валидации в UI
- Сложные API интеграции с различными endpoints
- Интеграция React Query для кэширования
- Генерация API клиента из OpenAPI спецификации (с автоматическими схемами валидации)
- Кэширование данных и синхронизация
- Профилирование и оптимизация React приложения
- Создание системы компонентов

---

## Занятие 7: Testing - Vitest & Playwright

### Лекция: Автоматическое тестирование React приложений

**Часть 1: Введение в тестирование**

- Зачем нужно тестирование (уверенность, документация, экономия времени)
- Тестовая пирамида: Unit (60-70%), Integration (20-30%), E2E (5-10%)
- **Jest vs Vitest:**
  - Jest - индустриальный стандарт (70% проектов)
  - Vitest - современная альтернатива (в 2-10 раз быстрее)
  - API на 95% совместим - знание переносится
  - Vitest для курса: нативная интеграция с Vite, лучший DX

**Часть 2: Vitest - Unit & Component тесты**

- Setup Vitest + React Testing Library
- Структура теста: AAA pattern (Arrange, Act, Assert)
- Matchers (assertions): toBe, toEqual, toContain, toThrow
- **Моки (Mocking):**
  - Mock функций: `vi.fn()` (в Jest: `jest.fn()`)
  - Mock модулей: `vi.mock()`
  - Spy на методы: `vi.spyOn()`
- **React Testing Library:**
  - Философия: тестируем как пользователь
  - Queries приоритеты: getByRole → getByLabelText → getByText → getByTestId
  - User Events: `userEvent.click()`, `userEvent.type()`
  - Async testing: `findBy*`, `waitFor()`
- **Jest-DOM matchers:** toBeInTheDocument, toBeVisible, toBeDisabled
- Тестирование MobX stores

**Часть 3: Playwright - E2E тестирование**

- Что такое E2E и когда использовать
- Setup Playwright (автозапуск dev-сервера)
- Написание E2E теста (полный user flow)
- Локаторы: getByRole, getByText, CSS selectors
- Actions: click, fill, type, select
- Assertions: toBeVisible, toHaveText, toHaveValue
- UI Mode для debugging

**Часть 4: Best Practices**

- Тестируйте поведение, не implementation details
- Один тест = одна проверка
- Не мокайте всё подряд
- Используйте правильные селекторы (getByRole)
- Coverage ≠ качество (70-80% достаточно)

### Лабораторная работа: Тестирование Quiz приложения

**Задачи:**

**Часть 1: Setup**

- Установка Vitest, RTL, Playwright
- Конфигурация vitest.config.ts и playwright.config.ts
- Создание setup файлов

**Часть 2: Рефакторинг на компоненты**

- Декомпозиция Task4.tsx на переиспользуемые компоненты:
  - QuizButton - переиспользуемая кнопка
  - MultipleSelectQuestion - вопросы с выбором
  - EssayQuestion - текстовые вопросы
  - QuizProgress - индикатор прогресса

**Часть 3: Unit тесты**

- Тесты для utils (calculateScore, getCorrectAnswersCount)
- Тесты для gameStore (toggleAnswer, nextQuestion, computed properties)
- ≥10 unit тестов

**Часть 4: Component тесты**

- Тесты для QuizButton (render, onClick, disabled)
- Тесты для EssayQuestion (textarea, character count, onChange)
- Тесты для MultipleSelectQuestion (options, selection, toggle)
- ≥3 компонента покрыты тестами

**Часть 5: E2E тесты (30 мин, опционально)**

- E2E тест: прохождение квиза
- E2E тест: разные типы вопросов
- Проверка полного user flow

---

## Занятие 8: Backend API with Hono + TypeScript

### Лекция: От потребления API к созданию API (90 мин)

**Часть 1: Architektura Fullstack приложения**

- Как взаимодействуют Frontend и Backend
- Зачем нужен Backend (хранение данных, бизнес-логика, безопасность)
- REST API концепция (endpoints, методы, статусы)
- Fullstack архитектура: Frontend → Backend → Database

**Часть 2: Hono Framework**

- Почему Hono (TypeScript-first, быстро, минимальный setup)
- Сравнение с Express, Fastify, Next.js
- Основные концепции: routes, handlers, middleware
- Типизация с TypeScript

**Часть 3: Prisma ORM**

- Что такое ORM и когда нужна
- Prisma Schema и models
- Type-safe запросы к БД (типизация автоматическая)
- Миграции и синхронизация БД

**Часть 4: Валидация и безопасность**

- Zod для runtime валидации
- JWT аутентификация (tokens, refresh, revocation)
- Middleware для проверки авторизации
- Обработка ошибок (правильные HTTP коды)

**Часть 5: OpenAPI спецификация**

- Стандарт описания REST API (контракт между frontend и backend)
- Как backend реализует endpoints согласно схеме
- Автоматическая генерация типов для frontend

**Этап 1: Настройка cross-platform проекта**

- Создание React Native проекта с ReactStrict-DOM
- Настройка TypeScript конфигурации для mobile
- Интеграция существующих компонентов и stores (MobX/Zustand)
- Настройка hot reload для мобильной разработки
- Первый запуск на эмуляторе Android/iOS

**Этап 2: Адаптация под мобильные**

- Рефакторинг веб-компонентов для ReactStrict-DOM
- Создание мобильной навигации (стеки, табы, модалы)
- Адаптация форм под touch-интерфейсы
- Responsive компоненты с учетом размеров экрана
- Обработка состояний клавиатуры и orientation

**Этап 3: Нативные возможности**

- Интеграция с нативными API через ReactStrict-DOM
- Работа с камерой и галереей фотографий
- Push-уведомления и background tasks
- Offline functionality и синхронизация данных
- Тестирование на реальных устройствах

**Этап 1: Setup (30 мин)**

- Инициализация Node.js проекта с TypeScript
- Установка Hono, Prisma, Zod, JWT
- Конфигурация окружения

**Этап 2: Настройка БД (30 мин)**

- Prisma schema для Quiz приложения
- Models: User, Category, Question, Session, Answer
- Миграция БД (SQLite для разработки)
- Prisma Studio для просмотра данных

**Этап 3: Реализация Endpoints (90 мин)**

- Auth endpoints (POST /api/auth/github/callback, GET /api/auth/me)
- Categories endpoints (GET, POST)
- Questions endpoints (GET)
- Sessions endpoints (POST, GET, POST /answers)
- Валидация с Zod + обработка ошибок

**Этап 4: Интеграция с Frontend (30 мин)**

- Замена mock API на реальный backend
- Тестирование endpoints через curl/Postman
- Проверка что React приложение работает с backend

---

## Занятие 9: Database & Business Logic - Scoring Algorithm

### Лекция: Advanced Backend - База данных и бизнес-логика (90 мин)

**Часть 1: Advanced Prisma**

- Relationships: one-to-many, many-to-many
- Transactions (атомарные операции)
- Batch operations (createMany, updateMany)
- Performance: select (выбираем только нужные поля), include (связи)

**Часть 2: Scoring Algorithm**

- Multiple-select вопросы: правильные ответы, штрафы, баллы
- Essay вопросы: rubric-based scoring, отзывы
- Session management: completion, expiration, results
- Admin endpoints для проверки и оценивания

**Часть 3: Валидация на сервере**

- Валидация на входе (Zod schemas)
- Бизнес-правила валидации
- Обработка edge cases

**Часть 4: Database в production**

- Миграции в production (как безопасно обновлять schema)
- Backup и recovery
- Performance optimization (индексы, query планы)

### Лабораторная работа: Scoring Logic & Database Optimization (180 мин)

**Этап 1: Реализация Scoring Algorithm (60 мин)**

- Функции для подсчёта баллов за разные типы вопросов
- Integration в Session endpoints
- Проверка корректности scoring на разных сценариях

**Этап 2: Advanced Database (60 мин)**

- Оптимизация queries (select вместо findMany())
- Транзакции для критичных операций
- Добавление indексов для часто используемых полей

**Этап 3: Integration Testing (30 мин)**

- Тестирование scoring через API
- Проверка edge cases (пустые ответы, time limits)
- Testing admin endpoints для оценивания

**Этап 4: Admin Features (30 мин)**

- Admin endpoints для управления вопросами
- Оценивание essay ответов
- Reporting и статистика

---

## Занятие 10: Backend Testing & Validation

### Лекция: Тестирование Backend приложений (90 мин)

**Часть 1: Unit Testing Backend**

- Тестирование функций (scoring, calculations)
- Моки для Prisma (mocking БД)
- Тестирование validation schema (Zod)

**Часть 2: Integration Testing**

- Тестирование endpoints (request/response)
- Использование test client для Hono
- Fixtures и seed данные для тестов

**Часть 3: API Testing**

- Инструменты: Postman, Insomnia, curl
- Создание collections для testing
- Автоматизация API тестов

**Часть 4: Security Testing**

- Testing authentication (JWT tokens)
- Authorization (доступ к ресурсам)
- Input validation (防SQL injection)

### Лабораторная работа: Полное тестирование Backend (180 мин)

**Этап 1: Unit Tests (60 мин)**

- Тесты для scoring функций
- Тесты для Zod validation
- ≥10 unit тестов

**Этап 2: Integration Tests (60 мин)**

- Тесты для auth endpoints
- Тесты для session flow
- ≥5 integration тестов

**Этап 3: Manual API Testing (30 мин)**

- Создание Postman collection
- Тестирование всех endpoints
- Проверка error handling

**Этап 4: Test Coverage (30 мин)**

- Достичь ≥70% code coverage
- Идентификация untested code

---

## Занятие 11: DevOps - Docker & CI/CD

### Лекция: Контейнеризация и автоматизация (90 мин)

**Часть 1: Docker Basics**

- Что такое Docker и почему нужен (окружение, портативность)
- Docker images vs containers
- Dockerfile: инструкции, best practices
- Docker Compose для multi-container приложений

**Часть 2: Containerizing Backend**

- Dockerfile для Node.js приложения
- Оптимизация image size (multi-stage builds)
- Environment variables и secrets
- Volume mounting для development

**Часть 3: CI/CD с GitHub Actions**

- Что такое CI/CD (автоматизация testing и deployment)
- GitHub Actions workflow
- Triggers (push, pull request, schedule)
- Jobs и steps

**Часть 4: Deployment**

- Deployment platforms (Railway, Render, Heroku)
- Database hosting (Neon, Supabase)
- Environment configuration
- Monitoring logs и errors

### Лабораторная работа: Полный DevOps Setup (180 мин)

**Этап 1: Docker Setup (60 мин)**

- Создание Dockerfile для backend
- Docker Compose для backend + database
- Testing локально в container

**Этап 2: GitHub Actions (60 мин)**

- Создание workflow для CI (запуск тестов)
- Автоматический build и push образа
- Deployment на staging окружение

**Этап 3: Production Deployment (30 мин)**

- Deploy на Railway/Render
- Настройка database в production
- Testing production окружения

**Этап 4: Monitoring (30 мин)**

- Настройка логирования
- Error tracking (Sentry)
- Performance monitoring

---

## Занятие 12: PWA & Offline-first

### Лекция: Progressive Web Apps (90 мин)

**Часть 1: PWA концепция**

- Что такое PWA (progressive, web, app)
- Преимущества PWA vs native apps
- PWA критерии (installable, fast, reliable)

**Часть 2: Service Workers**

- Что такое Service Worker (worker process для offline)
- Registration и lifecycle
- Fetch interception (кэширование)
- Background sync

**Часть 3: Offline Strategy**

- Cache-first vs network-first vs stale-while-revalidate
- Offline data storage (IndexedDB, localStorage)
- Синхронизация данных при возврате online

**Часть 4: Web App Manifest & Installation**

- Web App Manifest (metadata для installable app)
- Install prompt (как предложить install)
- App icons и splash screens

### Лабораторная работа: PWA Implementation (180 мин)

**Этап 1: Service Worker Setup (60 мин)**

- Регистрация Service Worker
- Fetch interception и caching
- Offline fallback page

**Этап 2: Offline Support (60 мин)**

- Сохранение ответов пользователя (IndexedDB)
- Синхронизация при reconnect
- Обработка конфликтов данных

**Этап 3: Installation (30 мин)**

- Web App Manifest
- Install prompt
- App icons

**Этап 4: Testing (30 мин)**

- Testing offline mode
- Chrome DevTools для PWA
- Testing на мобильном

---

## Занятие 13: Fullstack Завершение & Best Practices

### Лекция: Production-Ready приложение (90 мин)

**Часть 1: Security**

- HTTPS и TLS
- CORS правильно
- Rate limiting
- Input sanitization

**Часть 2: Performance**

- Frontend: Code splitting, lazy loading, image optimization
- Backend: Database indexing, query optimization, caching
- Network: CDN для статических файлов

**Часть 3: Scaling**

- Горизонтальное масштабирование
- Load balancing
- Database replication
- Caching layer (Redis)

**Часть 4: Deployment Strategy**

- Blue-green deployment
- Canary releases
- Rollback стратегии
- Monitoring и alerting

### Лабораторная работа: Полное production-ready приложение (180 мин)

**Этап 1: Оптимизация (60 мин)**

- Bundle analysis и optimization (frontend)
- Database query optimization (backend)
- Performance тестирование

**Этап 2: Security Audit (30 мин)**

- OWASP top 10 проверка
- Dependency vulnerability scanning
- Security headers настройка

**Этап 3: Full Deployment (60 мин)**

- Deploy frontend на Vercel/Netlify
- Deploy backend на Railway/Render
- Настройка custom domain
- SSL certificates

**Этап 4: Monitoring & Documentation (30 мин)**

- Настройка Sentry для monitoring
- API documentation (OpenAPI/Swagger UI)
- README и deployment guide
- Architecture documentation

---

## Финальный проект: Full-Stack Quiz Application

К концу курса студенты создают полноценное fullstack веб-приложение - Quiz платформу с поддержкой работы offline.

### Архитектура проекта:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (LR1-7, 12)                     │
│  React + TypeScript + Vite + Tailwind + MobX + Zustand     │
│                   Service Worker (PWA)                       │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP REST API
┌────────────────────────▼────────────────────────────────────┐
│                   BACKEND (LR8-11)                           │
│    Node.js + Hono + TypeScript + Prisma + Zod + JWT         │
│              Docker + GitHub Actions CI/CD                   │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL
┌────────────────────────▼────────────────────────────────────┐
│                   DATABASE (LR9, 11)                         │
│                SQLite (dev) → PostgreSQL (prod)              │
└─────────────────────────────────────────────────────────────┘
```

### Технические требования:

**Frontend (LR1-7, 12):**

- TypeScript + React + Vite + Tailwind CSS
- MobX (бизнес-логика) + Zustand (UI состояние)
- React Query для синхронизации с backend
- Vitest (unit/component) + Playwright (E2E тесты)
- Service Worker для offline support (PWA)
- Test coverage ≥70%

**Backend (LR8-11):**

- Node.js + Hono (TypeScript-first framework)
- Prisma ORM + Zod validation
- JWT аутентификация + middleware
- RESTful API согласно OpenAPI спецификации
- Scoring algorithm для оценивания ответов
- Unit + Integration тесты (≥70% coverage)
- Docker контейнеризация
- GitHub Actions CI/CD pipeline

**DevOps & Deployment (LR11, 13):**

- Docker для контейнеризации
- GitHub Actions для автоматического тестирования и deployment
- Deployment: Vercel/Netlify (frontend) + Railway/Render (backend)
- Database: PostgreSQL в production
- Monitoring: Sentry для error tracking
- Performance: Lighthouse score ≥90

**Quality Metrics:**

- Frontend: Test coverage ≥70%, Lighthouse ≥90
- Backend: Test coverage ≥70%, API dokumentation (OpenAPI)
- Security: HTTPS, JWT tokens, CORS, input validation
- Performance: API response time <200ms, Frontend load <2s

### Функциональные возможности:

**Аутентификация:**

- GitHub OAuth интеграция
- JWT tokens с refresh механизмом
- Role-based access control (student, admin)

**Quiz функциональность:**

- Создание квизов с разными типами вопросов
  - Multiple-select (с штрафами за неправильные)
  - Essay (с проверкой преподавателем)
- Session management (start, pause, submit)
- Real-time scoring и feedback
- Прогресс бар и таймер
- History и результаты прошлых попыток

**Admin функциональность:**

- Создание и управление вопросами
- Проверка essay ответов
- Просмотр статистики студентов
- Экспорт результатов

**Offline функциональность (PWA):**

- Работа без интернета (Service Worker)
- Сохранение ответов в IndexedDB
- Синхронизация при восстановлении соединения
- Installable как мобильное приложение

**Качество кода:**

- Типобезопасный код везде (Frontend + Backend)
- Обработка ошибок и graceful degradation
- Loading states и skeleton screens
- Доступность (a11y) - ARIA labels, keyboard navigation
- Responsive дизайн (мобильные устройства)
- Pagination и infinite scroll
- Кэширование данных (React Query + Service Worker)

### Deployment & Monitoring:

- CI/CD pipeline на каждый push
- Автоматические тесты перед deployment
- Production deployment с zero downtime
- Error tracking и monitoring (Sentry)
- Performance tracking (Web Vitals)
- API documentation (Swagger UI)

---

## Методология работы

### Процесс выполнения лабораторных работ:

1. Форк репозитория курса
2. Выполнение задания (в классе или дома)
3. Отправка Pull Request для проверки

### Материалы для подготовки:

- Конспекты в директориях `lr*/docs/`
- Интерактивные руководства
- Примеры кода

---

## Ожидаемые результаты

По завершении курса студенты будут уметь:

### Frontend разработка (LR1-7, 12):

- ✅ Разрабатывать типобезопасные React приложения с TypeScript
- ✅ Использовать современные инструменты разработки (Vite, Tailwind CSS)
- ✅ Эффективно управлять состоянием приложения (MobX, Zustand)
- ✅ Интегрироваться с REST API и другими внешними сервисами
- ✅ Писать автоматические unit, component и E2E тесты (Vitest, Playwright)
- ✅ Создавать адаптивные и доступные (a11y) интерфейсы
- ✅ Реализовать PWA функциональность (Service Workers, offline support)

### Backend разработка (LR8-11):

- ✅ Проектировать и создавать RESTful API с типизацией (Hono + TypeScript)
- ✅ Работать с базами данных через ORM (Prisma) type-safe способом
- ✅ Реализовать аутентификацию и авторизацию (JWT, OAuth, Role-based)
- ✅ Валидировать входные данные на сервере (Zod)
- ✅ Разработать бизнес-логику (scoring algorithm, calculations)
- ✅ Писать unit и integration тесты для backend
- ✅ Оптимизировать database queries и performance

### DevOps & Deployment (LR11, 13):

- ✅ Контейнеризировать приложения с Docker
- ✅ Настраивать CI/CD pipeline (GitHub Actions)
- ✅ Деплоить production-ready приложения (Vercel, Railway, Render)
- ✅ Мониторить приложение и ошибки (Sentry, Web Vitals)
- ✅ Обеспечивать security (HTTPS, CORS, input validation, rate limiting)

### Архитектура & Best Practices:

- ✅ Проектировать fullstack приложения (Frontend + Backend + Database)
- ✅ Использовать OpenAPI/Swagger для API документации
- ✅ Следовать принципам SOLID и clean code
- ✅ Оптимизировать производительность (bundle size, queries, caching)
- ✅ Писать масштабируемый и maintainable код
- ✅ Работать с Git и Pull Request процессом

### Практические навыки:

- ✅ Независимо разработать полноценное веб-приложение с нуля
- ✅ Работать с реальными tools и технологиями (Postman, Docker, DevTools)
- ✅ Отлаживать проблемы в production
- ✅ Читать и писать documentation (API docs, README, architecture)
- ✅ Применять test-driven development (TDD)
- ✅ Следовать типобезопасности везде (TypeScript)

### Что особенно ценно для career:

- **Fullstack skillset:** не просто frontend разработчик, а полноценный fullstack
- **Production experience:** реальный опыт с Docker, CI/CD, deployment
- **Modern stack:** технологии, которые ищут работодатели в 2026 году
- **Business logic:** опыт с реальной бизнес-логикой (scoring, validation, auth)
- **Code quality:** 70%+ test coverage, monitoring, security
- **Offline-first:** опыт с PWA и offline-first разработкой
>>>>>>> d506b8ebe85f67ed147c546aa7427472ac47eec1
