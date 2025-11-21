import { useEffect } from 'react';
import Task4 from './tasks/Task4';
import { Auth } from './components/Auth/Auth';

function App() {
  // АВТОЛОГИН — 100% рабочий вариант
  useEffect(() => {
    const autoLogin = async () => {
      // Проверяем, есть ли уже токен
      if (localStorage.getItem('access_token')) {
        console.log('Токен уже есть, автологин не нужен');
        return;
      }

      console.log('Токена нет — делаем автологин...');
      try {
        const res = await fetch('http://localhost:3000/api/auth/github/callback?code=mock_code');
        if (!res.ok) throw new Error('Mock-сервер не отвечает');
        const data = await res.json();
        localStorage.setItem('access_token', data.token);
        console.log('Автологин успешен! Токен сохранён');
        // Перезагружаем, чтобы Auth подхватил токен
        window.location.reload();
      } catch (err) {
        console.error('Автологин не сработал:', err);
      }
    };

    autoLogin();
  }, []);

  return (
    <Auth>
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Task4 />
      </div>
    </Auth>
  );
}

export default App;