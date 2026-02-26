function revealSections() {
  const sections = document.querySelectorAll("section");
  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      sec.classList.add("visible");
    }
  });
}

document.addEventListener("scroll", revealSections);
document.addEventListener("DOMContentLoaded", revealSections); // запускаем сразу после загрузки
