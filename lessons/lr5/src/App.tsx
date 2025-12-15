import Task4 from './tasks/Task4';

import { Auth } from './components/Auth';

function App() {
  return (
    <Auth>
      {/* Render Task4 (MobX + Zustand quiz) */}
      <Task4 />
    </Auth>
  )
}

export default App;
