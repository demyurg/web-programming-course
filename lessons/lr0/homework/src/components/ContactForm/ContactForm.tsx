'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

import { ContactFormField } from './ContactFormField'
import { formSchema } from './formSchema'
import { FormValues } from './types'

export default function ContactForm() {
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: '',
			email: '',
			message: '',
			service: undefined,
		},
	})

	const serviceOptions = useMemo(() => ['Услуга1', 'Услуга2', 'Услуга3'], [])

	const handleSubmit = (values: FormValues) => {
		try {
			console.log(values)
		} catch (error) {
			console.error('Ошибка отправки формы:', error)
		}
	}

	return (
		<div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
					<ContactFormField
						name='username'
						control={form.control}
						placeholder='Ваше имя'
						component='input'
					/>
					<ContactFormField
						name='email'
						control={form.control}
						placeholder='Email адрес'
						component='input'
					/>
					<ContactFormField
						name='service'
						control={form.control}
						placeholder='Выберите услугу'
						component='select'
						options={serviceOptions}
					/>
					<ContactFormField
						name='message'
						control={form.control}
						placeholder='Сообщение'
						component='textarea'
					/>
					<Button type='submit'>Отправить consloe.log</Button>
				</form>
			</Form>
		</div>
	)
}
