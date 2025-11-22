// src/tasks/Task4.tsx
import { observer } from "mobx-react-lite";
import { gameStore } from "../stores/gameStore";
import { QuestionFromAPI } from "../types/quiz";
import { useUIStore } from "../stores/uiStore";
import React, { useState } from "react";
import {
  usePostApiSessions,
  usePostApiSessionsSessionIdAnswers,
  usePostApiSessionsSessionIdSubmit,
} from "../../generated/api/sessions/sessions";

const Task4 = observer(() => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  // React Query хуки
  const createSession = usePostApiSessions();
  const submitAnswer = usePostApiSessionsSessionIdAnswers();
  const submitSession = usePostApiSessionsSessionIdSubmit();

  // Stores
  const {
    gameStatus,
    currentQuestion,
    selectedAnswers,
    score,
    progress,
    isLastQuestion,
  } = gameStore;

  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);

  const bgGradient =
    theme === "light"
      ? "from-purple-500 to-indigo-600"
      : "from-gray-900 to-black";
  const cardBg = theme === "light" ? "bg-white" : "bg-gray-800";
  const textColor = theme === "light" ? "text-gray-800" : "text-white";
  const mutedText = theme === "light" ? "text-gray-600" : "text-gray-400";
  const primaryColor = theme === "light" ? "bg-purple-600" : "bg-purple-700";
  const primaryHover =
    theme === "light" ? "hover:bg-purple-700" : "hover:bg-purple-800";

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const handleStartGame = () => {
    createSession.mutate(
      {
        data: {
          questionCount: 5,
          difficulty: "medium",
        },
      },
      {
        onSuccess: (data) => {
          setSessionId(data.sessionId);
          gameStore.setQuestionsFromAPI(data.questions as QuestionFromAPI[]);
          gameStore.startGame();
        },
        onError: (err) => {
          console.error("Ошибка создания сессии:", err);
          alert("Не удалось начать игру");
        },
      }
    );
  };

  const handleNextQuestion = () => {
    if (!sessionId || !currentQuestion || selectedAnswers.length === 0) return;

    gameStore.saveCurrentAnswer();

    submitAnswer.mutate(
      {
        sessionId,
        data: {
          questionId: currentQuestion.id.toString(),
          selectedOptions: selectedAnswers,
        },
      },
      {
        onSuccess: (response) => {
          if (response.status === "pending") {
            gameStore.nextQuestion();
            return;
          }

          const isCorrect = response.status === "correct";
          const points = response.pointsEarned;

          gameStore.updateAnswerResult(currentQuestion!.id, isCorrect, points);

          gameStore.nextQuestion();
        },
      }
    );
  };

  const handleFinishGame = () => {
    if (!sessionId) {
      gameStore.finishGame();
      return;
    }

    submitSession.mutate(
      { sessionId },
      {
        onSuccess: (data) => {
          console.log("Игра завершена:", data);
          gameStore.finishGame();
        },
        onError: (err) => {
          console.error("Ошибка завершения сессии:", err);
          gameStore.finishGame();
        },
      }
    );
  };

  if (gameStatus === "idle") {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4`}
      >
        <div
          className={`${cardBg} rounded-3xl shadow-2xl p-12 max-w-lg w-full text-center`}
        >
          <div className="flex justify-end mb-6">
            <button onClick={toggleTheme} className="p-3 rounded-xl text-2xl">
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>
          </div>
          <h1 className={`text-5xl font-bold mb-4 ${textColor}`}>Quiz Game</h1>
          <p className={`${mutedText} mb-10 text-xl`}>
            API + React Query Edition
          </p>
          <button
            onClick={handleStartGame}
            disabled={createSession.isPending}
            className={`w-full ${primaryColor} ${primaryHover} text-white py-5 px-8 rounded-2xl font-bold text-2xl`}
          >
            {createSession.isPending ? "Загрузка..." : "Начать игру"}
          </button>
        </div>
      </div>
    );
  }

  if (gameStatus === "finished") {
    const percentage =
      gameStore.questions.length > 0
        ? Math.round(
            (gameStore.correctAnswersCount / gameStore.questions.length) * 100
          )
        : 0;

    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4`}
      >
        <div
          className={`${cardBg} rounded-3xl shadow-2xl p-12 max-w-lg w-full text-center`}
        >
          <h2 className={`text-5xl font-bold mb-8 ${textColor}`}>
            Игра завершена!
          </h2>
          <p className={`text-8xl font-bold text-purple-500 mb-4`}>{score}</p>
          <p className={`text-2xl ${mutedText}`}>
            Правильных: {gameStore.correctAnswersCount} из{" "}
            {gameStore.questions.length}
          </p>
          <p className="text-4xl font-bold text-purple-500 mt-6">
            {percentage}%
          </p>
          <button
            onClick={() => gameStore.resetGame()}
            className={`w-full mt-10 ${primaryColor} ${primaryHover} text-white py-5 rounded-2xl font-bold text-2xl`}
          >
            Играть снова
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const isSelected = (index: number) => selectedAnswers.includes(index);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} p-6`}>
      <div className="max-w-3xl mx-auto">
        {/* Прогресс */}
        <div
          className={`${cardBg} rounded-2xl shadow-2xl p-6 mb-8 flex justify-between items-center`}
        >
          <div>
            <span className={`${mutedText}`}>
              Вопрос {gameStore.currentQuestionIndex + 1} /{" "}
              {gameStore.questions.length}
            </span>
            <div className="mt-2 w-64 bg-gray-300 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <span className="text-4xl font-bold text-purple-400">
              Счёт: {score}
            </span>
          </div>
        </div>

        {/* Вопрос */}
        <div className={`${cardBg} rounded-3xl shadow-2xl p-10`}>
          <h2 className={`text-4xl font-bold mb-12 text-center ${textColor}`}>
            {currentQuestion.question}
          </h2>

          <div className="space-y-5">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => gameStore.toggleAnswer(index)}
                className={`
                  w-full p-8 text-left rounded-2xl border-4 font-bold text-xl transition-all
                  ${
                    isSelected(index)
                      ? "border-purple-600 bg-purple-100 shadow-2xl"
                      : "border-gray-300 bg-gray-50"
                  }
                  hover:scale-105 hover:shadow-2xl
                `}
              >
                <div className="flex items-center">
                  <span
                    className={`
                    w-16 h-16 rounded-full flex items-center justify-center mr-6 font-bold text-3xl
                    ${
                      isSelected(index)
                        ? "bg-purple-600 text-white"
                        : "bg-gray-300 text-gray-700"
                    }
                  `}
                  >
                    {isSelected(index) ? "✓" : String.fromCharCode(65 + index)}
                  </span>
                  <span className={textColor}>{option}</span>
                </div>
              </button>
            ))}
          </div>

          {selectedAnswers.length > 0 && (
            <div className="mt-12 text-center">
              <button
                onClick={isLastQuestion ? handleFinishGame : handleNextQuestion}
                disabled={submitAnswer.isPending || submitSession.isPending}
                className={`${primaryColor} ${primaryHover} text-white font-bold py-6 px-20 rounded-3xl text-3xl shadow-2xl hover:scale-110 transition-all`}
              >
                {submitAnswer.isPending || submitSession.isPending
                  ? "Отправка..."
                  : isLastQuestion
                  ? "Завершить"
                  : "Следующий вопрос"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default Task4;
