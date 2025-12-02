/**
 * Задание 3: Управление UI состоянием с помощью Zustand — ГОТОВО!
 */

import { useUIStore } from "../stores/uiStore";
import React from "react";

const Task3 = () => {
  // Селекторы — только нужные части стора
  const theme = useUIStore((state) => state.theme);
  const soundEnabled = useUIStore((state) => state.soundEnabled);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const toggleSound = useUIStore((state) => state.toggleSound);
  const setTheme = useUIStore((state) => state.setTheme);

  // Применяем тему к body
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const bgGradient =
    theme === "light"
      ? "from-orange-400 to-pink-500"
      : "from-gray-800 to-gray-900";

  const cardBg = theme === "light" ? "bg-white" : "bg-gray-800";
  const textColor = theme === "light" ? "text-gray-800" : "text-white";
  const mutedText = theme === "light" ? "text-gray-600" : "text-gray-300";

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${bgGradient} p-4 transition-all duration-500`}
    >
      <div className="max-w-2xl mx-auto">
        <div
          className={`${cardBg} rounded-3xl shadow-2xl p-10 transition-all duration-500`}
        >
          <h1 className={`text-4xl font-bold mb-4 ${textColor}`}>
            Настройки приложения
          </h1>
          <p className={`${mutedText} mb-10 text-xl`}>
            Zustand + Persist Edition
          </p>

          {/* Тема */}
          <div className="mb-10">
            <label className={`block text-lg font-bold mb-4 ${textColor}`}>
              Тема оформления
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTheme("light")}
                className={`
                  py-4 px-6 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg
                  ${
                    theme === "light"
                      ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }
                `}
              >
                Светлая
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`
                  py-4 px-6 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg
                  ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-gray-700 to-gray-900 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }
                `}
              >
                Тёмная
              </button>
            </div>
          </div>

          {/* Звук */}
          <div className="mb-10">
            <label className={`block text-lg font-bold mb-4 ${textColor}`}>
              Звуковые эффекты
            </label>
            <button
              onClick={toggleSound}
              className={`
                w-full py-6 px-8 rounded-2xl font-bold text-xl transition-all transform hover:scale-105 shadow-lg
                ${
                  soundEnabled
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }
              `}
            >
              {soundEnabled ? "Звук включён" : "Звук выключен"}
            </button>
          </div>

          {/* Быстрое переключение */}
          <div className="mb-10">
            <button
              onClick={toggleTheme}
              className={`
                w-full py-6 px-8 rounded-2xl font-bold text-2xl shadow-2xl transform hover:scale-110 transition-all duration-300
                bg-gradient-to-r ${
                  theme === "light"
                    ? "from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    : "from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
                } text-white
              `}
            >
              {theme === "light"
                ? "Переключить на тёмную"
                : "Переключить на светлую"}
            </button>
          </div>

          {/* Состояние */}
          <div
            className={`border-t pt-8 ${
              theme === "light" ? "border-gray-200" : "border-gray-700"
            }`}
          >
            <h3 className={`text-2xl font-bold mb-6 ${textColor}`}>
              Текущее состояние
            </h3>
            <div className="space-y-4 text-lg">
              <div className="flex justify-between">
                <span className={mutedText}>Тема:</span>
                <span className="font-bold">
                  {theme === "light" ? "Светлая" : "Тёмная"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={mutedText}>Звук:</span>
                <span className="font-bold">
                  {soundEnabled ? "Включён" : "Выключен"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={mutedText}>Сохранение:</span>
                <span className="font-bold text-green-500">localStorage ✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task3;
