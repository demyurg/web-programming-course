import { Theme } from '../types/quiz'

interface StartPosProps {
    theme: Theme
    soundEnabled: any
    toggleTheme: () => void
    handleStartGame: any
    isPending: boolean
}
function StartPos({theme, soundEnabled, toggleTheme, handleStartGame, isPending}: StartPosProps) {
    const bgGradient =
        theme === 'light'
        ? 'from-purple-500 to-indigo-600'
        : 'from-gray-900 to-black'
    const cardBg = theme === 'light' ? 'bg-white' : 'bg-gray-800'
    const textColor = theme === 'light' ? 'text-gray-800' : 'text-white'
    const mutedText = theme === 'light' ? 'text-gray-600' : 'text-gray-400'
    const primaryColor = theme === 'light' ? 'bg-purple-600' : 'bg-purple-700'
    const primaryHover =
        theme === 'light' ? 'hover:bg-purple-700' : 'hover:bg-purple-800'

    return (
        <div
            className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 transition-colors duration-300`}
        >
            <div
                className={`${cardBg} w-full max-w-md rounded-2xl p-8 shadow-2xl transition-colors duration-300`}
            >
                <div className='mb-4 flex justify-end'>
                    <button
                        onClick={toggleTheme}
                        className={`rounded-lg p-2 ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </div>

                <h1 className={`mb-2 text-center text-4xl font-bold ${textColor}`}>
                    Quiz Game
                </h1>
                <p className={`${mutedText} mb-2 text-center`}>
                    MobX + Zustand Edition
                </p>
                <p className={`text-sm ${mutedText} mb-8 text-center`}>
                    Звук: {soundEnabled ? '🔊' : '🔇'}
                </p>

                <button
                    onClick={handleStartGame}
                    disabled={isPending}
                    className={`w-full ${primaryColor} ${primaryHover} transform rounded-xl px-6 py-4 font-semibold text-white transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                    {isPending ? 'Загрузка...' : 'Начать игру'}
                </button>

                <div
                    className={`mt-6 rounded-lg p-4 ${theme === 'light' ? 'bg-purple-50' : 'bg-gray-700'}`}
                >
                    <p
                        className={`text-sm ${theme === 'light' ? 'text-purple-900' : 'text-gray-300'} mb-2`}
                    >
                        <strong>Task 4:</strong> Комбинация MobX + Zustand
                    </p>
                    <ul
                        className={`text-xs ${theme === 'light' ? 'text-purple-800' : 'text-gray-400'} space-y-1`}
                    >
                        <li>
                            • <strong>MobX:</strong> Игровая логика (вопросы, счёт)
                        </li>
                        <li>
                            • <strong>Zustand:</strong> UI настройки (тема, звук)
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export {StartPos};