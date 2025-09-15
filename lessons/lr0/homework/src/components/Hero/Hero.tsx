import { Button } from '@/components/ui/button'

import styles from './Hero.module.scss'

export default function Hero() {
	return (
		<div className={styles.hero}>
			<h3 className={styles.title}>Захватываю моменты, создаю воспоминания</h3>
			<p className={styles.subtitle}>
				Профессиональная фотосъемка портретов и свадеб
			</p>
			<Button>Посмотреть работы</Button>
		</div>
	)
}
