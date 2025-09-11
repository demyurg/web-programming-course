import * as React from 'react'
import styles from './input.module.scss'
import { cn } from '@/lib/utils'

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
