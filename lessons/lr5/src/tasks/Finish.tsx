
export function Finish (props) {    
  const bgGradient = props.theme === 'light'
        ? 'from-purple-500 to-indigo-600'
        : 'from-gray-900 to-black';

    const cardBg = props.theme === 'light' ? 'bg-white' : 'bg-gray-800';
    const textColor = props.theme === 'light' ? 'text-gray-800' : 'text-white';
    const mutedText = props.theme === 'light' ? 'text-gray-600' : 'text-gray-400';
    const primaryColor = props.theme === 'light' ? 'bg-purple-600' : 'bg-purple-700';
    const primaryHover = props.theme === 'light' ? 'hover:bg-purple-700' : 'hover:bg-purple-800';
    return (
      <div className={`min-h-screen w-full bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 transition-colors duration-300`}>
        <div className={`${cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transition-colors duration-300`}>
          <div className="text-6xl mb-4">{props.getEmoji()}</div>

          <h2 className={`text-3xl font-bold mb-4 ${textColor}`}>
            Игра завершена!
          </h2>

          <div className="mb-6">
            <p className={`text-5xl font-bold ${props.theme === 'light' ? 'text-purple-600' : 'text-purple-400'} mb-2`}>
              {props.score}
            </p>
            <p className={mutedText}>очков заработано</p>
          </div>

          <div className={`${props.theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'} rounded-lg p-4 mb-6`}>
            <p className={`text-lg ${textColor}`}>
              Правильных ответов: <span className="font-bold">{props.correctAnswersCount} из {props.questions.length}</span>
            </p>
            <p className={`text-2xl font-bold mt-2 ${props.theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>
              {props.percentage}%
            </p>
          </div>

          <button
            onClick={() => props.gameStore.resetGame()}
            className={`w-full ${primaryColor} ${primaryHover} text-white py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105`}
          >
            Играть снова
          </button>
        </div>
      </div>
    );
}