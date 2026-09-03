# Git и GitHub в рамках курса

Этот гайд описывает рабочий маршрут: получить свою копию курса, выполнить задание в отдельной ветке и отправить его на проверку через pull request.

Основной репозиторий курса: [github.com/demyurg/web-programming-course](https://github.com/demyurg/web-programming-course).

## Рабочая схема

~~~text
fork → clone → ветка задания → commit → push → pull request
                                      ↑
                         исправления после замечаний
~~~

После замечаний преподавателя новый commit и push в той же ветке автоматически обновляют уже открытый pull request.

## Что нужно знать

- **Fork** — ваша копия репозитория курса на GitHub.
- **Ветка** — отдельная линия изменений для одной работы.
- **Commit** — сохранённая точка в истории изменений.
- **Push** — отправка локальных коммитов на GitHub.
- **Pull request** — предложение добавить вашу ветку в main репозитория курса.
- **origin** — ваш fork.
- **upstream** — основной репозиторий курса.

Для задания работайте в своей ветке, а не непосредственно в main.

## 1. Подготовьте Git

Установите Git и проверьте его в терминале, Git Bash или PowerShell:

~~~bash
git --version
~~~

Один раз настройте имя и email автора коммитов:

~~~bash
git config --global user.name "Имя Фамилия"
git config --global user.email "your.email@example.com"
~~~

Команды одинаковы в Linux, macOS и PowerShell. Настройки автора не заменяют вход в GitHub.

## 2. Создайте fork и клонируйте его

На странице [репозитория курса](https://github.com/demyurg/web-programming-course):

1. Нажмите **Fork**.
2. Выберите свой аккаунт GitHub.
3. Откройте созданный fork, нажмите **Code** и скопируйте HTTPS-адрес.
4. Выполните команды:

~~~bash
git clone https://github.com/YOUR_USERNAME/web-programming-course.git
cd web-programming-course
git remote -v
~~~

Замените YOUR_USERNAME на свой логин. В выводе origin должен указывать на ваш fork:

~~~text
origin  https://github.com/YOUR_USERNAME/web-programming-course.git (fetch)
origin  https://github.com/YOUR_USERNAME/web-programming-course.git (push)
~~~

Добавьте основной репозиторий под именем upstream:

~~~bash
git remote add upstream https://github.com/demyurg/web-programming-course.git
git remote -v
~~~

Свои ветки отправляйте в origin, а новые материалы курса получайте из upstream.

## 3. Начните новое задание

Перед новым заданием обновите main:

~~~bash
git switch main
git fetch upstream
git merge --ff-only upstream/main
git push origin main
~~~

Создайте отдельную ветку. Для нулевого занятия:

~~~bash
git switch -c l0-photo-portfolio
git branch --show-current
~~~

Последняя команда должна вывести l0-photo-portfolio. Для следующего задания создайте новое имя, например l1-typescript-basics.

Если обновление main завершилось конфликтом, не используйте принудительный push. Проверьте git status и обратитесь за помощью.

## 4. Выполните задание и создайте commit

Проверяйте состояние проекта:

~~~bash
git status
git diff
~~~

Перед commit убедитесь, что:

- активна ветка задания, а не main;
- изменены только нужные файлы;
- в проект не попали пароли, токены, .env и личные данные;
- результат проверен в браузере.

Для l0 откройте lessons/l0/index.html и проверьте изображения, навигацию, стили и Console в DevTools.

Добавьте изменения и проверьте индекс Git:

~~~bash
git add lessons/l0
git status
git diff --cached --stat
git diff --cached
~~~

Создайте commit:

~~~bash
git commit -m "Complete lesson 0 portfolio"
~~~

Commit сохраняется локально. На GitHub он появится после push.

## 5. Отправьте ветку

Первый push новой ветки:

~~~bash
git push -u origin l0-photo-portfolio
~~~

После следующих commit в этой же ветке достаточно:

~~~bash
git push
~~~

Не отправляйте рабочие изменения в upstream.

## 6. Создайте pull request

После push откройте свой fork на GitHub и нажмите **Compare & pull request**. Если кнопки нет, откройте **Pull requests** → **New pull request**.

Проверьте направление изменений:

~~~text
base repository: demyurg/web-programming-course
base branch:     main
head repository: YOUR_USERNAME/web-programming-course
compare branch:  l0-photo-portfolio
~~~

Изменения должны идти из ветки вашего fork в main репозитория курса.

В pull request укажите:

- занятие и название работы;
- что сделано;
- как проверяли результат;
- какие вопросы или затруднения остались.

Перед **Create pull request** откройте **Files changed**. В diff должны быть только изменения текущего задания.

Пример заголовка:

~~~text
L0: портфолио фотографа — Имя Фамилия
~~~

## 7. Исправьте замечания

Новый PR для исправлений того же задания создавать не нужно. Работайте в той же ветке:

~~~bash
git switch l0-photo-portfolio

# измените файлы и проверьте результат
git status
git diff

git add lessons/l0
git commit -m "Fix review comments"
git push
~~~

Новый push появится в уже открытом pull request.

## 8. Перейдите к следующему заданию

После завершения работы обновите main и создайте новую ветку:

~~~bash
git switch main
git fetch upstream
git merge --ff-only upstream/main
git push origin main
git switch -c l1-typescript-basics
~~~

Не удаляйте ветку, пока pull request ещё проверяется.

## Если что-то не работает

- **not a git repository** — перейдите в папку проекта командой cd web-programming-course.
- **src refspec ... does not match any** — проверьте имя ветки командами git branch и git branch --show-current.
- **rejected при push** — проверьте git remote -v и git status; не используйте git push --force.
- **GitHub не принимает push** — убедитесь, что origin указывает на ваш fork, и выполните вход через Git Credential Manager, GitHub Desktop или другой настроенный клиент.
- **В PR видны не те изменения** — проверьте base repository, base branch, head repository, compare branch и вкладку Files changed.

Не записывайте пароли и токены в URL remote, commit или файлы проекта.

## Чек-лист

- fork создан;
- локально склонирован ваш fork;
- origin указывает на ваш fork;
- upstream указывает на репозиторий курса;
- задание выполнено в отдельной ветке;
- результат проверен в браузере;
- перед commit просмотрены git status и git diff --cached;
- ветка отправлена в ваш fork;
- pull request направлен в main репозитория курса;
- исправления отправляются в тот же PR.
