import type { Task, SingleChoiceTask, Answer, ShortTextTask } from "./domain"

type TaskCardProps = {
    task: Task | undefined
    answer: Answer | undefined
    onAnswer: (answer: Answer) => void
    
}

type OptionListProps = {
    task: SingleChoiceTask
    answer: Answer | undefined
    onAnswer: (answer: Answer) => void
    
};

type ShortTextFieldProps = {
    task: ShortTextTask
    answer: Answer | undefined
    onAnswer: (answer: Answer) => void
    
}

function OptionList({ task, answer, onAnswer}: OptionListProps) {
    return (
        <fieldset>
            <legend>Выберите вариант</legend>
            {task.options.map((option) => (
                <label key={option.id}>
                    <input
                        type="radio"
                        name={task.id}
                        checked={answer?.kind === "single-choice" && answer.optionId === option.id}
                        onChange={() =>
                            onAnswer({ taskId: task.id, kind: "single-choice", optionId: option.id })
                        }
                        
                    />
                    {option.label}
                </label>
            )
            )}
        </fieldset>
    )
}

function ShortTextField({ task, answer, onAnswer}: ShortTextFieldProps) {
    return (
        <label>
            Ваш ответ
            <textarea
                rows={4}
                value={answer?.kind === "short-text" ? answer.text : ""}
                onChange={(event) => onAnswer({
                    taskId: task.id, kind: "short-text", text: event.target.value
                })}
            />
        </label>
    )
}

export function TaskCard({ task, answer, onAnswer}: TaskCardProps) {
    if (task === undefined) return <p>Нет данных</p>

    return (
        <article>
            <h1>Тема: {task.topic}</h1>
            <h3>Вопрос: {task.prompt}</h3>
            {task.code && <pre>{task.code}</pre>}
            {task.kind === "single-choice" ?
                <OptionList task={task} answer={answer} onAnswer={onAnswer}  /> :
                <ShortTextField task={task} answer={answer} onAnswer={onAnswer} />
            }
        </article>
    )

}