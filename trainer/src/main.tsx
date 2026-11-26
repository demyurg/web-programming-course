import { createRoot } from "react-dom/client";
import App from "./app";

const root = document.getElementById("root");
if (!root) throw new Error("Технические шоколадки: отсутствует корневой элемент #root в index.html");
createRoot(root).render(<App />);
