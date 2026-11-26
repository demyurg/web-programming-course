import type { Result } from "../model/apiTypes";

type ResultScreenProps = {
  result: Result;
  onRestart: () => void;
};

export function ResultScreen({ result, onRestart }: ResultScreenProps) {
  return (
    <section style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Результат попытки</h2>
      
      {/* Общий статус */}
      <p>
        Статус: <strong>{result.status === "graded" ? "Проверено" : "Ожидает проверки"}</strong>
      </p>

      {/* Общий балл. Если null - пишем "Ожидает проверки", а не 0 */}
      <p>
        Баллы: <strong>{result.score === null ? "Ожидает проверки" : `${result.score} из ${result.maxScore}`}</strong>
      </p>

      <h3>Детали по заданиям:</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {result.items.map((item) => (
          <li key={item.taskId} style={{ marginBottom: "1rem", padding: "0.5rem", border: "1px solid #eee" }}>
            <p><strong>Задание: {item.taskId}</strong></p>
            
            <p>Статус: {
              item.status === "correct" ? "✅ Верно" :
              item.status === "incorrect" ? "❌ Неверно" :
              item.status === "unanswered" ? "⬜ Нет ответа" :
              "⏳ Ожидает проверки"
            }</p>

            <p>Балл: {item.score === null ? "— (ожидает)" : `${item.score} из ${item.maxScore}`}</p>
            
            {item.feedback && <p><em>Комментарий: {item.feedback}</em></p>}
          </li>
        ))}
      </ul>

      <button type="button" onClick={onRestart} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
        Начать новую попытку
      </button>
    </section>
  );
}