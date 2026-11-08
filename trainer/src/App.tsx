import "./App.css";

import TaskCard from "./TaskCard";
import TaskList from "./TaskList";

import { useState } from "react";

import type { Attempt } from "./domain";
import { calculateProgress, findTaskById, updateAnswer, clearAnswer, submitAttempt } from "./domain";
import { trainingSet } from "./trainingData";

export default function App() {
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
        trainingSet.tasks[0]?.id ?? null
    );

    const [attempt, setAttempt] = useState<Attempt>({
        answers: [],
        submitted: false
    });

    const [showReview, setShowReview] = useState(false);

    const answers = attempt.answers;
    const submitted = attempt.submitted;

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
                            setAttempt({
                                answers: [],
                                submitted: false
                            });
                            setSelectedTaskId(trainingSet.tasks[0]?.id ?? null);
                            setShowReview(false);
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
                                            setAttempt((previousAttempt) =>
                                                updateAnswer(previousAttempt, newAnswer)
                                            );
                                        }}
                                        onClearAnswer={(taskId) => {
                                            setAttempt((previousAttempt) =>
                                                clearAnswer(previousAttempt, taskId)
                                            );
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
                                        onClick={() => setShowReview(!showReview)}
                                    >
                                        {showReview ? "Скрыть обзор" : "Обзор ответов"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (progress.completed < progress.total) {
                                                const confirmed = window.confirm(
                                                    `Осталось неотвеченных заданий: ${progress.total - progress.completed}. Завершить попытку?`
                                                );

                                                if (!confirmed) return;
                                            }

                                            setAttempt((previousAttempt) => submitAttempt(previousAttempt));
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
                            {showReview && (
                                <section className="answers-review">
                                    <h2>Обзор ответов</h2>

                                    {trainingSet.tasks.map((task) => {
                                        const answer = answers.find(
                                            (answer) => answer.taskId === task.id
                                        );

                                        return (
                                            <div key={task.id}>
                                                <h3>{task.prompt}</h3>

                                                <p>
                                                    Ответ:{" "}
                                                    {task.kind === "single-choice"
                                                        ? answer?.kind === "single-choice"
                                                            ? task.options.find(
                                                                (option) => option.id === answer.optionId
                                                            )?.label ?? "Нет ответа"
                                                            : "Нет ответа"
                                                        : answer?.kind === "short-text" &&
                                                            answer.text.trim().length > 0
                                                            ? answer.text
                                                            : "Нет ответа"}
                                                </p>

                                                {answer && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setAttempt((previousAttempt) =>
                                                                clearAnswer(previousAttempt, task.id)
                                                            );
                                                        }}
                                                    >
                                                        Очистить ответ
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </section>
                            )}
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}