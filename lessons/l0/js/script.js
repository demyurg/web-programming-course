// Не знаю что можно было добавить по нажатию на кнопку, поэтому сделал анекдот)
document.addEventListener('DOMContentLoaded', () => {
    const viewWorksBtn = document.querySelector('.btn-primary');

    if (viewWorksBtn) {
        viewWorksBtn.addEventListener('click', () => {
            alert(`Работ здесь не будет, поэтому внимание анекдот!

— У тебя камера за 500 тысяч. Ты профессионал?
— Нет.
— А зачем камера?
— Чтобы все думали, что профессионал.`);
        });
    }
});