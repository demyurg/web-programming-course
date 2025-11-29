import Task4 from './tasks/Task4'

import { userAuth } from './userAuth'

function App() {
  const { isLoading, login, logout, token } = userAuth()
  if (isLoading) {
    return '🔄'
  }

  if (!token) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <button
          onClick={login}
          className='rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white shadow-md transition-colors hover:bg-blue-600'
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
        className='fixed right-5 top-5 rounded-lg bg-red-500 px-4 py-2 font-semibold text-white shadow-md transition-colors hover:bg-red-600'
      >
        Logout
      </button>
      <Task4 />
    </>
  )
}

export default App
