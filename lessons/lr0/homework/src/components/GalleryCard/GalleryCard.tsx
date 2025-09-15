import Image from 'next/image'

import {
	MorphingDialog,
	MorphingDialogTrigger,
	MorphingDialogContent,
	MorphingDialogTitle,
	MorphingDialogSubtitle,
	MorphingDialogDescription,
	MorphingDialogContainer,
} from '@/components/ui/card/card'

import styles from './GalleryCard.module.scss'

import type { Transition } from 'framer-motion'

export type GalleryCardProps = {
	imageSrc: string
	imageAlt: string
	title: string
	subtitle?: string
	description?: React.ReactNode
	transition?: Transition
}

export default function GalleryCard({
	imageSrc,
	imageAlt,
	title,
	subtitle,
	description,
	transition = {
		type: 'spring',
		bounce: 0.05,
		duration: 0.25,
	},
}: GalleryCardProps) {
	if (!imageSrc || !imageAlt || !title) return null

	const DialogBody = () => (
		<div className={styles.dialogBody}>
			<MorphingDialogTitle className={styles.dialogTitle}>
				{title}
			</MorphingDialogTitle>
			{subtitle && (
				<MorphingDialogSubtitle className={styles.dialogSubtitle}>
					{subtitle}
				</MorphingDialogSubtitle>
			)}
			{description && (
				<MorphingDialogDescription
					disableLayoutAnimation
					variants={{
						initial: { opacity: 0, scale: 0.8, y: 100 },
						animate: { opacity: 1, scale: 1, y: 0 },
						exit: { opacity: 0, scale: 0.8, y: 100 },
					}}
				>
					{description}
				</MorphingDialogDescription>
			)}
		</div>
	)

	return (
		<MorphingDialog transition={transition}>
			<MorphingDialogTrigger className={styles.card}>
				<Image
					src={imageSrc}
					alt={imageAlt}
					className={styles.cardImage}
					width={320}
					height={180}
					sizes='(max-width: 600px) 100vw, 320px'
					style={{ objectFit: 'cover' }}
					priority={true}
				/>
				<div className={styles.cardFooter}>
					<MorphingDialogTitle className={styles.cardTitle}>
						{title}
					</MorphingDialogTitle>
					{subtitle && (
						<MorphingDialogSubtitle className={styles.cardSubtitle}>
							{subtitle}
						</MorphingDialogSubtitle>
					)}
				</div>
			</MorphingDialogTrigger>
			<MorphingDialogContainer>
				<MorphingDialogContent className={styles.dialog}>
					<Image
						src={imageSrc}
						alt={imageAlt}
						className={styles.dialogImage}
						width={640}
						height={360}
						loading='lazy'
						quality={100}
						sizes='(max-width: 600px) 100vw, 640px'
						style={{ objectFit: 'cover' }}
						priority={false}
					/>
					<DialogBody />
				</MorphingDialogContent>
			</MorphingDialogContainer>
		</MorphingDialog>
	)
}
