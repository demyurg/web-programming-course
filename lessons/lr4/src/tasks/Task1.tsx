import { useState } from "react";
import { mockQuestions } from "../data/questions";
import { Question } from "../types/quiz";

const Task1 = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // ГОТОВО: состояния
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion: Question = mockQuestions[currentQuestionIndex];

  const handleAnswerClick = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // нельзя менять ответ

    setSelectedAnswer(answerIndex);

    // Правильная строка:
    if (answerIndex === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1); // ← только один setScore!
    }
  };

  const handleNextQuestion = () => {
    const isLastQuestion = currentQuestionIndex === mockQuestions.length - 1;

    if (isLastQuestion) {
      setIsFinished(true);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsFinished(false);
  };

  // Экран результатов
  if (isFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">
            Игра завершена!
          </h2>
          <div className="mb-8">
            <p className="text-6xl font-bold text-blue-600 mb-4">{score}</p>
            <p className="text-xl text-gray-600">
              из {mockQuestions.length} правильных ответов
            </p>
            <p className="text-2xl font-bold text-gray-800 mt-4">
              {score === mockQuestions.length
                ? "🏆 Идеально!"
                : score >= mockQuestions.length * 0.7
                ? "Отлично!"
                : score >= mockQuestions.length * 0.5
                ? "Неплохо!"
                : "Можно лучше!"}
            </p>
          </div>
          <button
            onClick={handleRestart}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-bold text-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Начать заново
          </button>
        </div>
      </div>
    );
  }

  // Игровой экран
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Заголовок с прогрессом */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 mb-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">
              Вопрос {currentQuestionIndex + 1} из {mockQuestions.length}
            </span>
            <span className="text-3xl font-bold">Счёт: {score}</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${
                  ((currentQuestionIndex + (selectedAnswer !== null ? 1 : 0)) /
                    mockQuestions.length) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Карточка с вопросом */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
            {currentQuestion.question}
          </h2>

          {/* Варианты ответов */}
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showResult = selectedAnswer !== null;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(index)}
                  disabled={selectedAnswer !== null}
                  className={`
                    w-full p-6 text-left rounded-2xl border-4 font-medium text-lg transition-all duration-300 transform
                    ${
                      !showResult &&
                      "hover:border-blue-400 hover:bg-blue-50 hover:scale-105 hover:shadow-xl border-gray-300 bg-gray-50"
                    }
                    ${
                      !showResult &&
                      isSelected &&
                      "border-blue-600 bg-blue-100 shadow-xl"
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
                      <span className="ml-4 text-3xl">✓</span>
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <span className="ml-4 text-3xl">✗</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Кнопка "Далее" */}
          {selectedAnswer !== null && (
            <div className="mt-8 text-center">
              <button
                onClick={handleNextQuestion}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-2xl text-xl shadow-2xl transform hover:scale-110 transition-all duration-300"
              >
                {currentQuestionIndex === mockQuestions.length - 1
                  ? "🏁 Завершить квиз"
                  : "Следующий вопрос →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Task1;
