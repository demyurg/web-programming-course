import './Services.css'

const services = [
  {
    title: 'Портретная съёмка',
    description: 'Индивидуальная или парная съёмка в студии или на природе.',
    price: 'от 5 000 ₽',
    details: ['1–2 часа', '30 обработанных фото', 'Помощь с позированием'],
  },
  {
    title: 'Свадебная съёмка',
    description: 'Полный день с молодожёнами — от сборов до первого танца.',
    price: 'от 25 000 ₽',
    details: ['До 10 часов', '200+ обработанных фото', 'Выезд по области'],
  },
  {
    title: 'Съёмка природы',
    description: 'Прогулки по интересным местам, пейзажи и атмосферные кадры.',
    price: 'от 3 000 ₽',
    details: ['До 2 часов', '50 обработанных фото', 'Локация на выбор'],
  },
]

function Services() {
  return (
    <section id="services" className="services">
      <h2 className="services__title">Услуги</h2>

      <div className="services__grid">
        {services.map((service, index) => (
          <article className="services__card" key={index}>
            <h3 className="services__card-title">{service.title}</h3>
            <p className="services__card-desc">{service.description}</p>

            <ul className="services__card-details">
              {service.details.map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
            </ul>

            <p className="services__card-price">{service.price}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Services