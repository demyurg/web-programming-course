import { useState } from "react";
import {updateAnswer, clearAnswer, finishAttempt as finishAttemptData} from "./domain";
import type { Answer, Attempt, ServerAttempt, Result} from "./domain";
import { createAttempt, saveAnswer, deleteAnswer, submitAttempt, getAttempt, getResult } from "./api/trainerApi";

export function useAttempt() {
  const [attempt, setAttempt] = useState<Attempt>({answers: [], submitted: false,});
  const [serverAttempt, setServerAttempt] = useState<ServerAttempt | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const [pendingAnswer, setPendingAnswer] = useState<Answer | null>(null);

  async function handleCreateAttempt(setId: string) {
    const data = await createAttempt(setId);

    setServerAttempt(data);
    localStorage.setItem("attemptId", data.id);
  }
  async function handleRestoreAttempt(attemptId: string) {
    const data = await getAttempt(attemptId);

    setServerAttempt(data);

    setAttempt({
      answers: data.answers,
      submitted: data.status === "submitted"
    });

    if (data.status === "submitted") {
      const resultData = await getResult(attemptId);
      setResult(resultData);
    }
  }

  async function handleAnswerChange(newAnswer: Answer) {
    setAttempt((currentAttempt) => updateAnswer(currentAttempt, newAnswer));

    if (!serverAttempt) {
      return;
    }

    try {
      const data = await saveAnswer(serverAttempt.id, newAnswer);

      setServerAttempt(data);
      setPendingAnswer(null);
      setSaveError(null);
    } catch (error) {
      setPendingAnswer(newAnswer);

      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError("Не удалось сохранить ответ");
      }
    }
  }

  async function handleRetrySave() {
    if (!serverAttempt || !pendingAnswer) {
      return;
    }

    try {
      const data = await saveAnswer(serverAttempt.id, pendingAnswer);

      setServerAttempt(data);
      setPendingAnswer(null);
      setSaveError(null);
    } catch (error) {
      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError("Не удалось сохранить ответ");
      }
    }
  }
  async function handleClearAnswer(taskId: string) {
    setAttempt((currentAttempt) => clearAnswer(currentAttempt, taskId));

    if (!serverAttempt) {
      return;
    }

    try {
      const data = await deleteAnswer(serverAttempt.id, taskId);

      setServerAttempt(data);
      setSaveError(null);
    } catch (error) {
      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError("Не удалось удалить ответ");
      }
    }
  }

  async function handleFinish() {
    if (!serverAttempt) {
      return;
    }
    if (pendingAnswer !== null) {
      setSaveError("Сначала сохраните ответ, используя кнопку «Повторить сохранение»");
      return;
    }
    try {
      const data = await submitAttempt(serverAttempt.id);

      setResult(data);
      setAttempt((currentAttempt) => finishAttemptData(currentAttempt));
      setSaveError(null);
    } catch (error) {
      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError("Не удалось завершить попытку");
      }
    }
  }

  
async function handleNewAttempt(setId: string) {
  try {
    const data = await createAttempt(setId);

    setServerAttempt(data);
    setAttempt({ answers: [], submitted: false });
    localStorage.setItem("attemptId", data.id);
    setResult(null);
    setSaveError(null);
  } catch (error) {
    if (error instanceof Error) {
      setSaveError(error.message);
    } else {
      setSaveError("Не удалось создать новую попытку");
    }
  }
}


  return {
    attempt,
    serverAttempt,
    saveError,
    handleCreateAttempt,
    handleAnswerChange,
    pendingAnswer,
    handleRetrySave,
    handleClearAnswer,
    handleFinish,
    handleNewAttempt,
    result, 
    handleRestoreAttempt
  };
}