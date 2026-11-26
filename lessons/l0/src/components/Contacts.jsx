import { useState } from 'react'
import './Contacts.css'


function Contacts() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

 
  function handleChange(event) {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

 
  function validate() {
    const newErrors = {}

    if (!form.name.trim()) {
      newErrors.name = 'Введите имя'
    } else if (/^\d+$/.test(form.name.trim())) {
        newErrors.name = 'Введено неккоректное имя'
    }

    if (!form.email.trim()) {
      newErrors.email = 'Введите email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Введен некорректный e-mail'
    }

    if (!form.message.trim()) {
      newErrors.message = 'Введите сообщение'
    } else if (form.message.trim().length < 10) {
      newErrors.message = 'Сообщение слишком короткое (минимум 10 символов)'
    }

    return newErrors
  }

  
  function handleSubmit(event) {
    event.preventDefault()

    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    console.log('Форма отправлена:', form)
    setSent(true)
    setForm({ name: '', email: '', message: '' })
    setErrors({})
  }

  return (
    <section id="contacts" className="contacts">
      <h2 className="contacts__title">Контакты</h2>

      <div className="contacts__content">
        {}
        <div className="contacts__info">
          <p className="contacts__intro">
            Хотите заказать съёмку или задать вопрос — напишите или позвоните.
            Отвечаю в течение дня.
          </p>

          <ul className="contacts__list">
            <li>
              <span className="contacts__label">Email</span>
              <a className="contacts__link" href="mailto:anna@example.com">
                anna@example.com
              </a>
            </li>
            <li>
              <span className="contacts__label">Телефон</span>
              <a className="contacts__link">
                +7 (999) 000-00-00
              </a>
            </li>
            <li>
              <span className="contacts__label">Соцсети</span>
              <span className="contacts__socials">
                <a className="contacts__link" href="https://instagram.com/">Instagram</a>
                {' · '}
                <a className="contacts__link" href="https://web.telegram.org/">Telegram</a>
                {' · '}
                <a className="contacts__link" href="https://vk.ru/">VK</a>
                {' · '}
                <a className="contacts__link" href="https://www.whatsapp.com/">WhatsApp</a>
              </span>
            </li>
          </ul>
        </div>

        
        <form className="contacts__form" onSubmit={handleSubmit} noValidate>
          <label className="contacts__field">
            <span className="contacts__field-label">Имя</span>
            <input
              className={`contacts__input ${errors.name ? 'contacts__input--error' : ''}`}
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Как к вам обращаться"
            />
            {errors.name && (
              <span className="contacts__error">{errors.name}</span>
            )}
          </label>

          <label className="contacts__field">
            <span className="contacts__field-label">Email</span>
            <input
              className={`contacts__input ${errors.email ? 'contacts__input--error' : ''}`}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
            {errors.email && (
              <span className="contacts__error">{errors.email}</span>
            )}
          </label>

          <label className="contacts__field">
            <span className="contacts__field-label">Сообщение</span>
            <textarea
              className={`contacts__input contacts__textarea ${errors.message ? 'contacts__input--error' : ''}`}
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={5}
              placeholder="Расскажите, что хотите снять"
            ></textarea>
            {errors.message && (
              <span className="contacts__error">{errors.message}</span>
            )}
          </label>

          <button className="contacts__button" type="submit">
            Отправить
          </button>

          {sent && (
            <p className="contacts__success">
              Спасибо! Сообщение отправлено — я скоро свяжусь с вами.
            </p>
          )}
        </form>
      </div>
    </section>
  )
}

export default Contacts