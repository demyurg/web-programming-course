import './About.css'
import about from '../images/about.jpeg'

function About() {
  return (
    <section id="about" className="about">
      <h2 className="about__title">Обо мне</h2>

      <div className="about__content">
        <img
          className="about__photo"
          src={about}
          alt="Анна Аннушкина за работой"
        />

        <div className="about__text">
          <p>
            Меня зовут Анна. Уже более пяти лет я занимаюсь фотографией —
            снимаю портреты, свадьбы и природу. Для меня важно поймать
            не идеальную позу, а живое, настоящее мгновение.
          </p>
          <p>
            В портретной съёмке я ищу характер и настроение человека,
            на свадьбах — искренние эмоции, а в природе — тишину и свет,
            которые редко замечаешь в суете.
          </p>

          <ul className="about__facts">
            <li>5+ лет практики</li>
            <li>200+ съёмок</li>
            <li>Портрет · Свадьба · Природа</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default About