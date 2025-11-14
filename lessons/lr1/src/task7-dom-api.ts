/*
 * ЗАДАЧА 7: Работа с DOM API и обработчиками событий
 * 
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Типизируйте все функции работы с DOM
 * 3. Правильно типизируйте Event handlers
 * 4. Используйте type guards для проверки элементов
 * 5. Обработайте случаи когда элементы могут не существовать
 */

// Система управления формой с валидацией

// TODO: Создать интерфейсы:
// - FormField: name, element, validators[], errorElement?
// - ValidationRule: validate: (value: string) => boolean, message: string
// - FormData: [fieldName: string]: string

interface ValidationRule {
	validate: (value: string) => boolean
	message: string
}

type FormElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

interface FormField {
	name: string
	element: FormElement
	validators: ValidationRule[]
	errorElement?: HTMLElement | null
}

interface FormData {
	[fieldName: string]: string
}

function getElementById(id: string): HTMLElement {
	const element = document.getElementById(id)
	if (!element) {
		throw new Error(`Элемент с ID "${id}" не найден`)
	}
	return element
}

function getElementByIdAsType<T extends HTMLElement>(
	id: string,
	type: new () => T,
): T {
	const element = getElementById(id)

	if (!(element instanceof type)) {
		throw new Error(
			`Элемент "${id}" должен быть ${type.name}, но это ${element.constructor.name}`,
		)
	}

	return element
}

class FormManager {
	private form: HTMLFormElement
	private fields: Map<string, FormField>
	private errors: Map<string, string>

	constructor(formId: string) {
		this.form = getElementByIdAsType(formId, HTMLFormElement)
		this.fields = new Map()
		this.errors = new Map()

		this.setupEventListeners()
	}

	addField(
		fieldName: string,
		fieldId: string,
		validators: ValidationRule[],
	): this {
		const element = getElementById(fieldId)
		if (
			!(
				element instanceof HTMLInputElement ||
				element instanceof HTMLTextAreaElement ||
				element instanceof HTMLSelectElement
			)
		) {
			throw new Error(
				`Элемент с ID "${fieldId}" не является элементом формы (input, textarea, select).`,
			)
		}
		const errorElement = document.getElementById(`${fieldId}-error`)

		const field: FormField = {
			name: fieldName,
			element: element,
			validators: validators || [],
			errorElement: errorElement,
		}

		this.fields.set(fieldName, field)

		element.addEventListener('input', (event: Event) => {
			const target = event.target as FormElement
			this.validateField(fieldName, target.value)
		})

		element.addEventListener('blur', (event: Event) => {
			const target = event.target as FormElement
			this.validateField(fieldName, target.value)
		})

		return this
	}

	private setupEventListeners(): void {
		this.form.addEventListener('submit', (event: SubmitEvent) => {
			event.preventDefault()
			this.handleSubmit(event)
		})

		const resetButton = this.form.querySelector('button[type="reset"]')
		if (resetButton && resetButton instanceof HTMLButtonElement) {
			resetButton.addEventListener('click', (event: Event) => {
				this.handleReset(event)
			})
		}
	}

	validateField(fieldName: string, value: string): boolean {
		const field = this.fields.get(fieldName)
		if (!field) return true

		this.clearFieldError(fieldName)

		for (const validator of field.validators) {
			if (!validator.validate(value)) {
				this.setFieldError(fieldName, validator.message)
				return false
			}
		}

		return true
	}

	private setFieldError(fieldName: string, message: string): void {
		const field = this.fields.get(fieldName)
		if (!field) return

		this.errors.set(fieldName, message)

		field.element.classList.add('error')

		if (field.errorElement) {
			field.errorElement.textContent = message
			field.errorElement.style.display = 'block'
		}
	}

	private clearFieldError(fieldName: string): void {
		const field = this.fields.get(fieldName)
		if (!field) return

		this.errors.delete(fieldName)
		field.element.classList.remove('error')

		if (field.errorElement) {
			field.errorElement.textContent = ''
			field.errorElement.style.display = 'none'
		}
	}

	getFormData(): FormData {
		const formData: FormData = {}

		this.fields.forEach((field, fieldName) => {
			const element = field.element

			if (element instanceof HTMLInputElement && element.type === 'checkbox') {
				formData[fieldName] = element.checked.toString()
			} else if (
				element instanceof HTMLInputElement &&
				element.type === 'radio'
			) {
				const radioGroup = this.form.querySelectorAll<HTMLInputElement>(
					`input[name="${element.name}"]`,
				)
				const checked = Array.from(radioGroup).find(radio => radio.checked)
				formData[fieldName] = checked ? checked.value : ''
			} else {
				formData[fieldName] = element.value
			}
		})

		return formData
	}

	private handleSubmit(_event: SubmitEvent): void {
		console.log('Отправка формы...')

		let isValid = true
		this.fields.forEach((_field, fieldName) => {
			const fieldValue = this.getFieldValue(fieldName)
			if (!this.validateField(fieldName, fieldValue)) {
				isValid = false
			}
		})

		if (isValid) {
			const formData = this.getFormData()
			this.onSubmitSuccess(formData)
		} else {
			this.onSubmitError()
		}
	}

	private getFieldValue(fieldName: string): string {
		const field = this.fields.get(fieldName)
		if (!field) return ''

		return field.element.value
	}

	private handleReset(_event: Event): void {
		console.log('Сброс формы...')

		// Очищаем все ошибки
		this.fields.forEach((_field, fieldName) => {
			this.clearFieldError(fieldName)
		})

		this.errors.clear()
	}

	onSubmitSuccess(formData: FormData): void {
		console.log('✅ Форма отправлена успешно:', formData)
		alert('Форма отправлена успешно!')
	}

	onSubmitError(): void {
		console.log('❌ Ошибки в форме')
		alert('Пожалуйста, исправьте ошибки в форме')
	}
}

const Validators = {
	required: (message?: string): ValidationRule => ({
		validate: value => value.trim().length > 0,
		message: message || 'Поле обязательно для заполнения',
	}),

	minLength: (minLen: number, message?: string): ValidationRule => ({
		validate: value => value.length >= minLen,
		message: message || `Минимальная длина: ${minLen} символов`,
	}),

	email: (message?: string): ValidationRule => ({
		validate: value => {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
			return emailRegex.test(value)
		},
		message: message || 'Введите корректный email',
	}),

	phone: (message?: string): ValidationRule => ({
		validate: value => {
			const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
			return phoneRegex.test(value)
		},
		message: message || 'Введите корректный номер телефона',
	}),
}

function addClickListener(
	elementId: string,
	handler: (event: MouseEvent) => void,
): HTMLElement {
	const element = getElementById(elementId)
	element.addEventListener('click', handler)
	return element
}

function addKeyboardListener(
	elementId: string,
	handler: (event: KeyboardEvent) => void,
	keyCode?: string,
): HTMLElement {
	const element = getElementById(elementId)

	element.addEventListener('keydown', (event: KeyboardEvent) => {
		if (!keyCode || event.code === keyCode) {
			handler(event)
		}
	})

	return element
}

interface ElementOptions {
	id?: string
	className?: string
	textContent?: string
	innerHTML?: string
	attributes?: { [key: string]: string }
	styles?: Partial<CSSStyleDeclaration>
	parent?: HTMLElement
}

function createElement<K extends keyof HTMLElementTagNameMap>(
	tagName: K,
	options: ElementOptions = {},
): HTMLElementTagNameMap[K] {
	const element = document.createElement(tagName)

	if (options.id) element.id = options.id
	if (options.className) element.className = options.className
	if (options.textContent) element.textContent = options.textContent
	if (options.innerHTML) element.innerHTML = options.innerHTML

	if (options.attributes) {
		Object.entries(options.attributes).forEach(([key, value]) => {
			element.setAttribute(key, value)
		})
	}

	if (options.styles) {
		Object.entries(options.styles).forEach(([property, value]) => {
			;(element.style as any)[property as keyof CSSStyleDeclaration] = value
		})
	}

	if (options.parent) {
		options.parent.appendChild(element)
	}

	return element
}

function initializeForm() {
	const formHTML = `
        <form id="registration-form">
            <div>
                <label for="name">Имя:</label>
                <input type="text" id="name" name="name" />
                <div id="name-error" class="error-message"></div>
            </div>
            
            <div>
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" />
                <div id="email-error" class="error-message"></div>
            </div>
            
            <div>
                <label for="phone">Телефон:</label>
                <input type="tel" id="phone" name="phone" />
                <div id="phone-error" class="error-message"></div>
            </div>
            
            <button type="submit">Отправить</button>
            <button type="reset">Сбросить</button>
        </form>
    `

	// В реальном приложении эта форма уже есть в HTML
	console.log('HTML для формы:', formHTML)

	// Пример инициализации (раскомментируйте если есть реальная форма в DOM)
	/*
    const formManager = new FormManager('registration-form');
    
    formManager
        .addField('name', 'name', [
            Validators.required(),
            Validators.minLength(2, 'Имя должно содержать минимум 2 символа')
        ])
        .addField('email', 'email', [
            Validators.required(),
            Validators.email()
        ])
        .addField('phone', 'phone', [
            Validators.required(),
            Validators.phone()
        ]);
    
    // Переопределяем обработчик успешной отправки
    formManager.onSubmitSuccess = (formData) => {
        console.log('Регистрация пользователя:', formData);
        // Здесь отправка на сервер
    };
    */
}

function demonstrateEventHandling() {
	console.log('=== Демонстрация типизации событий ===')

	const eventExamples = {
		click: 'MouseEvent',
		keydown: 'KeyboardEvent',
		input: 'InputEvent',
		change: 'Event',
		submit: 'SubmitEvent',
		resize: 'UIEvent',
		scroll: 'Event',
	}

	Object.entries(eventExamples).forEach(([eventType, eventInterface]) => {
		console.log(`${eventType} -> ${eventInterface}`)
	})
}

demonstrateEventHandling()
initializeForm()