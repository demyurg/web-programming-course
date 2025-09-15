import { useMemo } from 'react'
import { ControllerRenderProps } from 'react-hook-form'

import {
	FormField,
	FormItem,
	FormControl,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import styles from './ContactFormField.module.scss'
import { FieldProps, FormValues } from './types'

export function ContactFormField({
	name,
	control,
	placeholder,
	component,
	options,
}: FieldProps) {
	const selectItems = useMemo(
		() =>
			options?.map(option => (
				<SelectItem key={option} value={option}>
					{option}
				</SelectItem>
			)) ?? [],
		[options],
	)

	const renderField = (
		field: ControllerRenderProps<FormValues, keyof FormValues>,
	) => {
		switch (component) {
			case 'input':
				return (
					<FormControl>
						<Input placeholder={placeholder} {...field} />
					</FormControl>
				)
			case 'textarea':
				return (
					<FormControl>
						<Textarea placeholder={placeholder} {...field} />
					</FormControl>
				)
			case 'select':
				return (
					<FormControl>
						<Select
							onValueChange={field.onChange}
							defaultValue={field.value ?? undefined}
							value={field.value ?? undefined}
						>
							<SelectTrigger>
								<SelectValue placeholder={placeholder} />
							</SelectTrigger>
							<SelectContent>{selectItems}</SelectContent>
						</Select>
					</FormControl>
				)
			default:
				return null
		}
	}

	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className={styles.formItem}>
					{renderField(field)}
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
