import type { Answer, Task } from "./domain";
import { isAnswered } from "./domain";

type AttemptReviewProps = {
    tasks: Task[];
    answers: Answer[];
    submitted: boolean;
    onClear: (taskId: string) => void;
};

function answerText(task: Task, answer: Answer | undefined): string {
    if (!isAnswered(task, answer)) return "Нет ответа";
    if (task.kind === "single-choice" && answer?.kind === "single-choice") {
        return task.options.find((option) => option.id === answer.optionId)?.label ?? "Нет ответа";
    }
    return answer?.kind === "short-text" ? answer.text : "Нет ответа";
}

export function AttemptReview({ tasks, answers, submitted, onClear }: AttemptReviewProps) {
    return (
        <section aria-label="Обзор ответов">
            <h2>Обзор ответов</h2>
            <ol className="review">
                {tasks.map((task) => {
                    const answer = answers.find((item) => item.taskId === task.id);
                    return (
                        <li key={task.id}>
                            <strong>{task.prompt}</strong>
                            <p className="review-answer">{answerText(task, answer)}</p>
                            {!submitted && isAnswered(task, answer) && (
                                <button type="button" onClick={() => onClear(task.id)}>
                                    Очистить ответ в обзоре
                                </button>
                            )}
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}
