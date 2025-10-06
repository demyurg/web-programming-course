// Прокрутка для навигационных ссылок
document.querySelectorAll('.nav-menu a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Увеличение при клике на изображения работ
document.querySelectorAll('.gallery-item img').forEach(img => {
    img.addEventListener('click', function() {
        this.classList.toggle('zoomed');
    });
});

// Добавляем стиль для увеличенного изображения
const style = document.createElement('style');
style.textContent = `
    .gallery-item img.zoomed {
        transform: scale(1.8);
        z-index: 1000;
        position: relative;
    }
`;
document.head.appendChild(style);

// Фиксированный шапка при прокрутке сайта
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    } else {
        header.style.background = '#ffffff';
        header.style.boxShadow = 'none';
    }
});