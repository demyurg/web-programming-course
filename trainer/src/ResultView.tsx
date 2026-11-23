import type { Task } from "./domain";
import type { ServerResult } from "./trainerApi";

const labels = {
    correct: "Верно",
    incorrect: "Неверно",
    unanswered: "Нет ответа",
    "pending-review": "Ожидает проверки",
};

export function ResultView({ result, tasks }: { result: ServerResult; tasks: Task[] }) {
    return (
        <section aria-label="Результат сервера">
            <h2>Результат сервера</h2>
            <p>{result.status === "pending-review" ? "Часть ответов ожидает проверки." : "Проверка завершена."}</p>
            <p>Баллы: {result.score === null ? "ожидают проверки" : `${result.score} из ${result.maxScore}`}</p>
            <ol>
                {result.items.map((item) => (
                    <li key={item.taskId}>
                        <strong>{tasks.find((task) => task.id === item.taskId)?.prompt ?? item.taskId}</strong>
                        <p>{labels[item.status]}; баллы: {item.score === null ? "ожидают проверки" : `${item.score} из ${item.maxScore}`}.</p>
                        <p>{item.feedback}</p>
                    </li>
                ))}
            </ol>
        </section>
    );
}
