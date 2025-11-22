import Task4 from "./tasks/Task4";
import { Auth } from "./components/Auth";

function App() {
  return (
    <Auth>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-4xl">
            <Task4 />
          </div>
        </div>
      </div>
    </Auth>
  );
}

export default App;
