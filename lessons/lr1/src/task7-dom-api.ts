/*Курочкин ПИЭ-21
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

// Утилита для безопасного получения элемента
interface ValidationRule {
    validate: (value: string) => boolean;
    message: string;
}

interface FormField {
    name: string;
    element: HTMLInputElement;
    validators: ValidationRule[];
    errorElement?: HTMLElement| undefined;
}

type FormData = { [key: string]: string };
function isHTMLElement(element: unknown): element is HTMLElement {
    return element instanceof HTMLElement;
}

function isHTMLInputElement(element: unknown): element is HTMLInputElement {
    return element instanceof HTMLInputElement;
}

function isHTMLFormElement(element: unknown): element is HTMLFormElement {
    return element instanceof HTMLFormElement;
}


function getElementById(id: string): HTMLElement | null {
    const element = document.getElementById(id);
    return isHTMLElement(element) ? element : null;
}

function getElementByIdAsType(id: string, expectedType: string): HTMLElement | null {
    const element = getElementById(id);
    if (!element || element.tagName.toLowerCase() !== expectedType.toLowerCase()) {
        return null;
    }
    return element;
}

// Класс для управления формой
class FormManager {
    private form: HTMLFormElement | null = null;
    private fields: Map<string, FormField> = new Map();
    private errors: Map<string, string> = new Map();

    constructor(formId: string) {
        const formElement = getElementByIdAsType(formId, 'form');
        if (!isHTMLFormElement(formElement)) {
            throw new Error(`Элемент с ID "${formId}" не является формой или не найден`);
        }
        this.form = formElement;
        this.setupEventListeners();
    }
    
    // Добавление поля с валидацией
    addField(fieldName: string, fieldId: string, validators: ValidationRule[] = []): this {
        const element = getElementById(fieldId);
        const errorElement = getElementById(`${fieldId}-error`);

        if (!isHTMLInputElement(element)) {
            console.warn(`Элемент с ID "${fieldId}" не является input или не найден`);
            return this;
        }

        if (!isHTMLElement(errorElement)) {
            console.warn(`Элемент ошибки для "${fieldId}" не найден`);
        }

        const field: FormField = {
            name: fieldName,
            element,
            validators,
            errorElement: isHTMLElement(errorElement) ? errorElement : undefined
        };

        this.fields.set(fieldName, field);
        // Добавляем обработчики событий для поля
        element.addEventListener('input', (event: Event) => {
            const target = event.target;
            if (isHTMLInputElement(target)) {
                this.validateField(fieldName, target.value);
            }
        });

        element.addEventListener('blur', (event: Event) => {
            const target = event.target;
            if (isHTMLInputElement(target)) {
                this.validateField(fieldName, target.value);
            }
        });

        return this;
    }
    
    // Настройка основных обработчиков событий
    private setupEventListeners(): void {
        if (!this.form) return;

        this.form.addEventListener('submit', (event: SubmitEvent) => {
            event.preventDefault();
            this.handleSubmit(event);
        });

        // Обработчик для кнопки сброса
        const resetButton = this.form.querySelector('button[type="reset"]');
        if (isHTMLElement(resetButton)) {
            resetButton.addEventListener('click', (event: MouseEvent) => {
                this.handleReset(event);
            });
        }
    }
    
    // Валидация отдельного поля
   validateField(fieldName: string, value: string): boolean {
        const field = this.fields.get(fieldName);
        if (!field) return true;

        // Очищаем предыдущие ошибки
        this.clearFieldError(fieldName);

        // Проверяем все валидаторы
        for (const validator of field.validators) {
            if (!validator.validate(value)) {
                this.setFieldError(fieldName, validator.message);
                return false;
            }
        }

        return true;
    }
    
    // Установка ошибки для поля
    private setFieldError(fieldName: string, message: string): void {
        const field = this.fields.get(fieldName);
        if (!field) return;

        this.errors.set(fieldName, message);

        // Добавляем CSS класс ошибки
        field.element.classList.add('error');

        // Показываем сообщение об ошибке
        if (field.errorElement) {
            field.errorElement.textContent = message;
            field.errorElement.style.display = 'block';
        }
    }
    
    // Очистка ошибки для поля
   private clearFieldError(fieldName: string): void {
        const field = this.fields.get(fieldName);
        if (!field) return;

        this.errors.delete(fieldName);
        field.element.classList.remove('error');

        if (field.errorElement) {
            field.errorElement.textContent = '';
            field.errorElement.style.display = 'none';
        }
    }
    
    // Получение данных формы
   getFormData(): FormData {
        const formData: FormData = {};

        this.fields.forEach((field, fieldName) => {
            const element = field.element;

            if (element.type === 'checkbox') {
                formData[fieldName] = element.checked.toString();
            } else if (element.type === 'radio') {
                const radioGroup = this.form?.querySelectorAll(`input[name="${element.name}"]`);
                const checked = radioGroup ? Array.from(radioGroup).find((radio): radio is HTMLInputElement => isHTMLInputElement(radio) && radio.checked) : null;
                formData[fieldName] = checked ? checked.value : '';
            } else {
                formData[fieldName] = element.value;
            }
        });

        return formData;
    }
    
    // Обработка отправки формы
   private handleSubmit(event: SubmitEvent): void {
        if (!this.form) return;

        console.log('Отправка формы...');

        // Валидируем все поля
        let isValid = true;
        this.fields.forEach((field, fieldName) => {
            const fieldValue = this.getFieldValue(fieldName);
            if (!this.validateField(fieldName, fieldValue)) {
                isValid = false;
            }
        });

        if (isValid) {
            const formData = this.getFormData();
            this.onSubmitSuccess(formData);
        } else {
            this.onSubmitError();
        }
    }
    
    // Получение значения поля
   private getFieldValue(fieldName: string): string {
        const field = this.fields.get(fieldName);
        if (!field) return '';

        return field.element.value;
    }
    
    // Обработка сброса формы
  private handleReset(event: MouseEvent): void {
        console.log('Сброс формы...');

        // Очищаем все ошибки
        this.fields.forEach((_field, fieldName) => {
            this.clearFieldError(fieldName);
        });

        this.errors.clear();
    }

    // Успешная отправка формы (переопределяется)
    onSubmitSuccess(formData: FormData): void {
        console.log('✅ Форма отправлена успешно:', formData);
        alert('Форма отправлена успешно!');
    }

    // Ошибка при отправке формы (переопределяется)  
    onSubmitError(): void {
        console.log('❌ Ошибки в форме');
        alert('Пожалуйста, исправьте ошибки в форме');
    }
}

// Фабрика валидаторов
const Validators = {
    required: (message?: string): ValidationRule => ({
        validate: (value: string): boolean => value.trim().length > 0,
        message: message || 'Поле обязательно для заполнения'
    }),

    minLength: (minLen: number, message?: string): ValidationRule => ({
        validate: (value: string): boolean => value.length >= minLen,
        message: message || `Минимальная длина: ${minLen} символов`
    }),

    email: (message?: string): ValidationRule => ({
        validate: (value: string): boolean => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        },
        message: message || 'Введите корректный email'
    }),

    phone: (message?: string): ValidationRule => ({
        validate: (value: string): boolean => {
            const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
            return phoneRegex.test(value);
        },
        message: message || 'Введите корректный номер телефона'
    })
};

// Утилиты для работы с DOM событиями
function addClickListener(elementId: string, handler: (event: MouseEvent) => void): HTMLElement | null {
    const element = getElementById(elementId);
    if (isHTMLElement(element)) {
        element.addEventListener('click', handler);
        return element;
    }
    console.warn(`Элемент с ID "${elementId}" не найден`);
    return null;
}

function addKeyboardListener(
    elementId: string, 
    handler: (event: KeyboardEvent) => void, 
    keyCode?: string
): HTMLElement | null {
    const element = getElementById(elementId);

    if (isHTMLElement(element)) {
        element.addEventListener('keydown', (event: KeyboardEvent) => {
            if (!keyCode || event.code === keyCode) {
                handler(event);
            }
        });
        return element;
    }

    console.warn(`Элемент с ID "${elementId}" не найден`);
    return null;
}

// Утилита для создания элементов
interface CreateElementOptions {
    id?: string;
    className?: string;
    textContent?: string;
    innerHTML?: string;
    attributes?: Record<string, string>;
    styles?: Partial<CSSStyleDeclaration>;
    parent?: HTMLElement;
}
function createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K, 
    options: CreateElementOptions = {}
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName) as HTMLElementTagNameMap[K];

    if (options.id) element.id = options.id;
    if (options.className) element.className = options.className;
    if (options.textContent) element.textContent = options.textContent;
    if (options.innerHTML) element.innerHTML = options.innerHTML;

    if (options.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }

    if (options.styles) {
        Object.entries(options.styles).forEach(([property, value]) => {
            (element.style as any)[property] = value;
        });
    }

    if (options.parent && isHTMLElement(options.parent)) {
        options.parent.appendChild(element);
    }

    return element;
}

// Пример использования (должен работать после типизации)
function initializeForm() {
    // Создаем HTML для примера (обычно уже есть в разметке)
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
    `;
    
    // В реальном приложении эта форма уже есть в HTML
    console.log('HTML для формы:', formHTML);
    
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

// Пример работы с различными типами событий
function demonstrateEventHandling() {
    console.log('=== Демонстрация типизации событий ===');
    
    // Пример типизации различных событий
    const eventExamples = {
        click: 'MouseEvent',
        keydown: 'KeyboardEvent', 
        input: 'InputEvent',
        change: 'Event',
        submit: 'SubmitEvent',
        resize: 'UIEvent',
        scroll: 'Event'
    };
    
    Object.entries(eventExamples).forEach(([eventType, eventInterface]) => {
        console.log(`${eventType} -> ${eventInterface}`);
    });
}

// Демонстрация
demonstrateEventHandling();
initializeForm();
export{}