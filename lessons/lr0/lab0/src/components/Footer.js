import React from 'react';

export default function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-info">
          <h3>Контакты</h3>
          <p> +7 905 910 9221</p>
          <p> demo22@gmail.com</p>
        </div>

        <div className="footer-socials">
          <a href="https://www.instagram.com/">Instagram</a>
        </div>
      </div>

      <div className="footer-bottom">
        © 2025 Анна Светлова | Все права защищены
      </div>
    </footer>
  );
}