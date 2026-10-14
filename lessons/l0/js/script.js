document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.getElementById('menu-toggle');
    var links = document.querySelectorAll('nav ul a');

    links.forEach(function (link) {
        link.addEventListener('click', function () {
            toggle.checked = false;
        });
    });
});

document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('submit-btn');
    var nameInput = document.getElementById('name');
    var emailInput = document.getElementById('email');
    var phoneInput = document.getElementById('phone');
    var messageInput = document.getElementById('message');
    var toast = document.getElementById('toast');
    var form = document.getElementById('feedback-form');

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var phoneRegex = /^[+\d\s\-()]+$/;

    function showError(input, message) {
        var error = input.parentElement.querySelector('.error');
        error.textContent = message;
        input.classList.add('invalid');
    }

    function clearError(input) {
        var error = input.parentElement.querySelector('.error');
        error.textContent = '';
        input.classList.remove('invalid');
    }

    function validateName() {
        var value = nameInput.value.trim();
        if (value === '') {
            showError(nameInput, 'Введите имя');
            return false;
        }
        if (value.length < 2) {
            showError(nameInput, 'Имя должно содержать минимум 2 символа');
            return false;
        }
        clearError(nameInput);
        return true;
    }

    function validateEmail() {
        var value = emailInput.value.trim();
        if (value === '') {
            showError(emailInput, 'Введите почту');
            return false;
        }
        if (!emailRegex.test(value)) {
            showError(emailInput, 'Введите корректный адрес почты');
            return false;
        }
        clearError(emailInput);
        return true;
    }

    function validatePhone() {
        var value = phoneInput.value.trim();
        if (value === '') {
            showError(phoneInput, 'Введите телефон');
            return false;
        }
        var digits = value.replace(/\D/g, '');
        if (digits.length < 10) {
            showError(phoneInput, 'Введите корректный номер телефона');
            return false;
        }
        clearError(phoneInput);
        return true;
    }

    function validateMessage() {
        var value = messageInput.value.trim();
        if (value === '') {
            showError(messageInput, 'Введите сообщение');
            return false;
        }
        if (value.length < 10) {
            showError(messageInput, 'Сообщение должно содержать минимум 10 символов');
            return false;
        }
        clearError(messageInput);
        return true;
    }

    btn.addEventListener('click', function () {
        var isValid = true;

        isValid = validateName() && isValid;
        isValid = validateEmail() && isValid;
        isValid = validatePhone() && isValid;
        isValid = validateMessage() && isValid;

        if (isValid) {
            form.reset();
            toast.classList.add('show');
            setTimeout(function () {
                toast.classList.remove('show');
            }, 3000);
        } else {
            toast.classList.remove('show');
        }
    });
});
