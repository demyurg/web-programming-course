import type { Question, Theme } from '../types/quiz';

interface GameScreenProps {
  theme: Theme;
  toggleTheme: () => void;
  score: number;
  progress: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentQuestion: Question;
  selectedAnswers: number[];
  essayAnswer: string;
  isLastQuestion: boolean;
  isSubmitting: boolean;
  onToggleAnswer: (index: number) => void;
  onEssayChange: (text: string) => void;
  onNextQuestion: () => void;
  onFinishGame: () => void;
}

export function GameScreen({
  theme,
  toggleTheme,
  score,
  progress,
  currentQuestionIndex,
  totalQuestions,
  currentQuestion,
  selectedAnswers,
  essayAnswer,
  isLastQuestion,
  isSubmitting,
  onToggleAnswer,
  onEssayChange,
  onNextQuestion,
  onFinishGame,
}: GameScreenProps) {
  const bgGradient =
    theme === 'light'
      ? 'from-purple-500 to-indigo-600'
      : 'from-gray-900 to-black';

  const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';
  const mutedText = theme === 'light' ? 'text-gray-600' : 'text-gray-400';

  const hasAnswer =
    selectedAnswers.length > 0 || essayAnswer.trim().length > 0;

  const charCount = essayAnswer.length;
  const minLength = currentQuestion.minLength || 0;
  const maxLength = currentQuestion.maxLength || 1000;
  const isValidLength = charCount >= minLength;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${bgGradient} p-4 transition-colors duration-300`}
    >
      <div className='mx-auto max-w-2xl'>
        {/* Хедер: счёт, номер вопроса, тема, прогресс */}
        <div
          className={`${cardBg} mb-4 rounded-lg p-4 shadow-md transition-colors duration-300`}
        >
          <div className='mb-2 flex items-center justify-between'>
            <span className={`text-sm ${mutedText}`}>
              Вопрос {currentQuestionIndex + 1} из {totalQuestions}
            </span>
            <div className='flex items-center gap-3'>
              <span
                className={`text-xl font-bold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}
              >
                Счёт: {score}
              </span>
              <button
                onClick={toggleTheme}
                className={`rounded p-2 ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
          <div
            className={`w-full ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'} h-2 rounded-full`}
          >
            <div
              className={`${theme === 'light' ? 'bg-purple-600' : 'bg-purple-500'} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Карточка вопроса */}
        <div
          className={`${cardBg} rounded-2xl p-6 shadow-2xl transition-colors duration-300`}
        >
          {/* Бейдж сложности */}
          <div className='mb-4'>
            <span
              className={`rounded-full px-2 py-1 text-xs ${currentQuestion.difficulty === 'easy' && 'bg-green-100 text-green-700'} ${currentQuestion.difficulty === 'medium' && 'bg-yellow-100 text-yellow-700'} ${currentQuestion.difficulty === 'hard' && 'bg-red-100 text-red-700'} `}
            >
              {currentQuestion.difficulty === 'easy' && 'Легкий'}
              {currentQuestion.difficulty === 'medium' && 'Средний'}
              {currentQuestion.difficulty === 'hard' && 'Сложный'}
            </span>
          </div>

          {/* Текст вопроса */}
          <h2 className={`mb-6 text-2xl font-bold ${textColor}`}>
            {currentQuestion.question}
          </h2>

          {/* Варианты ответа или текстовое поле */}
          {currentQuestion.options && currentQuestion.options.length > 0 ? (
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => {
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
          ) : (
            <div className="space-y-2">
              <textarea
                value={essayAnswer}
                onChange={(e) => onEssayChange(e.target.value)}
                placeholder="Введите развернутый ответ..."
                minLength={minLength}
                maxLength={maxLength}
                rows={10}
                className="w-full p-4 border-2 border-gray-300 rounded focus:border-blue-500 focus:outline-none"
              />
              <div className={`text-sm ${isValidLength ? 'text-gray-500' : 'text-red-500'}`}>
                Символов: {charCount}
                {minLength > 0 && ` (минимум: ${minLength})`}
                {` (максимум: ${maxLength})`}
              </div>
            </div>
          )}

          {/* Кнопка действия */}
          {hasAnswer && (
            <div className="mt-6">
              <button
                onClick={isLastQuestion ? onFinishGame : onNextQuestion}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting
                  ? 'Отправка...'
                  : isLastQuestion
                    ? 'Завершить'
                    : 'Следующий вопрос'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
