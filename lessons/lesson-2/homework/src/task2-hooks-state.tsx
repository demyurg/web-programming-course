/**
 * Задание 2: Типизация хуков и состояния
 *
 * Цель: Освоить типизацию useState, useEffect и простых кастомных хуков
 *
 * Инструкции:
 * 1. Добавьте правильную типизацию ко всем хукам
 * 2. Создайте простые типизированные кастомные хуки
 * 3. Обработайте основные состояния приложения
 */

import React, { useState, useEffect, useCallback, FormEvent } from 'react';

// ===== ЗАДАЧА 2.1: Счетчик с расширенным состоянием =====

interface CounterState {
  count: number;
  step: number;
  isRunning: boolean;
  history: number[];
}

function Counter() {
  const [state, setState] = useState<CounterState>({
    count: 0,
    step: 1,
    isRunning: false,
    history: [],
  });

  const increment = () => {
    setState(prev => ({
      ...prev,
      count: prev.count + prev.step,
      history: [...prev.history, prev.count + prev.step],
    }));
  };

  const decrement = () => {
    setState(prev => ({
      ...prev,
      count: prev.count - prev.step,
      history: [...prev.history, prev.count - prev.step],
    }));
  };

  const setStep = (newStep: number) => {
    setState(prev => ({ ...prev, step: newStep }));
  };

  const toggleRunning = () => {
    setState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const reset = () => {
    setState({ count: 0, step: 1, isRunning: false, history: [] });
  };

  // Автоинкремент при isRunning === true
  useEffect(() => {
    if (!state.isRunning) return;

    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        count: prev.count + prev.step,
        history: [...prev.history, prev.count + prev.step],
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isRunning, state.step]);

  return (
    <div className="counter">
      <h2>Счетчик: {state.count}</h2>
      <p>Шаг: {state.step}</p>

      <div className="controls">
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        <button onClick={toggleRunning}>
          {state.isRunning ? 'Остановить' : 'Запустить'}
        </button>
        <button onClick={reset}>Сброс</button>
      </div>

      <div className="step-control">
        <label>
          Шаг:
          <input
            type="number"
            value={state.step}
            onChange={(e) => setStep(Number(e.target.value))}
            min="1"
          />
        </label>
      </div>

      <div className="history">
        <h3>История:</h3>
        <ul>
          {state.history.map((value, index) => (
            <li key={index}>{value}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

