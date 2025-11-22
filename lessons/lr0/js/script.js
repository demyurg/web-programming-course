const toggle = document.querySelector(".mobile-toggle");
const menu = document.querySelector(".nav-menu");

toggle.addEventListener("click", () => {
  menu.classList.toggle("active");
  toggle.innerHTML = menu.classList.contains("active") ? "✕" : "☰";
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    target.scrollIntoView({ behavior: "smooth" });

    if (menu.classList.contains("active")) {
      menu.classList.remove("active");
      toggle.innerHTML = "☰";
    }
  });
});
