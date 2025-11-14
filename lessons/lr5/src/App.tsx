// import Task4 from './tasks/Task4';

// import { getApiAuthGithubCallback } from '../generated/api/auth/auth';

import { userAuth } from './userAuth';

function App() {

  const {isLoading, login, logout, token} = userAuth()
  if (isLoading) {
    return '🔄';
  }

  if (!token) {
    return <button onClick={login}>{'login'}</button>
  }

return <>
    <h1>quiz</h1>
    {/* <Task4 /> */}
    <button onClick={logout}>{'razlogin'}</button>
  </>
}

export default App;
