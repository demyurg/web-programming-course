import {vi, it, expect, describe} from "vitest"

export function StartComponent (props) {
    return (
        <div className={`min-h-screen w-full bg-gradient-to-br ${props.bgGradient} flex items-center justify-center p-4 transition-colors duration-300`}>
            <div className={`${props.cardBg} rounded-2xl shadow-2xl p-8 max-w-md w-full transition-colors duration-300`}>
            {/* Переключатель темы */}
            <div className="flex justify-end mb-4">
                <button
                onClick={props.toggleTheme}
                className={`p-2 rounded-lg ${props.theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
                >
                {props.theme === 'light' ? '🌙' : '☀️'}
                </button>
            </div>

            <h1 className={`text-4xl font-bold mb-2 text-center ${props.textColor}`}>
                Quiz Game
            </h1>
            <p className={`${props.mutedText} mb-2 text-center`}>MobX + Zustand Edition</p>
            <p className={`text-sm ${props.mutedText} mb-8 text-center`}>
                Звук: {props.soundEnabled ? '🔊' : '🔇'}
            </p>

            <button
                onClick={() => props.handleStartGame()}
                className={`w-full ${props.primaryColor} ${props.primaryHover} text-white py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105`}
            >
                Начать игру
            </button>

            {/* Информация о разделении ответственности */}
            <div className={`mt-6 rounded-lg p-4 ${props.theme === 'light' ? 'bg-purple-50' : 'bg-gray-700'}`}>
                <p className={`text-sm ${props.theme === 'light' ? 'text-purple-900' : 'text-gray-300'} mb-2`}>
                <strong>Task 4:</strong> Комбинация MobX + Zustand
                </p>
                <ul className={`text-xs ${props.theme === 'light' ? 'text-purple-800' : 'text-gray-400'} space-y-1`}>
                <li>• <strong>MobX:</strong> Игровая логика (вопросы, счёт)</li>
                <li>• <strong>Zustand:</strong> UI настройки (тема, звук)</li>
                </ul>
            </div>
            </div>
        </div>
        );
}