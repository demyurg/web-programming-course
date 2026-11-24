import type { Task, Answer } from "./domain";
import { isAnswerFilled } from "./domain";

type ReviewProps = {
    tasks: Task[];
    answers: Answer[];
    onRestart?: () => void;
    onBack?: () => void;
    onClear?: (taskId: string) => void
};

function describeAnswer(task: Task, answer: Answer | undefined): string {
    if (answer === undefined || !isAnswerFilled(answer)) return "Нет ответа";

    if (task.kind === "single-choice" && answer.kind === "single-choice") {
        const option = task.options.find((option) => option.id === answer.optionId);
        return option ? option.label : "Нет ответа";
    }

    if (answer.kind === "short-text") return answer.text;

    return "Нет ответа";
}

export function Review({ tasks, answers, onRestart, onBack, onClear }: ReviewProps) {
    return (
        <section>
            <h2>Обзор ответов</h2>
            <ol>
                {tasks.map((task) => {
                    const answer = answers.find((answer) => answer.taskId === task.id);
                    return (
                        <li key={task.id}>
                            <p>{task.prompt}</p>
                            <p>Ответ: {describeAnswer(task, answer)}</p>
                            {onClear && answer !== undefined && (
                                <button onClick={() => onClear(task.id)}>
                                    Очистить ответ
                                </button>
                            )}
                        </li>
                    );
                })}
            </ol>
            {onBack && (
                <button onClick={onBack}>
                    Вернуться к заданиям
                </button>
            )}
            {onRestart && (
                <button onClick={onRestart}>
                    Новая попытка
                </button>
            )}
        </section>
    );
}