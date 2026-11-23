import { createRoot } from "react-dom/client";
import { App } from "./App"; // <-- Добавлены фигурные скобки

const root = document.getElementById("root");
if (!root) throw new Error("Root element is missing");
createRoot(root).render(<App />);