const menuButton = document.getElementById("menu-btn");
const menu = document.getElementById("menu");

if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
        menu.classList.toggle("open");
    });
}

const contactButton = document.querySelector("#contact-button");
const contactMessage = document.querySelector("#contact-message");

if (contactButton && contactMessage) {
    contactButton.addEventListener("click", () => {
        contactMessage.hidden = !contactMessage.hidden;
    });
}
