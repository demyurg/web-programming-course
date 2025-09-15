import ContactForm from '@/components/ContactForm/ContactForm'
import GalleryCard from '@/components/GalleryCard/GalleryCard'
import { Button } from '@/components/ui/button'

import styles from './page.module.scss'

export default function Home() {
	return (
		<div>
			<h1 className={styles.heroTitle}>Hello world!</h1>
			<p className={styles.bodyText}>Lorem</p>
			<Button>Primary button</Button>
			<Button variant='secondary'>Secondary</Button>
			<ContactForm />
			<GalleryCard
				imageSrc='/nature_1.jpg'
				imageAlt='nature_1'
				title='Nature_1'
				subtitle='nature_1 nature_1 nature_1'
				description={
					<>
						<p className={styles.dialogText}>
							nature_1 nature_1 nature_1 nature_1 nature_1
						</p>
						<p className={styles.dialogText}>
							nature_1 nature_1 nature_1nature_1
							nature_1nature_1nature_1nature_1nature_1nature_1
							nature_1nature_1nature_1nature_1nature_1nature_1
						</p>
					</>
				}
			/>
		</div>
	)
}
