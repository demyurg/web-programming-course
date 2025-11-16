// import Task4 from './tasks/Task4';

import { userAuth } from './userAuth';

function App() {

  const {isLoading, login, logout, token} = userAuth()
  if (isLoading) {
    return '🔄';
  }

  if (!token) {
    return (
      <div className="flex justify-center items-center h-screen">
        <button
          onClick={login}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-colors"
        >
          Login
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={logout}
        className="fixed top-5 right-5 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors"
      >
        Logout
      </button>
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-2xl font-bold text-center">QUIZ GAME<br />from<br />lr4/src/Task4.tsx</h1> {/* <Task4 /> */}
      </div>
    </>
  )
}

export default App;
