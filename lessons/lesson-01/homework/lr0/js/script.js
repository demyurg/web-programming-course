// Получаем элементы модального окна
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const closeBtn = document.querySelector(".close");

// Открытие модального окна при клике на фото
document.querySelectorAll(".gallery-img, .hero-img").forEach(img => {
    img.addEventListener("click", () => {
        modal.style.display = "block";
        modalImg.src = img.src;
    });
});

// Закрытие по кнопке
closeBtn.onclick = function() {
    modal.style.display = "none";
}

// Закрытие по клику вне изображения
modal.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
});

