const form = document.getElementById('form');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    
    if (!name) {
        alert('Введите имя');
        return;
    }
    
    if (!email.includes('@')) {
        alert('Введите корректный email');
        return;
    }
});

function toggleMenu() {
    const menu = document.querySelector(".mobile-menu");
    menu.classList.toggle("hidden"); // Переключаем состояние скрытого меню
    menu.classList.toggle("show"); // Включаем показ меню
}

// Автоматическое закрытие меню при переходе по ссылке
document.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', function(e) {
        const menu = document.querySelector(".mobile-menu");
        if(menu.classList.contains("show")) { // Проверяем, открыто ли меню
            menu.classList.add("hidden"); // Прячем меню
            menu.classList.remove("show"); // Убираем показ
        }
    });
});