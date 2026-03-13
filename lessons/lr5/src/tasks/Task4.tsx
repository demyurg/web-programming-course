import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import gameStore from '../stores/gameStore';
import type { Question } from '../types/quiz';
import { QuizButton } from '../components/quiz/QuizButton';
import { QuizProgress } from '../components/quiz/QuizProgress';
import { MultipleSelectQuestion } from '../components/quiz/MultipleSelectQuestion';
import { EssayQuestion } from '../components/quiz/EssayQuestion';

const initialQuestions: Question[] = [
  {
    id: '1',
    type: 'multiple-select',
    question: 'Какие из перечисленных являются React хуками?',
    options: ['useState', 'useEffect', 'useClass', 'useMemo'],
    difficulty: 'easy',
    maxPoints: 4,
  },
  {
    id: '2',
    type: 'essay',
    question: 'Объясните, что такое виртуальный DOM и зачем он нужен в React.',
    difficulty: 'medium',
    maxPoints: 10,
    minLength: 50,
    maxLength: 500,
  },
];

const Task4 = observer(() => {
  const [, setSessionStarted] = useState(false);
  const currentQuestion = gameStore.currentQuestion;

  const handleStartGame = () => {
    gameStore.startGame(initialQuestions);
    setSessionStarted(true);
  };

  const handleNextQuestion = () => {
    gameStore.nextQuestion();
  };

  const handleFinishGame = () => {
    gameStore.finishGame();
  };

  const canProceed =
    currentQuestion?.type === 'multiple-select'
      ? gameStore.selectedAnswers.length > 0
      : (gameStore.textAnswer.trim().length ?? 0) >=
        (currentQuestion?.minLength || 0);

  if (!gameStore.isPlaying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <QuizButton onClick={handleStartGame}>Начать игру</QuizButton>
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
              onClick={
                gameStore.isLastQuestion ? handleFinishGame : handleNextQuestion
              }
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

