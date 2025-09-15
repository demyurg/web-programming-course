import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import styles from './button.module.scss'

const buttonVariants = cva(styles.btn, {
	variants: {
		variant: {
			primary: styles.primary,
			secondary: styles.secondary,
		},
	},
	defaultVariants: {
		variant: 'primary',
	},
})

function Button({
	className,
	variant,
	asChild = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean
	}) {
	const Comp = asChild ? Slot : 'button'

	return (
		<Comp
			data-slot='button'
			className={cn(buttonVariants({ variant, className }))}
			{...props}
		/>
	)
}

export { Button, buttonVariants }
