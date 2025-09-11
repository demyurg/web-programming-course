import styles from './page.module.scss'

export default function Home() {
	return (
		<div>
			<h1 className={styles.heroTitle}>Hello world!</h1>
			<p className={styles.bodyText}>Lorem</p>
		</div>
	)
}
