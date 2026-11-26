# Лабораторная работа L4. Черновик, восстановление и границы состояния

## 1. Цель работы

Доработать локальную попытку из A3 так, чтобы:

- ответы и текущее задание сохранялись после перезагрузки страницы;
- переходы состояния были собраны в `useReducer`;
- черновик синхронизировался с `localStorage` через `useEffect`;
- повреждённый или чужой черновик не ломал приложение, а показывал понятное сообщение и предложение сброса;
- ошибка хранилища не блокировала ввод;
- завершённая попытка не восстанавливалась как редактируемая.

Серверное сохранение и API в A4 не используются — они появятся в A5.

## 2. Что было сделано

В проекте `trainer/`:

1. Добавлена модель черновика `Draft`.
2. Все переходы состояния перенесены в reducer.
3. Добавлена строгая проверка JSON перед восстановлением.
4. Добавлен безопасный слой работы с `localStorage`.
5. `App.tsx` переведён с трёх `useState` на `useReducer`.
6. Добавлены эффекты чтения и записи черновика.
7. Добавлены состояния ошибок хранилища и баннер с кнопкой сброса.
8. Завершённая попытка отображается в режиме просмотра.
9. Исправлена лишняя кнопка «Завершить попытку».

### Изменённые и новые файлы

| Файл | Назначение |
|---|---|
| `trainer/src/attempt.ts` | Модель `Draft`, reducer, начальное состояние, валидация JSON |
| `trainer/src/draftStorage.ts` | Безопасные чтение, запись и удаление черновика |
| `trainer/src/App.tsx` | Подключение reducer, эффекты, UI, баннеры, экран завершённой попытки |
| `trainer/src/index.css` | Стили баннера состояния хранилища |

## 3. Модель данных

```ts
export type Draft = {
  version: 1;
  setId: string;
  taskId: string;
  answers: Answer[];
  status: "in-progress" | "submitted";
};
```

Почему именно так:

- `version` позволяет отличить старый формат черновика от нового;
- `setId` не даёт показать черновик другого набора как текущую попытку;
- `taskId` хранит текущее задание по id, а не по индексу — порядок заданий может измениться;
- `answers` — ответы, замена выполняется по `taskId`;
- `status` различает редактируемую и завершённую попытку.

## 4. Reducer

Reducer создаётся функцией `createAttemptReducer(tasks)`:

```ts
const attemptReducer = createAttemptReducer(trainingSet.tasks);
```

Внутри создаётся `Map` заданий по id, чтобы reducer мог проверять переходы, не обращаясь к внешнему хранилищу.

События:

```ts
type AttemptAction =
  | { type: "answerChanged"; answer: Answer }
  | { type: "moved"; taskId: TaskId }
  | { type: "restored"; draft: Draft }
  | { type: "reset"; draft: Draft }
  | { type: "submitted" };
```

### `answerChanged`

Правила:

- если попытка уже `submitted`, состояние не меняется;
- ответ должен относиться к существующему заданию;
- `kind` ответа должен совпадать с типом задания;
- для `single-choice` выбранный `optionId` должен существовать;
- если ответ для задания уже есть, он заменяется;
- если ответа нет, он добавляется в конец массива;
- массив ответов не мутируется, создаётся новый.

### `moved`

Переход выполняется только на существующее задание. Если задания нет, состояние остаётся прежним. Текущее задание хранится в `taskId`, поэтому переход не зависит от индекса в массиве.

### `restored`

Заменяет состояние уже проверенным черновиком. Проверка выполняется до вызова reducer, в `parseDraft`.

### `reset`

Возвращает начальное состояние новой попытки.

### `submitted`

Переводит попытку в завершённое состояние. Повторное событие не меняет состояние.

Reducer остаётся синхронным и предсказуемым: внутри нет `localStorage`, `fetch`, `Date.now()` и `Math.random()`.

## 5. Проверка черновика

Перед восстановлением строка из `localStorage` проходит `parseDraft(raw, set)`.

Проверяется:

1. JSON вообще парсится.
2. Значение является объектом, а не `null`, массивом или примитивом.
3. `version === 1`.
4. `setId` совпадает с текущим набором.
5. `status` равен `in-progress` или `submitted`.
6. `taskId` существует в наборе.
7. `answers` является массивом.
8. Каждый ответ:
   - является объектом;
   - имеет корректный `taskId`;
   - ссылается на существующее задание;
   - не дублирует другое задание;
   - имеет правильный `kind`;
   - для `single-choice` содержит существующий `optionId`;
   - для `short-text` содержит строку `text`.

Результат:

```ts
type DraftValidation =
  | { kind: "valid"; draft: Draft }
  | { kind: "invalid"; problem: DraftProblem; message: string };
```

`DraftProblem` позволяет различать причины:

- `malformed-json`;
- `wrong-shape`;
- `unsupported-version`;
- `foreign-set`;
- `invalid-status`;
- `unknown-task`;
- `duplicate-answer`;
- `invalid-answer`.

Случайное `as Draft` не используется: после `JSON.parse` значение имеет тип `unknown` и проверяется по полям.

## 6. Работа с localStorage

Модуль `draftStorage.ts` изолирует браузерное хранилище от компонентов.

Ключ:

```ts
export const DRAFT_STORAGE_KEY = "trainer.attempt.v1";
```

Общий helper:

```ts
export type StorageResult<T = void> =
  | { ok: true; value: T }
  | { ok: false };

function useStorage<T>(action: (storage: Storage) => T): StorageResult<T> {
  try {
    if (typeof window === "undefined") return { ok: false };
    return { ok: true, value: action(window.localStorage) };
  } catch {
    return { ok: false };
  }
}
```

Экспортируются:

- `readDraftRaw()` — читает строку или возвращает `null`;
- `writeDraft(draft)` — сериализует и записывает черновик;
- `removeDraft()` — удаляет ключ.

Любая ошибка доступа к хранилищу превращается в `{ ok: false }`, а не в исключение, которое уронило бы приложение.

## 7. Чтение и запись в App

### Чтение при монтировании

```ts
useEffect(() => {
  if (didReadRef.current) return;
  didReadRef.current = true;

  const result = readDraftRaw();

  if (!result.ok) {
    setStorageNotice({
      text: "Не удалось прочитать черновик из localStorage. Ввод продолжается в этой вкладке.",
      canReset: false,
    });
    setStorageReady(true);
    return;
  }

  if (result.value === null) {
    setStorageReady(true);
    return;
  }

  const validation = parseDraft(result.value, trainingSet);

  if (validation.kind === "invalid") {
    draftBlockedRef.current = true;
    setStorageNotice({
      text: `${validation.message} Сохранение приостановлено до явного сброса.`,
      canReset: true,
    });
    setStorageReady(true);
    return;
  }

  dispatch({ type: "restored", draft: validation.draft });
  setStorageReady(true);
}, []);
```

`didReadRef` защищает от повторного чтения. `storageReady` показывает, что чтение завершено и можно включать запись.

При повреждённом или чужом черновике:

- `draftBlockedRef.current = true` — запись приостанавливается, чтобы не затереть старые данные;
- показывается баннер с кнопкой «Сбросить черновик»;
- ввод при этом не блокируется и работает в памяти.

### Запись при изменении

```ts
useEffect(() => {
  if (!storageReady || draftBlockedRef.current) return;

  if (skipPersistRef.current) {
    skipPersistRef.current = false;
    return;
  }

  const result = writeDraft(state);

  if (!result.ok) {
    setStorageNotice({
      text: "Не удалось сохранить черновик; ввод продолжается в этой вкладке.",
      canReset: false,
    });
    return;
  }

  setStorageNotice(previous => (previous?.canReset ? previous : null));
}, [state, storageReady]);
```

`skipPersistRef` не даёт записать пустое начальное состояние сразу после монтирования, восстановления или сброса. Запись происходит на каждое изменение `state`.

## 8. Сброс

```ts
const handleReset = () => {
  const result = removeDraft();

  draftBlockedRef.current = false;
  skipPersistRef.current = true;

  dispatch({
    type: "reset",
    draft: createInitialDraft(trainingSet),
  });

  setStorageReady(true);

  setStorageNotice(
    result.ok
      ? null
      : {
          text: "Не удалось удалить старый черновик, но новая попытка уже начата.",
          canReset: false,
        }
  );
};
```

Сброс:

1. удаляет ключ из `localStorage`;
2. снимает блокировку записи;
3. возвращает начальное состояние;
4. убирает баннер, если удаление прошло успешно.

## 9. Интерфейс

### Основной экран

- заголовок набора;
- номер текущего задания;
- прогресс;
- `TaskCard` с контролируемым ответом;
- кнопки «Назад», «Дальше», «Завершить попытку».

Текущее задание вычисляется по `taskId`:

```ts
const currentIndex = tasks.findIndex(task => task.id === state.taskId);
const safeIndex = Math.max(0, currentIndex);
```

### Баннер хранилища

Показывается при:

- ошибке чтения;
- повреждённом JSON;
- чужом `setId`;
- ошибке записи.

Для повреждённого или чужого черновика есть кнопка «Сбросить черновик».

### Завершённая попытка

Если `state.status === "submitted"`:

- показывается заголовок «Попытка завершена»;
- выводится обзор всех заданий и ответов;
- поля ввода и радиокнопки отсутствуют;
- есть кнопка «Начать новую попытку».

Поэтому после перезагрузки завершённая попытка не становится снова редактируемой.

## 10. Результаты проверки

### Автоматические проверки

```powershell
cd "D:\учёба\7 семестр\VadimVoronkov\trainer"
npm run check
npm run build
```

Обе команды завершились без ошибок.

### Ручные сценарии в Chrome

| Сценарий | Действие | Ожидаемый результат |
|---|---|---|
| Сохранение ответа | Выбрать вариант, нажать F5 | Ответ и текущее задание восстановлены |
| Сохранение текста | Ввести текст, нажать F5 | Текст восстановлен |
| Переход | Нажать «Дальше», перезагрузить | Открылось то же задание |
| Повреждённый JSON | Поставить `{`, перезагрузить | Баннер, кнопка сброса, нет белого экрана |
| Чужой набор | Поставить `setId: "other-set"` | Сообщение о чужом черновике |
| Сброс | Нажать «Сбросить черновик» | Ключ удалён, прогресс 0 |
| Завершённая попытка | Завершить и перезагрузить | Режим просмотра, без полей ввода |
| Ошибка записи | Заставить `setItem` бросать ошибку | Предупреждение, ввод не блокируется |

Пример содержимого `localStorage` после ответа:

```json
{
  "version": 1,
  "setId": "web-basics",
  "taskId": "ts-1",
  "answers": [
    {
      "taskId": "ts-1",
      "kind": "single-choice",
      "optionId": "b"
    }
  ],
  "status": "in-progress"
}
```

## 11. Поэтапный план выполнения работы

### Этап 1. Изучение задания

Прочитаны:

- `lessons/l4/README.md`;
- `lessons/l4/docs/GUIDE.md`;
- `lessons/l4/docs/CHEATSHEET.md`;
- раздел про черновик в `course/CONTRACT.md`.

Выписаны требования: reducer, `localStorage`, проверка JSON, чужой `setId`, ошибка хранилища, `submitted`.

### Этап 2. Создание ветки

Ветка создана от версии A3:

```powershell
git switch l3-forms-conditions
git switch -c l4-draft-restore
```

### Этап 3. Анализ A3

В `trainer/src/App.tsx` на тот момент были:

- `useState` для `answers`;
- `useState` для `currentIndex`;
- `useState` для `status`;
- замена ответа по `taskId`;
- защита от редактирования после `submitted`;
- отсутствие `localStorage`.

Было решено:

- заменить три `useState` на `useReducer`;
- хранить текущее задание как `taskId`;
- вынести reducer и валидацию в отдельный модуль;
- вынести работу с хранилищем в отдельный модуль.

### Этап 4. Модель и reducer

Создан `attempt.ts`:

- типы `Draft`, `AttemptAction`, `DraftValidation`;
- `createInitialDraft`;
- `createAttemptReducer`;
- проверки ответов и переходов.

### Этап 5. Валидация

В `attempt.ts` добавлен `parseDraft`:

- разбор JSON;
- проверка версии;
- проверка `setId`;
- проверка `status`;
- проверка `taskId`;
- проверка массива ответов;
- проверка каждого ответа и дубликатов.

### Этап 6. Работа с хранилищем

Создан `draftStorage.ts`:

- ключ `trainer.attempt.v1`;
- `readDraftRaw`;
- `writeDraft`;
- `removeDraft`;
- общий `useStorage` с `try/catch`.

### Этап 7. Перевод App на useReducer

В `App.tsx`:

- подключён `useReducer`;
- добавлены эффекты чтения и записи;
- добавлены `storageReady`, `skipPersistRef`, `didReadRef`, `draftBlockedRef`;
- добавлен баннер;
- добавлен экран завершённой попытки;
- исправлена лишняя кнопка завершения.

### Этап 8. Стили

В `index.css` добавлены стили `.storage-notice`.

### Этап 9. Проверка

Выполнены:

```powershell
npm run check
npm run build
```

Затем приложение проверено в Chrome через DevTools → Application → Local Storage:

- ответ и переход сохраняются;
- повреждённый JSON обрабатывается;
- чужой `setId` обрабатывается;
- сброс удаляет ключ;
- `submitted` после перезагрузки только просматривается;
- ошибка записи не блокирует ввод.

### Этап 10. Фиксация результата

Изменения закоммичены в ветку четвёртой лабораторной:

```powershell
git add trainer/src
git commit -m "L4: Черновик, восстановление и границы состояния"
```

Отправка в свой форк:

```powershell
git push -u origin l4-draft-restore
```

## 12. Что показывать преподавателю

1. Открыть `Application → Local Storage → http://localhost:5173`.
2. Показать, что ключа `trainer.attempt.v1` сначала нет.
3. Выбрать ответ — ключ появляется.
4. Перезагрузить страницу — ответ и задание восстановились.
5. Поставить в значение `{` и перезагрузить — появился баннер, приложение не упало.
6. Нажать «Сбросить черновик» — ключ исчез.
7. Поставить `setId: "other-set"` — появилось сообщение о чужом черновике.
8. Завершить попытку и перезагрузить — открылся режим просмотра без полей ввода.
9. В консоли выполнить:

```js
Storage.prototype.setItem = function () {
  throw new Error("quota");
};
```

Затем выбрать ответ — появится предупреждение, но ввод продолжит работать.

## 13. Ограничения и следующий этап

В A4 черновик хранится только в браузере. Серверное сохранение не подключено.

В A5 планируется:

- API для сохранения попытки;
- разделение локальных и серверных подтверждённых ответов;
- обработка сетевых ошибок;
- синхронизация с сервером.

## 14. Вывод

В ходе работы:

- состояние попытки переведено на `useReducer`;
- добавлена строгая валидация черновика;
- реализовано сохранение и восстановление через `localStorage`;
- обработаны повреждённый черновик, чужой набор и ошибки хранилища;
- завершённая попытка защищена от редактирования;
- поведение проверено в браузере и сборкой TypeScript.
