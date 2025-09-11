import styles from './GalleryCard.module.scss'
import {
	MorphingDialog,
	MorphingDialogTrigger,
	MorphingDialogContent,
	MorphingDialogTitle,
	MorphingDialogImage,
	MorphingDialogSubtitle,
	MorphingDialogDescription,
	MorphingDialogContainer,
} from '@/components/ui/card/card'

import type { AnimationGeneratorType, Transition } from 'framer-motion'

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
		type: 'spring' as AnimationGeneratorType,
		bounce: 0.05,
		duration: 0.25,
	},
}: GalleryCardProps) {
	return (
		<MorphingDialog transition={transition}>
			<MorphingDialogTrigger className={styles.card}>
				<MorphingDialogImage
					src={imageSrc}
					alt={imageAlt}
					className={styles.cardImage}
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
					<MorphingDialogImage
						src={imageSrc}
						alt={imageAlt}
						className={styles.dialogImage}
					/>
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
				</MorphingDialogContent>
			</MorphingDialogContainer>
		</MorphingDialog>
	)
}
