import { observer } from "mobx-react-lite";
import { gameStore } from "../stores/gameStore";

const Task2 = observer(() => {
  const {
    gameStatus,
    currentQuestion,
    selectedAnswer,
    score,
    progress,
    isLastQuestion,
    correctAnswersCount,
  } = gameStore;

  // Стартовый экран
  if (gameStatus === "idle") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-4xl font-bold mb-4">Quiz Game</h1>
          <p className="text-gray-600 mb-8 text-xl">MobX Edition</p>
          <button
            onClick={() => gameStore.startGame()}
            className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-bold text-xl hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Начать игру
          </button>
        </div>
      </div>
    );
  }

  // Экран результатов
  if (gameStatus === "finished") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">
            Игра завершена!
          </h2>
          <div className="mb-8">
            <p className="text-7xl font-bold text-green-600 mb-4">{score}</p>
            <p className="text-2xl text-gray-700">
              Правильных ответов: {correctAnswersCount} из{" "}
              {gameStore.questions.length}
            </p>
          </div>
          <button
            onClick={() => gameStore.resetGame()}
            className="w-full bg-green-600 text-white py-4 px-8 rounded-xl font-bold text-xl hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Начать заново
          </button>
        </div>
      </div>
    );
  }

  // Игровой экран
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Заголовок */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 mb-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">
              Вопрос {gameStore.currentQuestionIndex + 1} из{" "}
              {gameStore.questions.length}
            </span>
            <span className="text-3xl font-bold">Счёт: {score}</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Карточка с вопросом */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Уровень сложности */}
          <div className="mb-6">
            <span
              className={`
                text-sm px-3 py-1 rounded-full font-semibold
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

          {/* Вопрос */}
          <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
            {currentQuestion!.question}
          </h2>

          {/* Ответы */}
          <div className="space-y-4">
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
                    w-full p-6 text-left rounded-2xl border-4 font-medium text-lg transition-all duration-300 transform
                    ${
                      !showResult &&
                      "hover:border-green-400 hover:bg-green-50 hover:scale-105 hover:shadow-xl border-gray-300 bg-gray-50"
                    }
                    ${
                      !showResult &&
                      isSelected &&
                      "border-green-600 bg-green-100 shadow-2xl"
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
                      "opacity-60 grayscale"
                    }
                    disabled:cursor-not-allowed
                  `}
                >
                  <div className="flex items-center">
                    <span
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center mr-4 font-bold text-xl
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
                    <span className="flex-1">{option}</span>
                    {showResult && isCorrect && (
                      <span className="ml-4 text-3xl">Correct</span>
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <span className="ml-4 text-3xl">Wrong</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Кнопка "Далее" */}
          {selectedAnswer !== null && (
            <div className="mt-10 text-center">
              <button
                onClick={() => gameStore.nextQuestion()}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-5 px-16 rounded-2xl text-2xl shadow-2xl transform hover:scale-110 transition-all duration-300"
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

export default Task2;
