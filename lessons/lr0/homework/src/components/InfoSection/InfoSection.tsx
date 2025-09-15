import styles from './InfoSection.module.scss'

export default function InfoSection() {
	return (
		<div className={styles.infoSection}>
			<div className={styles.infoBlock}>
				<h3 className={styles.infoTitle}>Обо мне</h3>
				<p className={styles.infoBody}>
					Текст о фотографе, опыте и подходе к съемке
				</p>
			</div>
			<div className={styles.infoBlock}>
				<h3 className={styles.infoTitle}>Статистика</h3>
				<p className={styles.infoBody}>
					200+ свадеб, 500+ портретов, 5 лет опыта
				</p>
			</div>
		</div>
	)
}
