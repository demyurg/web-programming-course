# L5. Краткая справка

[Задание](../README.md) · [Гайд](GUIDE.md) · [Справка](CHEATSHEET.md) · [Интерактив](interactive.html) · [Слайды](slides-standalone/slides.html)

## Карта понятий

| Вопрос | Пример |
| --- | --- |
| Как передаются данные? | TCP, UDP |
| Как программа пользуется сетью? | сокетный API |
| Как устроен обмен? | HTTP-запрос и ответ; сообщения WebSocket |
| Как записаны значения? | JSON |
| Какие действия и поля есть у сервиса? | контракт конкретного API; REST или RPC как способы его устроить |

gRPC описывает вызовы и типы между программами и обычно использует HTTP/2. В A5 нужен только готовый HTTP API. Отсутствие ответа не доказывает, что действие не выполнено; повтор зависит от правил конкретного API.

REST — подход к устройству взаимодействия вокруг ресурсов, а не синоним HTTP или JSON. Наличие GET/POST/PUT/DELETE ещё не делает API полностью REST-совместимым.

Договор HTTP API можно записать в Markdown или OpenAPI. Работа может идти от описания к коду либо от кода к описанию. Orval генерирует клиентские типы и функции из OpenAPI; в A5 он не требуется. Описание не заменяет проверку поведения сервера.

## Запрос JSON

```ts
const response = await fetch(url, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const data = await response.json();
```

## Маршруты A5

| Действие | Метод и путь | Тело |
| --- | --- | --- |
| Список модулей текущего API | `GET /api/sets` | нет |
| Модуль | `GET /api/sets/:id` | нет |
| Попытка | `POST /api/attempts` | `{setId}` |
| Ответ | `PUT /api/attempts/:id/answers/:taskId` | Answer |
| Очистка | `DELETE /api/attempts/:id/answers/:taskId` | нет |
| Завершение | `POST /api/attempts/:id/submit` | `{}` |
| Результат | `GET /api/attempts/:id/result` | нет |

## Ответы

```json
{"taskId":"ts-1","kind":"single-choice","optionId":"b"}
```

```json
{"taskId":"react-1","kind":"short-text","text":"Объяснение"}
```

Кнопка disabled при loading. В catch не стирайте локальный ввод. Проверяйте response.ok, затем JSON; не отправляйте score; null показывайте как ожидание проверки.

## Ошибки

400 — неверное тело, 404 — объект не найден, 409 — действие не соответствует состоянию, 413 — слишком большое тело, 500 — учебная ошибка. Ошибка сети не имеет HTTP-ответа.

## Запуск сервера

Linux и Windows PowerShell:

```sh
node course/server/server.mjs
```

Полная таблица находится в [CONTRACT.md](../../../course/CONTRACT.md).
