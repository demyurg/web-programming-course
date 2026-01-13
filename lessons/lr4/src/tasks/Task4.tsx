/**
 * Задание 4: MobX + Zustand — ГОТОВО НА 1000%!
 * Бизнес-логика (MobX) + UI-настройки (Zustand)
 */

import { observer } from "mobx-react-lite";
import { gameStore } from "../stores/gameStore";
import { useUIStore } from "../stores/uiStore";
import React from "react";

const Task4 = observer(() => {
  // MobX — игровая логика
  const {
    gameStatus,
    currentQuestion,
    selectedAnswer,
    score,
    progress,
    isLastQuestion,
    correctAnswersCount,
  } = gameStore;

  // Zustand — UI настройки
  const theme = useUIStore((state) => state.theme);
  const soundEnabled = useUIStore((state) => state.soundEnabled);
  const toggleTheme = useUIStore((state) => state.toggleTheme);

  // Стили в зависимости от темы
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

  // Применяем тёмную тему к body
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Стартовый экран
  if (gameStatus === "idle") {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 transition-all duration-500`}
      >
        <div
          className={`${cardBg} rounded-3xl shadow-2xl p-12 max-w-lg w-full text-center transition-all duration-500`}
        >
          {/* Переключатель темы */}
          <div className="flex justify-end mb-6">
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-xl text-2xl transition-all transform hover:scale-110 ${
                theme === "light"
                  ? "bg-gray-100 hover:bg-gray-200"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>
          </div>

          <h1 className={`text-5xl font-bold mb-4 ${textColor}`}>Quiz Game</h1>
          <p className={`${mutedText} mb-4 text-xl`}>MobX + Zustand Edition</p>
          <p className={`text-lg mb-10 ${mutedText}`}>
            Звук: {soundEnabled ? "On" : "Off"}
          </p>

          <button
            onClick={() => gameStore.startGame()}
            className={`w-full ${primaryColor} ${primaryHover} text-white py-5 px-8 rounded-2xl font-bold text-2xl shadow-2xl transform hover:scale-105 transition-all duration-300`}
          >
            Начать игру
          </button>
        </div>
      </div>
    );
  }

  // Экран результатов
  if (gameStatus === "finished") {
    const percentage = Math.round(
      (correctAnswersCount / gameStore.questions.length) * 100
    );
    const getEmoji = () => {
      if (percentage >= 90) return "Perfect!";
      if (percentage >= 70) return "Great!";
      if (percentage >= 50) return "Good!";
      return "Try Again";
    };

    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 transition-all duration-500`}
      >
        <div
          className={`${cardBg} rounded-3xl shadow-2xl p-12 max-w-lg w-full text-center transition-all duration-500`}
        >
          <div className="text-8xl mb-6">{getEmoji()}</div>

          <h2 className={`text-5xl font-bold mb-8 ${textColor}`}>
            Игра завершена!
          </h2>

          <div className="mb-10">
            <p
              className={`text-8xl font-bold ${
                theme === "light" ? "text-purple-600" : "text-purple-400"
              } mb-4`}
            >
              {score}
            </p>
            <p className={`text-2xl ${mutedText}`}>
              Правильных: {correctAnswersCount} из {gameStore.questions.length}
            </p>
            <p
              className={`text-4xl font-bold mt-6 ${
                theme === "light" ? "text-purple-600" : "text-purple-400"
              }`}
            >
              {percentage}%
            </p>
          </div>

          <button
            onClick={() => gameStore.resetGame()}
            className={`w-full ${primaryColor} ${primaryHover} text-white py-5 px-8 rounded-2xl font-bold text-2xl shadow-2xl transform hover:scale-110 transition-all duration-300`}
          >
            Играть снова
          </button>
        </div>
      </div>
    );
  }

  // Игровой экран
  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${bgGradient} p-6 transition-all duration-500`}
    >
      <div className="max-w-3xl mx-auto">
        {/* Шапка */}
        <div
          className={`${cardBg} rounded-2xl shadow-2xl p-6 mb-8 flex justify-between items-center transition-all duration-500`}
        >
          <div>
            <span className={`text-lg ${mutedText}`}>
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
            <span
              className={`text-4xl font-bold ${
                theme === "light" ? "text-purple-600" : "text-purple-400"
              }`}
            >
              Счёт: {score}
            </span>
            <button
              onClick={toggleTheme}
              className={`block mt-4 p-3 rounded-xl text-2xl transition-all ${
                theme === "light"
                  ? "bg-gray-100 hover:bg-gray-200"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {theme === "light" ? "Dark" : "Light"}
            </button>
          </div>
        </div>

        {/* Вопрос */}
        <div
          className={`${cardBg} rounded-3xl shadow-2xl p-10 transition-all duration-500`}
        >
          <div className="mb-8">
            <span
              className={`
              text-sm px-4 py-2 rounded-full font-bold
              ${
                currentQuestion!.difficulty === "easy" &&
                "bg-green-100 text-green-700"
              }
              ${
                currentQuestion!.difficulty === "medium" &&
                "bg-yellow-100 text-yellow-700"
              }
              ${
                currentQuestion!.difficulty === "hard" &&
                "bg-red-100 text-red-700"
              }
            `}
            >
              {currentQuestion!.difficulty === "easy" && "Легкий"}
              {currentQuestion!.difficulty === "medium" && "Средний"}
              {currentQuestion!.difficulty === "hard" && "Сложный"}
            </span>
          </div>

          <h2 className={`text-4xl font-bold mb-12 text-center ${textColor}`}>
            {currentQuestion!.question}
          </h2>

          <div className="space-y-5">
            {currentQuestion!.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion!.correctAnswer;
              const showResult = selectedAnswer !== null;

              return (
                <button
                  key={index}
                  onClick={() => gameStore.selectAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`
                    w-full p-8 text-left rounded-2xl border-4 font-bold text-xl transition-all duration-300 transform
                    ${
                      !showResult &&
                      "hover:scale-105 hover:shadow-2xl border-gray-300 bg-gray-50"
                    }
                    ${
                      !showResult &&
                      isSelected &&
                      "border-purple-600 bg-purple-100 shadow-2xl"
                    }
                    ${
                      showResult &&
                      isCorrect &&
                      "border-green-500 bg-green-100 shadow-2xl scale-105"
                    }
                    ${
                      showResult &&
                      isSelected &&
                      !isCorrect &&
                      "border-red-500 bg-red-100 shadow-2xl"
                    }
                    ${
                      showResult &&
                      !isCorrect &&
                      !isSelected &&
                      "opacity-50 grayscale"
                    }
                    disabled:cursor-not-allowed
                  `}
                >
                  <div className="flex items-center">
                    <span
                      className={`
                      w-16 h-16 rounded-full flex items-center justify-center mr-6 font-bold text-3xl
                      ${!showResult && "bg-gray-300 text-gray-700"}
                      ${showResult && isCorrect && "bg-green-500 text-white"}
                      ${
                        showResult &&
                        isSelected &&
                        !isCorrect &&
                        "bg-red-500 text-white"
                      }
                    `}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className={textColor}>{option}</span>
                    {showResult && isCorrect && (
                      <span className="ml-auto text-5xl">Correct</span>
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <span className="ml-auto text-5xl">Wrong</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedAnswer !== null && (
            <div className="mt-12 text-center">
              <button
                onClick={() => gameStore.nextQuestion()}
                className={`bg-gradient-to-r ${primaryColor} ${primaryHover} text-white font-bold py-6 px-20 rounded-3xl text-3xl shadow-2xl transform hover:scale-110 transition-all duration-300`}
              >
                {isLastQuestion ? "Завершить квиз" : "Следующий вопрос"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default Task4;
