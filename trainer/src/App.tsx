import { useEffect, useState } from "react";
import AttemptView from "./components/AttemptView";
import { loadSession } from "./session";
import type { Session } from "./session";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; session: Session | null }
  | { kind: "failed"; message: string };

export default function App() {
  const [load, setLoad] = useState<LoadState>({ kind: "loading" });
  const [reloads, setReloads] = useState(0);

  useEffect(() => {
    let active = true;
    void loadSession().then(
      (session) => { if (active) setLoad({ kind: "ready", session }); },
      (error: unknown) => {
        if (active) setLoad({ kind: "failed", message: error instanceof Error ? error.message : "Неизвестная ошибка." });
      },
    );
    return () => { active = false; };
  }, [reloads]);

  function retry() {
    setLoad({ kind: "loading" });
    setReloads((current) => current + 1);
  }

  return (
    <main className="trainer">
      <div className="brand"><span className="brand-mark" aria-hidden="true">W.</span> Учебный тренажёр</div>
      {load.kind === "loading" && <p role="status">Загружаем данные учебного сервера…</p>}
      {load.kind === "failed" && (
        <section className="warning">
          <h1>Не удалось загрузить данные</h1>
          <p role="alert">{load.message}</p>
          <button type="button" onClick={retry}>Повторить загрузку</button>
        </section>
      )}
      {load.kind === "ready" && (load.session
        ? <AttemptView session={load.session} />
        : <p>На сервере пока нет учебных модулей.</p>)}
      <footer className="footer">Веб-программирование <span>Учебный тренажёр</span></footer>
    </main>
  );
}
