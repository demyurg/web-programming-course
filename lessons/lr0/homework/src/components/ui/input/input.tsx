import { cn } from '@/lib/utils'

import styles from './input.module.scss'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
	return (
		<input
			type={type}
			data-slot='input'
			className={cn(styles.input, className)}
			{...props}
		/>
	)
}

export { Input }
