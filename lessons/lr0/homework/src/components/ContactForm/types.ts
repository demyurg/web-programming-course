import { Control } from 'react-hook-form'
import { z } from 'zod'

import { formSchema } from './formSchema'

export type FormValues = z.infer<typeof formSchema>

export type FieldProps = {
	name: keyof FormValues
	control: Control<FormValues>
	placeholder: string
	component: 'input' | 'textarea' | 'select'
	options?: string[]
}
