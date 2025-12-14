// Простая анимация для приветствия
document.addEventListener("DOMContentLoaded", () => {
  console.log("Портфолио Анны Светловой загружено!");

  // Пример: подсветка активного пункта меню
  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    });
  });
});
