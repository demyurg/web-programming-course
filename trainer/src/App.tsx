import { mainSet } from "./data";
import { AttemptScreen } from "./AttemptScreen";

export default function App() {
  return (
    <main>
      <AttemptScreen set={mainSet} />
    </main>
  );
}