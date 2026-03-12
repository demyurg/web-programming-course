import { observer } from 'mobx-react-lite';
import { gameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';
import * as React from 'react';
import { StartScreen } from './StartScreen';
import { FinishScreen } from './FinishScreen';
import { GameScreen } from './Game';
import { mockQuestions } from '../data/questions';
import { QuestionPreview, QuestionType } from '../../generated/api/quizBattleAPI.schemas'; // <-- импортируем QuestionType

const Task4 = observer(() => {
  const { gameStatus, score, correctAnswersCount, questions } = gameStore;
  const theme = useUIStore((s) => s.theme);
  const soundEnabled = useUIStore((s) => s.soundEnabled);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  const handleStart = () => {
    // Преобразуем mockQuestions в формат QuestionPreview
    const previewQuestions: QuestionPreview[] = mockQuestions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options ?? [],
      type: q.type as QuestionType, // <-- утверждение типа
      difficulty: q.difficulty,
      maxPoints:
        q.difficulty === 'easy' ? 10 :
        q.difficulty === 'medium' ? 20 : 30,
    }));
    gameStore.startGame(previewQuestions);
  };

  const handleNext = () => {
    if (gameStore.isLastQuestion) {
      gameStore.finishGame();
    } else {
      gameStore.nextQuestion();
    }
  };

  if (gameStatus === 'idle') {
    return (
      <StartScreen
        theme={theme}
        soundEnabled={soundEnabled}
        toggleTheme={toggleTheme}
        onStart={handleStart}
      />
    );
  }

  if (gameStatus === 'finished') {
    return (
      <FinishScreen
        theme={theme}
        score={score}
        correctAnswers={correctAnswersCount}
        totalQuestions={questions.length}
        onRestart={() => gameStore.resetGame()}
      />
    );
  }

  return (
    <GameScreen
      theme={theme}
      toggleTheme={toggleTheme}
      onNext={handleNext}
    />
  );
});

export default Task4;