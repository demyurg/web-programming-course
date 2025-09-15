'use client'

import { Slot } from '@radix-ui/react-slot'
import { createContext, useContext, useId } from 'react'
import {
	Controller,
	FormProvider,
	useFormContext,
	useFormState,
	type ControllerProps,
	type FieldPath,
	type FieldValues,
} from 'react-hook-form'

import { cn } from '@/lib/utils'

import styles from './form.module.scss'

const Form = FormProvider

type FormFieldContextValue<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
	name: TName
}

const FormFieldContext = createContext<FormFieldContextValue>(
	{} as FormFieldContextValue,
)

const FormField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	...props
}: ControllerProps<TFieldValues, TName>) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller {...props} />
		</FormFieldContext.Provider>
	)
}

const useFormField = () => {
	const fieldContext = useContext(FormFieldContext)
	const itemContext = useContext(FormItemContext)
	const { getFieldState } = useFormContext()
	const formState = useFormState({ name: fieldContext.name })
	const fieldState = getFieldState(fieldContext.name, formState)

	if (!fieldContext) {
		throw new Error('useFormField should be used within <FormField>')
	}

	const { id } = itemContext

	return {
		id,
		name: fieldContext.name,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
		...fieldState,
	}
}

type FormItemContextValue = {
	id: string
}

const FormItemContext = createContext<FormItemContextValue>(
	{} as FormItemContextValue,
)

function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
	const id = useId()

	return (
		<FormItemContext.Provider value={{ id }}>
			<div
				data-slot='form-item'
				className={cn(styles.formItem, className)}
				{...props}
			/>
		</FormItemContext.Provider>
	)
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
	const { error, formItemId } = useFormField()

	return (
		<Slot
			data-slot='form-control'
			id={formItemId}
			aria-invalid={!!error}
			{...props}
		/>
	)
}

function FormMessage({ className, ...props }: React.ComponentProps<'p'>) {
	const { error, formMessageId } = useFormField()
	const body = error ? String(error?.message ?? '') : props.children

	if (!body) {
		return null
	}

	return (
		<p
			data-slot='form-message'
			id={formMessageId}
			className={cn(styles.formMessage, className)}
			{...props}
		>
			{body}
		</p>
	)
}

export { useFormField, Form, FormItem, FormControl, FormMessage, FormField }
