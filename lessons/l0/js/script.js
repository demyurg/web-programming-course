const button = document.querySelector("#contact-button");
const message = document.querySelector("#contact-message");

button.addEventListener("click", () => {
  message.hidden = !message.hidden;
});

if (button) {
  button.addEventListener("click", () => {
    console.log("Кнопка нажата");
  });
}