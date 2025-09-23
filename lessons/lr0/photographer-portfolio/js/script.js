// Mobile nav toggle
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav-toggle');
if (nav && navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// Filters
const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
const gridItems = Array.from(document.querySelectorAll('.grid-item'));
function applyFilter(category) {
  gridItems.forEach((item) => {
    const match = category === 'all' || item.dataset.category === category;
    item.style.display = match ? '' : 'none';
  });
}
filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter || 'all');
  });
});

// Lightbox
const lightbox = document.querySelector('.lightbox');
const lightboxImg = document.querySelector('.lightbox-image');
const lightboxClose = document.querySelector('.lightbox-close');
if (lightbox && lightboxImg && lightboxClose) {
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target instanceof HTMLImageElement && target.closest('.grid-item')) {
      lightboxImg.src = target.src;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
    }
  });
  const close = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.removeAttribute('src');
  };
  lightboxClose.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) close();
  });
}

// Contact form validation
const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const messageInput = form.querySelector('#message');
    const status = form.querySelector('.form-status');
    let valid = true;

    function setError(input, msg) {
      const span = form.querySelector(`.error[data-for="${input.id}"]`);
      if (span) span.textContent = msg || '';
    }
    [nameInput, emailInput, messageInput].forEach((el) => setError(el, ''));

    if (!nameInput.value.trim()) {
      setError(nameInput, 'Введите имя');
      valid = false;
    }
    const email = emailInput.value.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRe.test(email)) {
      setError(emailInput, 'Введите корректный email');
      valid = false;
    }
    if (messageInput.value.trim().length < 10) {
      setError(messageInput, 'Сообщение должно быть не короче 10 символов');
      valid = false;
    }

    if (!valid) return;
    if (status) {
      status.textContent = 'Спасибо! Сообщение отправлено (демо).';
    }
    form.reset();
  });
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Reveal on scroll
const revealItems = Array.from(document.querySelectorAll('.reveal'));
if ('IntersectionObserver' in window && revealItems.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealItems.forEach((el) => io.observe(el));
} else {
  // Fallback: сразу показываем
  revealItems.forEach((el) => el.classList.add('visible'));
}


