function initSlider(slider) {
    if (!slider) return;

    const track = slider.querySelector('.slider-track');
    const slides = slider.querySelectorAll('.slide');
    const prevBtn = slider.querySelector('.prev');
    const nextBtn = slider.querySelector('.next');

    let index = 0;

    function update() {
        track.style.transform = `translateX(-${index * 100}%)`;
    }

    function goTo(i) {
        index = (i + slides.length) % slides.length;
        update();
    }

    nextBtn.addEventListener('click', () => goTo(index + 1));
    prevBtn.addEventListener('click', () => goTo(index - 1));

    document.addEventListener('keydown', e => {
        if (slider.offsetParent === null) return;  
        if (e.key === 'ArrowRight') goTo(index + 1);
        if (e.key === 'ArrowLeft')  goTo(index - 1);
    });
}

initSlider(document.querySelector('.slider-desktop'));
initSlider(document.querySelector('.slider-mobile'));