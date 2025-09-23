document.addEventListener('DOMContentLoaded', function() {
        const carousel = document.querySelector('.carousel-container');
        const imagesContainer = document.querySelector('.carousel');
        const images = document.querySelectorAll('.carousel img');
        const prevBtn = document.querySelector('.carousel-btn.prev');
        const nextBtn = document.querySelector('.carousel-btn.next');
        const indicatorsContainer = document.querySelector('.carousel-indicators');
        
        let currentIndex = 0;
        let intervalId;
        
        images.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.classList.add('indicator');
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => goToSlide(index));
            indicatorsContainer.appendChild(indicator);
        });
        
        const indicators = document.querySelectorAll('.indicator');
        
        function goToSlide(index) {
            currentIndex = index;
            updateCarousel();
            resetInterval();
        }

        function updateCarousel() {
            imagesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentIndex);
            });
        }
        
        function nextSlide() {
            currentIndex = (currentIndex + 1) % images.length;
            updateCarousel();
        }
        
        function prevSlide() {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateCarousel();
        }
        
        function resetInterval() {
            clearInterval(intervalId);
            intervalId = setInterval(nextSlide, 3000);
        }
        
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetInterval();
        });
        
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetInterval();
        });
        
        resetInterval();

        carousel.addEventListener('mouseenter', () => clearInterval(intervalId));
        carousel.addEventListener('mouseleave', resetInterval);
    });
