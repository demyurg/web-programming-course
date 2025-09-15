import styles from './Header.module.scss'

export default function Header() {
	return (
		<header className={styles.header}>
			<div className={styles.container}>
				<h1 className={styles.title}>Анна Светлова</h1>
				<div className={styles.nav}>
					<a>Главная</a>
					<a>Обо мне</a>
					<a>Галерея</a>
					<a>Контакты</a>
				</div>
			</div>
		</header>
	)
}
