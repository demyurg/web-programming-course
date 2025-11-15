import * as React from 'react';

export default function Header() {
  return (
    <header>
      <div className="container">
        <span className="logo">Анна Светлова — фотограф</span>
        <nav>
          <ul className="navi">
            <li><a href="#services">Услуги</a></li>
            <li><a href="#about">О нас</a></li>
            <li><a href="#works">Наши работы</a></li>
            <li><a href="#contacts">Контакты</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}