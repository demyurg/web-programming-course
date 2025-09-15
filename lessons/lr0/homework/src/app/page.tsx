import ContactSection from '@/components/ContactSection/ContactSection'
import Footer from '@/components/Footer/Footer'
import Gallery from '@/components/Gallery/Gallery'
import Header from '@/components/Header/Header'
import Hero from '@/components/Hero/Hero'
import InfoSection from '@/components/InfoSection/InfoSection'

export default function Home() {
	return (
		<div>
			<Header />
			<Hero />
			<InfoSection />
			<Gallery />
			<ContactSection />
			<Footer />
			{/* <h1 className={styles.heroTitle}>Hello world!</h1>
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
			/> */}
		</div>
	)
}
