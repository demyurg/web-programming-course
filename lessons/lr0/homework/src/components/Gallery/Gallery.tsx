import GalleryCard from '../GalleryCard/GalleryCard'

import styles from './Gallery.module.scss'

export default function Gallery() {
	return (
		<>
			<h2 className={styles.title}>Галерея работ</h2>
			<div className={styles.gallery}>
				<div className={styles.cardContainer}>
					<GalleryCard
						imageSrc='/nature_1.jpg'
						imageAlt='nature_1'
						title='Nature_1'
						subtitle='nature_1 nature_1 nature_1'
						description={
							<>
								<p>nature_1 nature_1 nature_1 nature_1 nature_1</p>
								<p>
									nature_1 nature_1 nature_1nature_1
									nature_1nature_1nature_1nature_1nature_1nature_1
									nature_1nature_1nature_1nature_1nature_1nature_1
								</p>
							</>
						}
					/>
					<GalleryCard
						imageSrc='/nature_1.jpg'
						imageAlt='nature_1'
						title='Nature_1'
						subtitle='nature_1 nature_1 nature_1'
						description={
							<>
								<p>nature_1 nature_1 nature_1 nature_1 nature_1</p>
								<p>
									nature_1 nature_1 nature_1nature_1
									nature_1nature_1nature_1nature_1nature_1nature_1
									nature_1nature_1nature_1nature_1nature_1nature_1
								</p>
							</>
						}
					/>
					<GalleryCard
						imageSrc='/nature_1.jpg'
						imageAlt='nature_1'
						title='Nature_1'
						subtitle='nature_1 nature_1 nature_1'
						description={
							<>
								<p>nature_1 nature_1 nature_1 nature_1 nature_1</p>
								<p>
									nature_1 nature_1 nature_1nature_1
									nature_1nature_1nature_1nature_1nature_1nature_1
									nature_1nature_1nature_1nature_1nature_1nature_1
								</p>
							</>
						}
					/>
				</div>
			</div>
		</>
	)
}
