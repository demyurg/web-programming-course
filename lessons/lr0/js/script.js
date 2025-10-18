
document.addEventListener("DOMContentLoaded", () => {
const fadeElems = document.querySelectorAll(".fade-in");

const options = {
threshold: 0.2
};

const observer = new IntersectionObserver((entries, observer) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.classList.add("visible");
observer.unobserve(entry.target); 
}
});
}, options);

fadeElems.forEach(el => {
observer.observe(el);
});
});


document.querySelectorAll(".gallery img").forEach(img => {
img.addEventListener("mouseenter", () => {
img.style.boxShadow = "0 12px 30px rgba(255,107,107,0.6)";
img.style.transform = "scale(1.07)";
});

img.addEventListener("mouseleave", () => {
img.style.boxShadow = "0 8px 20px rgba(0,0,0,0.3)";
img.style.transform = "scale(1.0)";
});
});
