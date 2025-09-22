// получаем ссылки на наши элементы
let hamburger = document.querySelector('.hamburger');
let nav = document.querySelector('nav');

hamburger.addEventListener('click', function(e) {   // Добавляет обработчик события клика на элемент hamburger
	e.stopPropagation();                            // Останавливает всплытие события
	nav.classList.toggle('active');                 // Добавляет/удаляет класс active у элемента nav
});

document.addEventListener('click', function(e) {    // Добавляет обработчик клика на весь документ, срабатывает при клике в любом месте страницы.
	if (!nav.contains(e.target)) {                  // Проверяет, находится ли элемент, по которому кликнули внутри nav
		nav.classList.remove('active');             // Удаляет класс active, закрывая меню
	}
});