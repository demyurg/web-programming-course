import { mainSet } from "./domain/demo.js";
import { AttemptScreen } from "./components/AttemptScreen.js";

export default function App() {
  return <AttemptScreen trainingSet={mainSet} />;
}