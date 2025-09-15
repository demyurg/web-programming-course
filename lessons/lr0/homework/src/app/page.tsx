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
		</div>
	)
}
