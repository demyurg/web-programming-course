// js/script.js

document.addEventListener("DOMContentLoaded", () => {
    const images = [
        "images/about.jpeg",
        "images/nature_1.jpg",
        "images/nature_2.jpg",
        "images/portrait_1.jpg",
        "images/portrait_2.jpg",
        "images/wedding_1.jpg",
        "images/wedding_2.jpg"
    ];

    const galleryContainer = document.getElementById("gallery-container");

    images.forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = "Фотография";
        img.classList.add("gallery-item");
        img.addEventListener("click", () => openModal(src));
        galleryContainer.appendChild(img);
    });

    // Модальное окно
    const modal = document.getElementById("modal");
    const modalImg = document.getElementById("modal-image");
    const modalClose = document.getElementById("modal-close");

    function openModal(src) {
        modal.style.display = "block";
        modalImg.src = src;
    }

    modalClose.addEventListener("click", () => {
        modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
});
