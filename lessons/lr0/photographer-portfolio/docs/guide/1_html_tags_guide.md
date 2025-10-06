# Конспект по HTML тегам

## Содержание
1. [Общая информация про теги](#общая-информация-про-теги)
2. [Атрибуты](#атрибуты)
3. [Базовые теги страницы](#базовые-теги-страницы)
4. [Служебные теги](#служебные-теги)
5. [Блочные теги](#блочные-теги)
6. [Строчные теги для текста](#строчные-теги-для-текста)
7. [Таблицы](#таблицы)
8. [Интерактивные элементы](#интерактивные-элементы)

---

## Общая информация про теги

### Что такое тег
**Тег** - это инструкция браузеру, как отобразить содержимое. Состоит из имени в угловых скобках.

**Элемент** - это тег вместе с содержимым:
```html
<тег атрибут="значение">содержимое</тег>
```

**Самозакрывающиеся теги** не имеют содержимого:
```html
<img src="image.jpg" />
<br />
<hr />
```

### DOCTYPE
HTML менялся и эволюционировал. Есть несколько устоявшихся стандартов. Сейчас актуален HTML5. В зависимости от версии некоторые теги то появлялись, то исчезали.

**DOCTYPE** указывает браузеру версию HTML:
```html
<!DOCTYPE html> <!-- HTML5 (актуальный стандарт) -->
```

**Далее пойдет конспект по HTML5-совместимым тегам.**

Справка по совместимости тегов: [w3schools.com/tags/ref_html_dtd.asp](https://www.w3schools.com/tags/ref_html_dtd.asp)

### Семантика в HTML5
HTML5 делает упор на **семантику** - используйте теги по назначению, а не по внешнему виду. Стилизацию делайте через CSS.

✅ Семантический подход: `<header>`, `<nav>`, `<strong>`  
❌ Избегайте: `<div class="header">`, `<b>` для важности

---

## Атрибуты

### Базовые атрибуты (для всех тегов)

**`id`** - уникальный идентификатор элемента (для CSS, JavaScript, якорных ссылок)
```html
<div id="header">Заголовок</div>
<style>#header { color: blue; }</style>
<script>document.getElementById('header')</script>
<a href="#header">Перейти к заголовку</a>
```

**`class`** - CSS-класс для стилизации (может повторяться)
```html
<p class="important">Важный текст</p>
<div class="card red">Красная карточка</div>
```

**`title`** - всплывающая подсказка
```html
<abbr title="HyperText Markup Language">HTML</abbr>
```

**`style`** - инлайновые стили (не рекомендуется)
```html
<p style="color: red;">Красный текст</p>
```

**`data-*`** - пользовательские атрибуты для JavaScript
```html
<div data-user-id="123" data-role="admin">Пользователь</div>
```

**`data-testid`** / **`testid`** - для автотестирования
```html
<button data-testid="submit-button">Отправить</button>
<input testid="username-field" type="text">
```

---

## Базовые теги страницы

### `<html>` [📖](https://www.w3schools.com/tags/tag_html.asp)
Корневой элемент HTML-документа.

**Основные атрибуты:**
- `lang` - язык страницы

```html
<html lang="ru">
  <!-- содержимое страницы -->
</html>
```

### `<head>` [📖](https://www.w3schools.com/tags/tag_head.asp)
Служебная информация о документе (метаданные).

```html
<head>
  <meta charset="UTF-8">
  <title>Заголовок страницы</title>
  <link rel="stylesheet" href="style.css">
</head>
```

### `<body>` [📖](https://www.w3schools.com/tags/tag_body.asp)
Видимое содержимое страницы.

**Основные атрибуты:**
- `onload` - событие загрузки страницы

```html
<body>
  <h1>Добро пожаловать!</h1>
  <p>Содержимое страницы</p>
</body>
```

### `<meta>` [📖](https://www.w3schools.com/tags/tag_meta.asp)
Метаинформация о документе.

**Основные атрибуты:**
- `charset` - кодировка
- `name` - тип метаинформации
- `content` - содержимое
- `http-equiv` - HTTP-заголовки

```html
<meta charset="UTF-8">
<meta name="description" content="Описание страницы">
<meta name="keywords" content="html, теги, веб">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="refresh" content="30">
```

---

## Служебные теги

### `<link>` [📖](https://www.w3schools.com/tags/tag_link.asp)
Связывает документ с внешними ресурсами.

**Основные атрибуты:**
- `rel` - отношение к ресурсу
- `href` - путь к ресурсу
- `type` - MIME-тип

```html
<link rel="stylesheet" href="style.css">
<link rel="icon" href="favicon.ico" type="image/x-icon">
<link rel="preconnect" href="https://fonts.googleapis.com">
```

### `<style>` [📖](https://www.w3schools.com/tags/tag_style.asp)
Внутренние CSS-стили.

**Основные атрибуты:**
- `type` - тип стилей (по умолчанию text/css)

```html
<style>
  body { font-family: Arial, sans-serif; }
  .highlight { background-color: yellow; }
</style>
```

✅ Лучше использовать внешние CSS-файлы через `<link>`

### `<script>` [📖](https://www.w3schools.com/tags/tag_script.asp)
JavaScript-код или ссылка на внешний скрипт.

**Основные атрибуты:**
- `src` - путь к внешнему скрипту
- `type` - MIME-тип (по умолчанию text/javascript)
- `async` - асинхронная загрузка
- `defer` - отложенное выполнение

```html
<script src="script.js"></script>
<script>
  console.log('Hello, World!');
</script>
<script src="analytics.js" async></script>
```

---

## Блочные теги

### Структурные элементы

#### `<div>` [📖](https://www.w3schools.com/tags/tag_div.asp)
Универсальный контейнер без семантического значения.

```html
<div class="container">
  <div class="sidebar">Боковая панель</div>
  <div class="content">Основной контент</div>
</div>
```

✅ Используйте семантические теги когда возможно: `<header>`, `<nav>`, `<main>`

#### `<section>` [📖](https://www.w3schools.com/tags/tag_section.asp)
Тематический раздел документа.

```html
<section>
  <h2>О компании</h2>
  <p>История нашей компании...</p>
</section>
```

✅ Семантичнее чем `<div>` для логических разделов

#### `<article>` [📖](https://www.w3schools.com/tags/tag_article.asp)
Самостоятельный контент (статья, пост, комментарий).

```html
<article>
  <h1>Заголовок статьи</h1>
  <p>Текст статьи...</p>
  <time datetime="2025-01-15">15 января 2025</time>
</article>
```

✅ Подходит для контента, который можно распространять отдельно

#### `<header>` [📖](https://www.w3schools.com/tags/tag_header.asp)
Заголовочная область страницы или секции.

```html
<header>
  <h1>Название сайта</h1>
  <nav><!-- навигация --></nav>
</header>
```

✅ Семантичнее чем `<div class="header">`

#### `<footer>` [📖](https://www.w3schools.com/tags/tag_footer.asp)
Нижняя область страницы или секции.

```html
<footer>
  <p>&copy; 2025 Моя компания</p>
  <nav><!-- ссылки --></nav>
</footer>
```

#### `<nav>` [📖](https://www.w3schools.com/tags/tag_nav.asp)
Навигационные ссылки.

```html
<nav>
  <ul>
    <li><a href="/">Главная</a></li>
    <li><a href="/about">О нас</a></li>
    <li><a href="/contact">Контакты</a></li>
  </ul>
</nav>
```

✅ Только для основной навигации, не для всех ссылок

#### `<main>` [📖](https://www.w3schools.com/tags/tag_main.asp)
Основное содержимое страницы.

```html
<main>
  <h1>Заголовок страницы</h1>
  <p>Основной контент...</p>
</main>
```

✅ Должен быть только один на странице

### Дополнительные структурные теги
**`<aside>`** [📖](https://www.w3schools.com/tags/tag_aside.asp) - боковая информация, сайдбар

### Списки

#### `<ul>` [📖](https://www.w3schools.com/tags/tag_ul.asp)
Неупорядоченный список.

**Основные атрибуты:**
- `type` - тип маркера (устарело, используйте CSS)

```html
<ul>
  <li>Первый пункт</li>
  <li>Второй пункт</li>
  <li>Третий пункт</li>
</ul>
```

#### `<ol>` [📖](https://www.w3schools.com/tags/tag_ol.asp)
Упорядоченный список.

**Основные атрибуты:**
- `start` - начальное значение нумерации
- `type` - тип нумерации (1, A, a, I, i)
- `reversed` - обратная нумерация

```html
<ol start="5">
  <li>Пятый шаг</li>
  <li>Шестой шаг</li>
</ol>

<ol type="A">
  <li>Пункт A</li>
  <li>Пункт B</li>
</ol>
```

#### `<li>` [📖](https://www.w3schools.com/tags/tag_li.asp)
Элемент списка.

**Основные атрибуты:**
- `value` - значение для нумерованных списков

```html
<ol>
  <li value="10">Десятый пункт</li>
  <li>Одиннадцатый пункт</li>
</ol>
```

#### `<dl>` [📖](https://www.w3schools.com/tags/tag_dl.asp)
Список определений.

```html
<dl>
  <dt>HTML</dt>
  <dd>Язык разметки гипертекста</dd>
  <dt>CSS</dt>
  <dd>Каскадные таблицы стилей</dd>
</dl>
```

**`<dt>`** [📖](https://www.w3schools.com/tags/tag_dt.asp) - термин, **`<dd>`** [📖](https://www.w3schools.com/tags/tag_dd.asp) - определение

### Теги для форматирования текста

#### `<h1>` - `<h6>` [📖](https://www.w3schools.com/tags/tag_hn.asp)
Заголовки разного уровня.

```html
<h1>Главный заголовок</h1>
<h2>Подзаголовок</h2>
<h3>Заголовок третьего уровня</h3>
```

✅ Используйте иерархически: h1 → h2 → h3  
❌ Не пропускайте уровни: h1 → h3

#### `<p>` [📖](https://www.w3schools.com/tags/tag_p.asp)
Параграф текста.

```html
<p>Это абзац текста с автоматическими отступами сверху и снизу.</p>
<p>Это второй абзац.</p>
```

✅ Для текстовых блоков  
❌ Не используйте для разметки: `<p><button>Кнопка</button></p>`

#### `<blockquote>` [📖](https://www.w3schools.com/tags/tag_blockquote.asp)
Блочная цитата.

**Основные атрибуты:**
- `cite` - URL источника цитаты

```html
<blockquote cite="https://example.com/source">
  <p>Великие умы обсуждают идеи, средние - события, малые - людей.</p>
  <footer>— Элеанор Рузвельт</footer>
</blockquote>
```

#### `<pre>` [📖](https://www.w3schools.com/tags/tag_pre.asp)
Предварительно отформатированный текст.

```html
<pre>
    function hello() {
        console.log("Hello, World!");
    }
</pre>
```

✅ Сохраняет пробелы и переносы строк  
✅ Подходит для кода, ASCII-арт

#### `<hr>` [📖](https://www.w3schools.com/tags/tag_hr.asp)
Горизонтальная линия-разделитель.

```html
<p>Первая секция</p>
<hr>
<p>Вторая секция</p>
```

✅ Для тематического разделения контента

### Дополнительные блочные теги
**`<address>`** [📖](https://www.w3schools.com/tags/tag_address.asp) - контактная информация  
**`<figure>`** [📖](https://www.w3schools.com/tags/tag_figure.asp) - иллюстрация с подписью  
**`<figcaption>`** [📖](https://www.w3schools.com/tags/tag_figcaption.asp) - подпись к figure  
**`<details>`** [📖](https://www.w3schools.com/tags/tag_details.asp) - раскрывающийся блок  
**`<summary>`** [📖](https://www.w3schools.com/tags/tag_summary.asp) - заголовок для details

---

## Строчные теги для текста

### Ссылки и навигация

#### `<a>` [📖](https://www.w3schools.com/tags/tag_a.asp)
Гиперссылка.

**Основные атрибуты:**
- `href` - URL или якорь
- `target` - где открыть ссылку
- `rel` - отношение к целевой странице
- `download` - скачивание файла

```html
<a href="https://example.com">Внешняя ссылка</a>
<a href="/page.html">Внутренняя ссылка</a>
<a href="#section">Якорь на странице</a>
<a href="mailto:user@example.com">Email</a>
<a href="tel:+71234567890">Телефон</a>
<a href="document.pdf" download>Скачать PDF</a>
<a href="https://example.com" target="_blank" rel="noopener">
  Открыть в новой вкладке
</a>
```

✅ Семантично для всех ссылок  
❌ Не используйте для кнопок: используйте `<button>`

### Форматирование текста

#### `<span>` [📖](https://www.w3schools.com/tags/tag_span.asp)
Универсальный строчный контейнер.

```html
<p>Текст с <span class="highlight">выделенным фрагментом</span></p>
<span style="color: red;">Красный текст</span>
```

✅ Когда нет подходящего семантического тега  
❌ Избегайте для семантического выделения: используйте `<strong>`, `<em>`

#### `<strong>` [📖](https://www.w3schools.com/tags/tag_strong.asp)
Важный текст (семантически значимый).

```html
<p><strong>Внимание!</strong> Это важная информация.</p>
```

✅ Для семантической важности  
❌ Не `<b>` для важности  
❌ Не `<span style="font-weight: bold">`

#### `<em>` [📖](https://www.w3schools.com/tags/tag_em.asp)
Эмоциональное выделение, ударение.

```html
<p>Я <em>действительно</em> так думаю.</p>
```

✅ Для смыслового ударения  
❌ Не `<i>` для ударения

#### `<b>` [📖](https://www.w3schools.com/tags/tag_b.asp)
Визуально жирный текст (без семантики).

```html
<p><b>Ключевое слово</b> в тексте</p>
```

✅ Только для визуального выделения без важности  
✅ Для ключевых слов в тексте

#### `<i>` [📖](https://www.w3schools.com/tags/tag_i.asp)
Визуально курсивный текст.

```html
<p><i>Мысли героя</i> были запутанными.</p>
<p>Корабль <i>Титаник</i> затонул в 1912 году.</p>
```

✅ Для альтернативного тона, названий, терминов  
❌ Не для эмоционального ударения: используйте `<em>`

### Специальные строчные теги

#### `<code>` [📖](https://www.w3schools.com/tags/tag_code.asp)
Фрагмент программного кода.

```html
<p>Используйте функцию <code>console.log()</code> для отладки.</p>
```

#### `<mark>` [📖](https://www.w3schools.com/tags/tag_mark.asp)
Выделенный/помеченный текст.

```html
<p>Найдено совпадение: <mark>HTML теги</mark></p>
```

#### `<small>` [📖](https://www.w3schools.com/tags/tag_small.asp)
Мелкий текст, примечания.

```html
<p>Цена товара <small>(включая НДС)</small></p>
```

#### `<sub>` [📖](https://www.w3schools.com/tags/tag_sub.asp) и `<sup>` [📖](https://www.w3schools.com/tags/tag_sup.asp)
Подстрочный и надстрочный индекс.

```html
<p>H<sub>2</sub>O - вода</p>
<p>E = mc<sup>2</sup></p>
```

#### `<del>` [📖](https://www.w3schools.com/tags/tag_del.asp) и `<ins>` [📖](https://www.w3schools.com/tags/tag_ins.asp)
Удаленный и добавленный текст.

**Основные атрибуты:**
- `datetime` - дата изменения
- `cite` - причина изменения

```html
<p>Цена: <del>1000₽</del> <ins>800₽</ins></p>
```

### Дополнительные строчные теги
**`<abbr>`** [📖](https://www.w3schools.com/tags/tag_abbr.asp) - аббревиатура  
**`<q>`** [📖](https://www.w3schools.com/tags/tag_q.asp) - короткая цитата  
**`<cite>`** [📖](https://www.w3schools.com/tags/tag_cite.asp) - название произведения  
**`<dfn>`** [📖](https://www.w3schools.com/tags/tag_dfn.asp) - определяемый термин  
**`<kbd>`** [📖](https://www.w3schools.com/tags/tag_kbd.asp) - ввод с клавиатуры  
**`<samp>`** [📖](https://www.w3schools.com/tags/tag_samp.asp) - пример вывода программы  
**`<var>`** [📖](https://www.w3schools.com/tags/tag_var.asp) - переменная  
**`<time>`** [📖](https://www.w3schools.com/tags/tag_time.asp) - дата/время  
**`<br>`** [📖](https://www.w3schools.com/tags/tag_br.asp) - перенос строки  
**`<wbr>`** [📖](https://www.w3schools.com/tags/tag_wbr.asp) - возможность переноса

---

## Таблицы

### Основные теги таблиц

#### `<table>` [📖](https://www.w3schools.com/tags/tag_table.asp)
Контейнер для таблицы.

**Основные атрибуты:**
- `border` - толщина границы (устарело, используйте CSS)
- `cellpadding` - отступы в ячейках (устарело)
- `cellspacing` - расстояние между ячейками (устарело)

```html
<table>
  <caption>Продажи по месяцам</caption>
  <thead>
    <tr>
      <th>Месяц</th>
      <th>Доходы</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Январь</td>
      <td>100 000₽</td>
    </tr>
  </tbody>
</table>
```

✅ Используйте CSS для стилизации  
✅ Только для табличных данных  
❌ Не для макетирования страницы

#### `<tr>` [📖](https://www.w3schools.com/tags/tag_tr.asp)
Строка таблицы.

```html
<tr>
  <td>Ячейка 1</td>
  <td>Ячейка 2</td>
</tr>
```

#### `<td>` [📖](https://www.w3schools.com/tags/tag_td.asp)
Ячейка данных.

**Основные атрибуты:**
- `colspan` - объединение столбцов
- `rowspan` - объединение строк
- `headers` - связь с заголовками

```html
<td colspan="2">Объединенная ячейка</td>
<td rowspan="3">Высокая ячейка</td>
```

#### `<th>` [📖](https://www.w3schools.com/tags/tag_th.asp)
Заголовочная ячейка.

**Основные атрибуты:**
- `scope` - область действия заголовка (col, row, colgroup, rowgroup)
- `colspan`, `rowspan` - как у `<td>`

```html
<th scope="col">Название колонки</th>
<th scope="row">Название строки</th>
```

✅ Семантичнее чем `<td>` для заголовков  
✅ Используйте `scope` для доступности

### Группировка в таблицах

#### `<thead>` [📖](https://www.w3schools.com/tags/tag_thead.asp)
Заголовочная часть таблицы.

```html
<thead>
  <tr>
    <th>Имя</th>
    <th>Возраст</th>
  </tr>
</thead>
```

#### `<tbody>` [📖](https://www.w3schools.com/tags/tag_tbody.asp)
Основная часть таблицы.

```html
<tbody>
  <tr>
    <td>Иван</td>
    <td>25</td>
  </tr>
</tbody>
```

#### `<tfoot>` [📖](https://www.w3schools.com/tags/tag_tfoot.asp)
Нижняя часть таблицы (итоги).

```html
<tfoot>
  <tr>
    <td>Итого:</td>
    <td>150 000₽</td>
  </tr>
</tfoot>
```

### Дополнительные теги

#### `<caption>` [📖](https://www.w3schools.com/tags/tag_caption.asp)
Заголовок таблицы.

```html
<caption>Финансовый отчет за 2024 год</caption>
```

#### `<colgroup>` [📖](https://www.w3schools.com/tags/tag_colgroup.asp) и `<col>` [📖](https://www.w3schools.com/tags/tag_col.asp)
Группировка и стилизация столбцов.

```html
<colgroup>
  <col style="background-color: #f0f0f0;">
  <col span="2" style="background-color: #e0e0e0;">
</colgroup>
```

---

## Интерактивные элементы

### Формы

#### `<form>` [📖](https://www.w3schools.com/tags/tag_form.asp)
Контейнер для элементов формы.

**Основные атрибуты:**
- `action` - URL для отправки
- `method` - HTTP-метод (GET, POST)
- `enctype` - кодировка данных
- `target` - где показать ответ
- `novalidate` - отключить валидацию

```html
<form action="/submit" method="post" enctype="multipart/form-data">
  <!-- элементы формы -->
</form>

<form method="get" target="_blank">
  <!-- поиск -->
</form>
```

#### `<input>` [📖](https://www.w3schools.com/tags/tag_input.asp)
Поле ввода.

**Основные атрибуты:**
- `type` - тип поля
- `name` - имя для отправки
- `value` - значение
- `placeholder` - подсказка
- `required` - обязательное поле
- `disabled` - заблокированное поле
- `readonly` - только для чтения

**Основные типы:**
```html
<input type="text" name="username" placeholder="Логин" required>
<input type="password" name="password" placeholder="Пароль">
<input type="email" name="email" placeholder="email@example.com">
<input type="number" name="age" min="18" max="100">
<input type="tel" name="phone" placeholder="+7 (999) 123-45-67">
<input type="url" name="website" placeholder="https://example.com">
<input type="date" name="birthday">
<input type="time" name="appointment">
<input type="datetime-local" name="event">
<input type="search" name="query" placeholder="Поиск...">
<input type="hidden" name="csrf_token" value="abc123">
<input type="file" name="avatar" accept="image/*">
<input type="checkbox" name="agree" id="agree">
<input type="radio" name="gender" value="male" id="male">
<input type="range" name="volume" min="0" max="100" value="50">
<input type="color" name="theme" value="#ff0000">
```

✅ Используйте подходящие типы для валидации  
✅ Связывайте с `<label>`

#### `<label>` [📖](https://www.w3schools.com/tags/tag_label.asp)
Подпись к элементу формы.

**Основные атрибуты:**
- `for` - связь с элементом по id

```html
<label for="username">Имя пользователя:</label>
<input type="text" id="username" name="username">

<label>
  <input type="checkbox" name="agree"> Согласен с условиями
</label>
```

✅ Улучшает доступность и юзабилити

#### `<button>` [📖](https://www.w3schools.com/tags/tag_button.asp)
Кнопка.

**Основные атрибуты:**
- `type` - тип кнопки (submit, reset, button)
- `disabled` - заблокированная кнопка
- `form` - связь с формой по id

```html
<button type="submit">Отправить</button>
<button type="reset">Очистить</button>
<button type="button" onclick="alert('Клик!')">Кликни меня</button>
<button disabled>Недоступная кнопка</button>
```

✅ Семантичнее чем `<input type="button">`  
✅ Может содержать HTML-разметку

#### `<textarea>` [📖](https://www.w3schools.com/tags/tag_textarea.asp)
Многострочное текстовое поле.

**Основные атрибуты:**
- `rows` - количество строк
- `cols` - количество столбцов
- `placeholder` - подсказка
- `required` - обязательное поле
- `maxlength` - максимальная длина
- `resize` - возможность изменения размера (CSS)

```html
<textarea name="message" rows="5" cols="40" placeholder="Ваше сообщение" required>
Начальный текст
</textarea>
```

#### `<select>` [📖](https://www.w3schools.com/tags/tag_select.asp)
Выпадающий список.

**Основные атрибуты:**
- `multiple` - множественный выбор
- `size` - количество видимых опций
- `required` - обязательное поле

```html
<select name="country" required>
  <option value="">Выберите страну</option>
  <option value="ru">Россия</option>
  <option value="us" selected>США</option>
  <option value="de">Германия</option>
</select>

<select name="languages" multiple size="3">
  <option value="html">HTML</option>
  <option value="css">CSS</option>
  <option value="js">JavaScript</option>
</select>
```

#### `<option>` [📖](https://www.w3schools.com/tags/tag_option.asp)
Вариант в списке.

**Основные атрибуты:**
- `value` - значение для отправки
- `selected` - выбранный по умолчанию
- `disabled` - недоступный вариант

```html
<option value="red" selected>Красный</option>
<option value="blue">Синий</option>
<option value="green" disabled>Зеленый (недоступен)</option>
```

#### `<optgroup>` [📖](https://www.w3schools.com/tags/tag_optgroup.asp)
Группировка вариантов.

**Основные атрибуты:**
- `label` - название группы
- `disabled` - недоступная группа

```html
<select name="city">
  <optgroup label="Россия">
    <option value="msk">Москва</option>
    <option value="spb">Санкт-Петербург</option>
  </optgroup>
  <optgroup label="США">
    <option value="ny">Нью-Йорк</option>
    <option value="la">Лос-Анджелес</option>
  </optgroup>
</select>
```

#### `<fieldset>` [📖](https://www.w3schools.com/tags/tag_fieldset.asp)
Группировка элементов формы.

**Основные атрибуты:**
- `disabled` - отключить всю группу

```html
<fieldset>
  <legend>Контактная информация</legend>
  <label for="name">Имя:</label>
  <input type="text" id="name" name="name">
  
  <label for="email">Email:</label>
  <input type="email" id="email" name="email">
</fieldset>
```

#### `<legend>` [📖](https://www.w3schools.com/tags/tag_legend.asp)
Заголовок для группы полей.

```html
<legend>Способ доставки</legend>
```

### Другие интерактивные элементы

#### `<details>` [📖](https://www.w3schools.com/tags/tag_details.asp)
Раскрывающийся блок.

**Основные атрибуты:**
- `open` - открыт по умолчанию

```html
<details>
  <summary>Подробности</summary>
  <p>Скрытый контент, который можно развернуть</p>
</details>

<details open>
  <summary>Открыто по умолчанию</summary>
  <p>Этот блок уже развернут</p>
</details>
```

#### `<summary>` [📖](https://www.w3schools.com/tags/tag_summary.asp)
Заголовок раскрывающегося блока.

```html
<summary>Нажмите, чтобы развернуть</summary>
```

#### `<dialog>` [📖](https://www.w3schools.com/tags/tag_dialog.asp)
Модальное окно или диалог.

**Основные атрибуты:**
- `open` - открыт по умолчанию

```html
<dialog id="myDialog">
  <p>Это модальное окно</p>
  <button onclick="document.getElementById('myDialog').close()">
    Закрыть
  </button>
</dialog>

<button onclick="document.getElementById('myDialog').showModal()">
  Открыть диалог
</button>
```

### Медиа элементы

#### `<img>` [📖](https://www.w3schools.com/tags/tag_img.asp)
Изображение.

**Основные атрибуты:**
- `src` - путь к изображению
- `alt` - альтернативный текст
- `width`, `height` - размеры
- `loading` - способ загрузки (lazy, eager)

```html
<img src="photo.jpg" alt="Описание фото" width="300" height="200">
<img src="banner.jpg" alt="Баннер" loading="lazy">
```

✅ Всегда используйте атрибут `alt`

#### `<audio>` [📖](https://www.w3schools.com/tags/tag_audio.asp)
Аудио плеер.

**Основные атрибуты:**
- `controls` - показать элементы управления
- `autoplay` - автовоспроизведение
- `loop` - зацикливание
- `muted` - без звука
- `preload` - предзагрузка (auto, metadata, none)

```html
<audio controls>
  <source src="audio.mp3" type="audio/mpeg">
  <source src="audio.ogg" type="audio/ogg">
  Ваш браузер не поддерживает аудио.
</audio>
```

#### `<video>` [📖](https://www.w3schools.com/tags/tag_video.asp)
Видео плеер.

**Основные атрибуты:**
- `controls` - показать элементы управления
- `autoplay` - автовоспроизведение
- `loop` - зацикливание
- `muted` - без звука
- `poster` - постер видео
- `width`, `height` - размеры

```html
<video controls width="640" height="360" poster="preview.jpg">
  <source src="video.mp4" type="video/mp4">
  <source src="video.webm" type="video/webm">
  Ваш браузер не поддерживает видео.
</video>
```

#### `<source>` [📖](https://www.w3schools.com/tags/tag_source.asp)
Источник медиа для audio/video.

**Основные атрибуты:**
- `src` - путь к файлу
- `type` - MIME-тип
- `media` - медиа-запрос

```html
<source src="video-hd.mp4" type="video/mp4" media="(min-width: 800px)">
<source src="video-mobile.mp4" type="video/mp4">
```

#### `<track>` [📖](https://www.w3schools.com/tags/tag_track.asp)
Субтитры или метаданные для видео.

**Основные атрибуты:**
- `kind` - тип трека (subtitles, captions, descriptions, chapters, metadata)
- `src` - путь к файлу субтитров
- `srclang` - язык
- `label` - название трека
- `default` - трек по умолчанию

```html
<video controls>
  <source src="video.mp4" type="video/mp4">
  <track kind="subtitles" src="subtitles-ru.vtt" srclang="ru" label="Русский" default>
  <track kind="subtitles" src="subtitles-en.vtt" srclang="en" label="English">
</video>
```

---

## Заключение

Этот конспект охватывает основные HTML5-теги, необходимые для создания веб-страниц. Помните принципы семантической разметки:

✅ **Используйте теги по назначению** - не только для внешнего вида  
✅ **Применяйте подходящие атрибуты** - улучшают функциональность и доступность  
✅ **Структурируйте контент логично** - заголовки, разделы, списки  
✅ **Тестируйте доступность** - alt для изображений, label для полей форм

**Полезные ресурсы:**
- [w3schools.com](https://www.w3schools.com/) - основной справочник
- [developer.mozilla.org](https://developer.mozilla.org/ru/docs/Web/HTML) - подробная документация
- [validator.w3.org](https://validator.w3.org/) - проверка валидности HTML