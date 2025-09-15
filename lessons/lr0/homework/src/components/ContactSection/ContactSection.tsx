import Link from 'next/link'

import ContactForm from '../ContactForm/ContactForm'

import styles from './ContactSection.module.scss'

export default function InfoSection() {
	return (
		<div className={styles.contactSection}>
			<div className={styles.contactBlock}>
				<h3 className={styles.contactTitle}>Обо мне</h3>
				<Link
					href='https://demyurg.github.io/web-programming-course/lessons/lr0/docs/photographer-portfolio-design-specs.html'
					target='_blank'
					rel='noopener noreferrer'
				>
					Портфолио фотографа
				</Link>
				<Link
					href='https://demyurg.github.io/web-programming-course/lessons/lr0/docs/photographer-portfolio-design-specs.html'
					target='_blank'
					rel='noopener noreferrer'
				>
					Портфолио фотографа
				</Link>
				<Link
					href='https://demyurg.github.io/web-programming-course/lessons/lr0/docs/photographer-portfolio-design-specs.html'
					target='_blank'
					rel='noopener noreferrer'
				>
					Портфолио фотографа
				</Link>
				<Link
					href='https://demyurg.github.io/web-programming-course/lessons/lr0/docs/photographer-portfolio-design-specs.html'
					target='_blank'
					rel='noopener noreferrer'
				>
					Портфолио фотографа
				</Link>
				<Link
					href='https://demyurg.github.io/web-programming-course/lessons/lr0/docs/photographer-portfolio-design-specs.html'
					target='_blank'
					rel='noopener noreferrer'
				>
					Портфолио фотографа
				</Link>
				<Link
					href='https://demyurg.github.io/web-programming-course/lessons/lr0/docs/photographer-portfolio-design-specs.html'
					target='_blank'
					rel='noopener noreferrer'
				>
					Портфолио фотографа
				</Link>
				<Link
					href='https://demyurg.github.io/web-programming-course/lessons/lr0/docs/photographer-portfolio-design-specs.html'
					target='_blank'
					rel='noopener noreferrer'
				>
					Портфолио фотографа
				</Link>
				<Link
					href='https://demyurg.github.io/web-programming-course/lessons/lr0/docs/photographer-portfolio-design-specs.html'
					target='_blank'
					rel='noopener noreferrer'
				>
					Портфолио фотографа
				</Link>
				<Link
					href='https://demyurg.github.io/web-programming-course/lessons/lr0/docs/photographer-portfolio-design-specs.html'
					target='_blank'
					rel='noopener noreferrer'
				>
					Портфолио фотографа
				</Link>
			</div>
			<div className={styles.contactBlock}>
				<h3 className={styles.contactTitle}>Статистика</h3>
				<ContactForm />
			</div>
		</div>
	)
}
