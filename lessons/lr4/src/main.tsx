import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // Можно без .tsx, Vite поймет
import './index.css'

// ВАЖНО: Здесь должно быть 'root', так же как в index.html
const rootElement = document.getElementById('root');

if (!rootElement) {
  // Если элемента нет, выведем ошибку в консоль, чтобы вы её увидели
  console.error('❌ ОШИБКА: Не найден элемент с id="root" в index.html!');
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}