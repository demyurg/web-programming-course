import { useState } from 'react'
import './Gallery.css'
import portrait1 from '../images/portrait_1.jpg'
import portrait2 from '../images/portrait_2.jpg'
import wedding1 from '../images/wedding_1.jpg'
import wedding2 from '../images/wedding_2.jpg'
import nature1 from '../images/nature_1.jpg'
import nature2 from '../images/nature_2.jpg'

const photos = [
  { id: 1, src: portrait1, alt: 'Портретная съёмка', caption: 'Портрет', category: 'portrait' },
  { id: 2, src: portrait2, alt: 'Портретная съёмка', caption: 'Портрет', category: 'portrait' },
  { id: 3, src: wedding1, alt: 'Свадебная съёмка',  caption: 'Свадьба',  category: 'wedding'  },
  { id: 4, src: wedding2, alt: 'Свадебная съёмка',  caption: 'Свадьба',  category: 'wedding'  },
  { id: 5, src: nature1,  alt: 'Съёмка природы',     caption: 'Природа',  category: 'nature'   },
  { id: 6, src: nature2,  alt: 'Съёмка природы',     caption: 'Природа',  category: 'nature'   },
]

const filters = [
  { value: 'all',      label: 'Все' },
  { value: 'portrait', label: 'Портрет' },
  { value: 'wedding',  label: 'Свадьба' },
  { value: 'nature',   label: 'Природа' },
]

function Gallery() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [openPhoto, setOpenPhoto] = useState(null)

  const visiblePhotos =
    activeFilter === 'all'
      ? photos
      : photos.filter((photo) => photo.category === activeFilter)

  function closeModal() {
    setOpenPhoto(null)
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      closeModal()
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') closeModal()
  }

  return (
    <section id="gallery" className="gallery">
      <h2 className="gallery__title">Галерея</h2>

      <div className="gallery__filters">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={
              'gallery__filter' +
              (activeFilter === filter.value ? ' gallery__filter--active' : '')
            }
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="gallery__grid">
        {visiblePhotos.map((photo) => (
          <figure
            className="gallery__item"
            key={photo.id}
            onClick={() => setOpenPhoto(photo)}
          >
            <img className="gallery__img" src={photo.src} alt={photo.alt} />
            <figcaption className="gallery__caption">{photo.caption}</figcaption>
          </figure>
        ))}
      </div>

      {openPhoto && (
        <div
          className="gallery__modal"
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="gallery__modal-close"
            onClick={closeModal}
            aria-label="Закрыть"
          >
            ×
          </button>
          <img
            className="gallery__modal-img"
            src={openPhoto.src}
            alt={openPhoto.alt}
          />
          <p className="gallery__modal-caption">{openPhoto.caption}</p>
        </div>
      )}
    </section>
  )
}

export default Gallery