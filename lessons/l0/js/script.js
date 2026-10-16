function showNotification(text, type = 'info') {
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = text;
        
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

const form = document.querySelector('.contact-form');
    
if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
            
        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
            
        showNotification(
            `Спасибо, ${name}! Ваше сообщение отправлено.`,
            'success'
        );
            
        form.reset();
    });
}