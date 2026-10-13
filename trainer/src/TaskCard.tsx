import type {Task, SingleChoiceTask} from "./domain"

type TaskCardProps = { task: Task | undefined}

type OptionListProps = {task: SingleChoiceTask}

function OptionList({task}: OptionListProps){
    return (
    <ul>
        {task.options.map((option) =>(
            <li key={option.id}>{option.label}</li>
        )
        )}
    </ul>
    )
}

export function TaskCard({task}: TaskCardProps)  {
    if (task === undefined) return <p>Нет данных</p>

    return (
        <article>
            <h1>Тема: {task.topic}</h1>
            <h3>Вопрос: {task.prompt}</h3>
            {task.code && <pre>{task.code}</pre>}
            {task.kind === "single-choice" ? <OptionList task={task}/> : <p>Задание с текстовым ответом</p>}
        </article>
    )

}