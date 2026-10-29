import './Footer.css'

const navLinks = [
  { href: '#about', label: 'Обо мне' },
  { href: '#services', label: 'Услуги' },
  { href: '#gallery', label: 'Галерея' },
  { href: '#contacts', label: 'Контакты' },
]

const socials = [
  { name: 'Instagram', url: 'https://instagram.com/' },
  { name: 'Telegram', url: 'https://web.telegram.org/' },
  { name: 'VK', url: 'https://vk.ru/' },
  {name: 'WhatsApp', url: '#'}
]

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__inner">
        <nav className="footer__nav" aria-label="Навигация в подвале">
          {navLinks.map((link) => (
            <a key={link.href} className="footer__link" href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <ul className="footer__socials">
          {socials.map((social) => (
            <li key={social.name}>
              <a
                className="footer__social"
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {social.name}
              </a>
            </li>
          ))}
        </ul>

        <p className="footer__copyright">
          © {year} Анна Аннушкина. Все права защищены.
        </p>
      </div>
    </footer>
  )
}

export default Footer