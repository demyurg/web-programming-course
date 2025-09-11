import { z } from 'zod'

export const formSchema = z.object({
	username: z.string().min(2, {
		message: 'Имя пользователя должно содержать минимум 2 символа.',
	}),
	email: z.string().email({ message: 'Неверный адрес электронной почты.' }),
	service: z.enum(['Услуга1', 'Услуга2', 'Услуга3'], {
		message: 'Выберите одну из доступных услуг.',
	}),
	message: z
		.string()
		.min(10, { message: 'Сообщение должно быть не менее 10 символов.' }),
})
