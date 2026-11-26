/*
 * Стартовый файл нулевого занятия.
 *
 * Дополнительная интерактивность не обязательна. Если она нужна для выбранного
 * уровня, добавьте её после того, как закончите HTML и CSS.
 */
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

burger.onclick = function(){
    navLinks.classList.toggle ('active')
};

const gallery = document.querySelector('.gallery');
const nextButton = document.querySelector('.gallery-next');
const pastButton = document.querySelector('.gallery-past');

nextButton.onclick = function() {
    gallery.scrollLeft += gallery.querySelector('img').clientWidth + 24;
};

pastButton.onclick = function() {
    gallery.scrollLeft -= gallery.querySelector('img').clientWidth + 24;
};