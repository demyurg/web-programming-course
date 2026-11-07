import "./App.css";

import TaskCard from "./TaskCard";
import TaskList from "./TaskList";

import { useState } from "react";

import type { Answer } from "./domain";
import { calculateProgress, findTaskById } from "./domain";
import { trainingSet } from "./trainingData";

export default function App() {
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
        trainingSet.tasks[0]?.id ?? null
    );

    const [answers, setAnswers] = useState<Answer[]>([]);

    const [submitted, setSubmitted] = useState(false);

    const progress = calculateProgress(trainingSet, answers);

    const selectedTask = selectedTaskId
        ? findTaskById(trainingSet, selectedTaskId)
        : undefined;

    const selectedTaskIndex = trainingSet.tasks.findIndex(
        (task) => task.id === selectedTaskId
    );

    return (
        <main>
            {submitted ? (
                <section>
                    <h2>Попытка завершена</h2>
                    <p>
                        Результат: {progress.completed} из {progress.total}
                    </p>

                    <h2>Ответы:</h2>

                    {trainingSet.tasks.map((task) => {
                        const answer = answers.find(
                            (answer) => answer.taskId === task.id
                        );

                        return (
                            <section key={task.id}>
                                <h3>{task.prompt}</h3>

                                {task.kind === "single-choice" ? (
                                    <p>
                                        {" "}
                                        {answer?.kind === "single-choice"
                                            ? task.options.find(
                                                (option) =>
                                                    option.id === answer.optionId
                                            )?.label ?? "Нет ответа"
                                            : "Нет ответа"}
                                    </p>
                                ) : (
                                    <p>
                                        {" "}
                                        {answer?.kind === "short-text" &&
                                            answer.text.trim().length > 0
                                            ? answer.text
                                            : "Нет ответа"}
                                    </p>
                                )}
                            </section>
                        );
                    })}
                    <button
                        type="button"
                        onClick={() => {
                            setAnswers([]);
                            setSubmitted(false);
                            setSelectedTaskId(trainingSet.tasks[0]?.id ?? null);
                        }}
                    >
                        Начать новую попытку
                    </button>
                </section>
            ) : (
                <>
                    <h1>{trainingSet.title}</h1>
                    <p>Всего заданий: {trainingSet.tasks.length}</p>

                    <p>
                        Прогресс: {progress.completed} из {progress.total}
                    </p>

                    <h2>Неотвеченные задания: {progress.total - progress.completed}</h2>

                    <div className="trainer-layout">
                        <aside className="trainer-sidebar">
                            <h2>Список заданий</h2>

                            <TaskList
                                tasks={trainingSet.tasks}
                                answers={answers}
                                selectedTaskId={selectedTaskId}
                                onSelect={setSelectedTaskId}
                            />
                        </aside>

                        <div className="trainer-content">

                            {selectedTask ? (
                                <>
                                    <TaskCard
                                        task={selectedTask}
                                        disabled={submitted}
                                        answer={answers.find((answer) => answer.taskId === selectedTask.id)}
                                        onAnswerChange={(newAnswer) => {
                                            setAnswers((previousAnswers) => {
                                                const existingAnswer = previousAnswers.find(
                                                    (answer) => answer.taskId === newAnswer.taskId
                                                );

                                                if (existingAnswer) {
                                                    return previousAnswers.map((answer) =>
                                                        answer.taskId === newAnswer.taskId ? newAnswer : answer
                                                    );
                                                }

                                                return [...previousAnswers, newAnswer];
                                            });
                                        }}
                                    />
                                    <div>
                                        <button
                                            type="button"
                                            disabled={selectedTaskIndex <= 0}
                                            onClick={() => {
                                                const previousTask = trainingSet.tasks[selectedTaskIndex - 1];
                                                if (previousTask) {
                                                    setSelectedTaskId(previousTask.id);
                                                }
                                            }}
                                        >
                                            Предыдущее
                                        </button>

                                        <button
                                            type="button"
                                            disabled={selectedTaskIndex >= trainingSet.tasks.length - 1}
                                            onClick={() => {
                                                const nextTask = trainingSet.tasks[selectedTaskIndex + 1];
                                                if (nextTask) {
                                                    setSelectedTaskId(nextTask.id);
                                                }
                                            }}
                                        >
                                            Следующее
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (progress.completed < progress.total) {
                                                const confirmed = window.confirm(
                                                    `Осталось неотвеченных заданий: ${progress.total - progress.completed}. Завершить попытку?`
                                                );

                                                if (!confirmed) return;
                                            }

                                            setSubmitted(true);
                                        }}
                                    >
                                        Завершить попытку
                                    </button>

                                </>


                            ) : trainingSet.tasks.length === 0 ? (
                                <p>В наборе нет заданий.</p>
                            ) : (
                                <p>Задание не найдено. Выберите другое из списка.</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}