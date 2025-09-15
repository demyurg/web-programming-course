'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

import { ContactFormField } from './ContactFormField'
import { formSchema } from './formSchema'
import { FormValues } from './types'

function onSubmit(values: FormValues) {
	console.log(values)
}

export default function ContactForm() {
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: '',
			email: '',
			message: '',
		},
	})

	return (
		<div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
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
						options={['Услуга1', 'Услуга2', 'Услуга3']}
					/>
					<ContactFormField
						name='message'
						control={form.control}
						placeholder='Сообщение'
						component='textarea'
					/>
					<Button type='submit'>Отправить console.log</Button>
				</form>
			</Form>
		</div>
	)
}
