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

import { FieldProps } from './types'

export function ContactFormField({
	name,
	control,
	placeholder,
	component,
	options,
}: FieldProps) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					{component === 'input' && (
						<FormControl>
							<Input placeholder={placeholder} {...field} />
						</FormControl>
					)}
					{component === 'textarea' && (
						<FormControl>
							<Textarea placeholder={placeholder} {...field} />
						</FormControl>
					)}
					{component === 'select' && options && (
						<FormControl>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<SelectTrigger>
									<SelectValue placeholder={placeholder} />
								</SelectTrigger>
								<SelectContent>
									{options.map(option => (
										<SelectItem key={option} value={option}>
											{option}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormControl>
					)}
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
