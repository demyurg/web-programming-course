import { Button } from '@/components/ui/button'
import styles from './page.module.scss'
import ContactForm from '@/components/ContactForm/ContactForm'

export default function Home() {
	return (
		<div>
			<h1 className={styles.heroTitle}>Hello world!</h1>
			<p className={styles.bodyText}>Lorem</p>
			<Button>Primary button</Button>
			<Button variant='secondary'>Secondary</Button>
			<ContactForm />
		</div>
	)
}
