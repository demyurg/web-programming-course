import { useState } from 'react'
import './Header.css'
import about from '../images/about.jpeg'
import background_header from '../images/background_header.png'

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  function toggleMenu() {
    setMenuOpen((prev) => !prev)
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  

  return (
    <header className="header">
      <div
        className="header__bg"
        style={{ backgroundImage: `url(${background_header})` }}
      ></div>

      {}
      <button
        className="header__burger"
        onClick={toggleMenu}
        aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {menuOpen && (
        <div
          className="header__overlay-menu"
          onClick={closeMenu}
          aria-hidden="true"
          ></div>
)}



      <nav
        className={
          'header__nav' + (menuOpen ? ' header__nav--open' : '')
        }
      >
        <a className="header__link" href="#about" onClick={closeMenu}>
          Обо мне
        </a>
        <a className="header__link" href="#gallery" onClick={closeMenu}>
          Галерея
        </a>
        <a className='header__link' href='#services' onClick={closeMenu}>Услуги</a>
        <a className="header__link" href="#contacts" onClick={closeMenu}>
          Контакты
        </a>
      </nav>

      <div className="header__hero">
        <img
          className="header__photo"
          src={about}
          alt="Анна Аннушкина — фотограф"
        />
        <h1 className="header__name">Анна Аннушкина</h1>
        <p className="header__tagline">
          Портретная и свадебная съёмка, съёмка природы
        </p>
      </div>
    </header>
  )
}

export default Header
