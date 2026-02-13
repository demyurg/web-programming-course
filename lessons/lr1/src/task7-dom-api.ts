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

// Интерфейсы для формы и валидаторов
interface ValidationRule {
    validate: (value: string) => boolean;
    message: string;
}

interface FormField {
    name: string;
    element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    validators: ValidationRule[];
    errorElement?: HTMLElement;
}

interface FormData {
    [fieldName: string]: string;
}

interface CreateElementOptions {
    id?: string;
    className?: string;
    textContent?: string;
    innerHTML?: string;
    attributes?: Record<string, string>;
    styles?: Partial<CSSStyleDeclaration>;
    parent?: HTMLElement;
}

// Type Guards
function isInputElement(el: Element | null): el is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
    return !!el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

// Утилиты для безопасного получения элементов 
function getElementById<T extends HTMLElement = HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Элемент с ID "${id}" не найден`);
    return element as T;
}

function getElementByIdAsType<T extends HTMLElement>(id: string, expectedTag: string): T {
    const element = getElementById<HTMLElement>(id);
    if (element.tagName.toLowerCase() !== expectedTag.toLowerCase()) {
        throw new Error(`Элемент "${id}" должен быть <${expectedTag}>, но это <${element.tagName.toLowerCase()}>`);
    }
    return element as T;
}

// Класс FormManager
class FormManager {
    private form: HTMLFormElement;
    private fields: Map<string, FormField> = new Map();
    private errors: Map<string, string> = new Map();

    constructor(formId: string) {
        this.form = getElementByIdAsType<HTMLFormElement>(formId, 'form');
        this.setupEventListeners();
    }

    addField(fieldName: string, fieldId: string, validators: ValidationRule[] = []): this {
        const element = getElementById<HTMLElement>(fieldId);
        if (!isInputElement(element)) throw new Error(`Элемент "${fieldId}" не является полем ввода`);

        const errorElement = document.getElementById(`${fieldId}-error`);
        const field: FormField = { name: fieldName, element, validators};
        this.fields.set(fieldName, field);

        element.addEventListener('input', (event) => {
            const target = event.target as HTMLInputElement;
            this.validateField(fieldName, target.value);
        });
        element.addEventListener('blur', (event) => {
            const target = event.target as HTMLInputElement;
            this.validateField(fieldName, target.value);
        });

        return this;
    }

    private setupEventListeners(): void {
        this.form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.handleSubmit(event);
        });

        const resetButton = this.form.querySelector<HTMLButtonElement>('button[type="reset"]');
        if (resetButton) {
            resetButton.addEventListener('click', (event) => this.handleReset(event));
        }
    }

    validateField(fieldName: string, value: string): boolean {
        const field = this.fields.get(fieldName);
        if (!field) return true;

        this.clearFieldError(fieldName);
        for (const validator of field.validators) {
            if (!validator.validate(value)) {
                this.setFieldError(fieldName, validator.message);
                return false;
            }
        }

        return true;
    }

    private setFieldError(fieldName: string, message: string): void {
        const field = this.fields.get(fieldName);
        if (!field) return;

        this.errors.set(fieldName, message);
        field.element.classList.add('error');

        if (field.errorElement) {
            field.errorElement.textContent = message;
            field.errorElement.style.display = 'block';
        }
    }

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

    getFormData(): FormData {
        const formData: FormData = {};
        this.fields.forEach((field, name) => {
            if (field.element instanceof HTMLInputElement && field.element.type === 'checkbox') {
                formData[name] = field.element.checked.toString();
            } else if (field.element instanceof HTMLInputElement && field.element.type === 'radio') {
                const checked = this.form.querySelector<HTMLInputElement>(`input[name="${field.element.name}"]:checked`);
                formData[name] = checked ? checked.value : '';
            } else {
                formData[name] = (field.element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
            }
        });
        return formData;
    }

    private getFieldValue(fieldName: string): string {
        const field = this.fields.get(fieldName);
        if (!field) return '';
        return (field.element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
    }

    private handleSubmit(_event: Event): void {
        let isValid = true;
        this.fields.forEach((_field, fieldName) => {
            if (!this.validateField(fieldName, this.getFieldValue(fieldName))) {
                isValid = false;
            }
        });

        if (isValid) this.onSubmitSuccess(this.getFormData());
        else this.onSubmitError();
    }

    private handleReset(_event: Event): void {
        this.fields.forEach((_field, fieldName) => this.clearFieldError(fieldName));
        this.errors.clear();
    }

    protected onSubmitSuccess(formData: FormData): void {
        console.log('✅ Форма отправлена успешно:', formData);
        alert('Форма отправлена успешно!');
    }

    protected onSubmitError(): void {
        console.log('❌ Ошибки в форме');
        alert('Пожалуйста, исправьте ошибки в форме');
    }
}

// Фабрика валидаторов
const Validators = {
    required: (message?: string): ValidationRule => ({
        validate: (value) => value.trim().length > 0,
        message: message || 'Поле обязательно для заполнения',
    }),
    minLength: (min: number, message?: string): ValidationRule => ({
        validate: (value) => value.length >= min,
        message: message || `Минимальная длина: ${min} символов`,
    }),
    email: (message?: string): ValidationRule => ({
        validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: message || 'Введите корректный email',
    }),
    phone: (message?: string): ValidationRule => ({
        validate: (value) => /^\+?[\d\s\-\(\)]{10,}$/.test(value),
        message: message || 'Введите корректный номер телефона',
    }),
};

// Утилиты для DOM событий
function addClickListener(id: string, handler: (event: MouseEvent) => void): HTMLElement {
    const el = getElementById<HTMLElement>(id);
    el.addEventListener('click', handler);
    return el;
}

function addKeyboardListener(id: string, handler: (event: KeyboardEvent) => void, keyCode?: string): HTMLElement {
    const el = getElementById<HTMLElement>(id);
    el.addEventListener('keydown', (event) => {
        if (!keyCode || event.code === keyCode) handler(event);
    });
    return el;
}

// Утилита для создания элементов
function createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    options: CreateElementOptions = {}
): HTMLElementTagNameMap[K] {
    const el = document.createElement(tagName);

    if (options.id) el.id = options.id;
    if (options.className) el.className = options.className;
    if (options.textContent) el.textContent = options.textContent;
    if (options.innerHTML) el.innerHTML = options.innerHTML;

    if (options.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => el.setAttribute(key, value));
    }
if (options.styles) {
    Object.entries(options.styles).forEach(([prop, val]) => {
        if (val != null) { 
            (el.style as any)[prop] = String(val); 
        }
    });
}
    if (options.parent) options.parent.appendChild(el);

    return el;
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