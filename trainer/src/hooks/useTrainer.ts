import { useEffect, useState } from "react";
import type { Answer, TrainingSet } from "../domain";
import { isAnswerFilled, calculateProgress } from "../domain";
import {
  loadSet,
  createAttempt,
  loadAttempt,
  saveAnswer,
  deleteAnswer,
  submitAttempt,
  loadResult,
  ApiError,
} from "../api/trainerApi";
import type { ServerAttempt, ServerResult } from "../api/trainerApi";

const SET_ID = "web-basics";
const STORAGE_KEY = "trainer_attemptId";

export function useTrainer() {
  const [set, setSet] = useState<TrainingSet | null>(null);
  const [attempt, setAttempt] = useState<ServerAttempt | null>(null);
  const [result, setResult] = useState<ServerResult | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [retry, setRetry] = useState<(() => Promise<void>) | null>(null);

  // Общая обработка запросов
  async function run(
    action: () => Promise<void>,
    repeat = action
  ) {
    setIsActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage("");
    setRetry(null);

    try {
      await action();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Ошибка запроса");
      setRetry(() => () => run(repeat));
    } finally {
      setIsActionLoading(false);
    }
  }

  // Загрузка модуля и восстановление попытки
  async function init() {
    setIsLoading(true);

    try {
      await run(async () => {
        const loadedSet = await loadSet(SET_ID);
        setSet(loadedSet);

        const savedId = localStorage.getItem(STORAGE_KEY);

        if (!savedId) {
          setNotice("Нет сохранённой попытки. Начните новую.");
          return;
        }

        let restored: ServerAttempt;

        try {
          restored = await loadAttempt(savedId);
        } catch (e) {
          if (e instanceof ApiError && e.status === 404) {
            localStorage.removeItem(STORAGE_KEY);
            setAttempt(null);
            setResult(null);
            setNotice("Не удалось восстановить попытку. Начните новую.");
            return;
          }
          throw e;
        }

        setAttempt(restored);
        setNotice("");

        if (restored.status === "submitted") {
          setResult(await loadResult(restored.id));
        }
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void init();
  }, []);

  // Создание новой попытки
  async function restartAction() {
    await run(async () => {
      const created = await createAttempt(SET_ID);
      localStorage.setItem(STORAGE_KEY, created.id);

      setAttempt(created);
      setResult(null);
      setNotice("");
      setSuccessMessage("Попытка создана.");
    });
  }

  // Сохранение ответа
  async function saveAnswerAction(answer: Answer, demoFail = false) {
    if (!attempt || attempt.status === "submitted") return;
    if (!isAnswerFilled(answer)) return;

    const save = async (fail = false) => {
      const updated = await saveAnswer(attempt.id, answer, fail);
      setAttempt(updated);
      setSuccessMessage("Ответ сохранён сервером.");
    };

    await run(() => save(demoFail), () => save());
  }

  // Очистка ответа
  async function clearAnswerAction(taskId: string) {
    if (!attempt || attempt.status === "submitted") return;

    await run(async () => {
      const updated = await deleteAnswer(attempt.id, taskId);
      setAttempt(updated);
      setSuccessMessage("Ответ удалён сервером.");
    });
  }

  // Завершение попытки
  async function submitAction() {
    if (!attempt || attempt.status === "submitted") return;

    await run(async () => {
      const res = await submitAttempt(attempt.id);

      setAttempt({ ...attempt, status: "submitted" });
      setResult(res);
      setSuccessMessage("Попытка отправлена.");
    });
  }

  // Производные данные
  const answersRecord: Record<string, Answer> = Object.fromEntries(
    (attempt?.answers || []).map(a => [a.taskId, a])
  );

  const tasks = set?.tasks || [];

  const progress = set
    ? calculateProgress(set, attempt?.answers || [])
    : { answered: 0, total: 0 };

  const missingTasks = tasks.filter(t =>
    !answersRecord[t.id] || !isAnswerFilled(answersRecord[t.id])
  );

  return {
    set,
    attempt,
    result,
    answersRecord,
    tasks,
    progress,
    missingTasks,
    isLoading,
    isActionLoading,
    errorMessage,
    successMessage,
    notice,
    retry,
    saveAnswer: saveAnswerAction,
    clearAnswer: clearAnswerAction,
    submit: submitAction,
    restart: restartAction,
    clearError: () => setErrorMessage(null),
  };
}