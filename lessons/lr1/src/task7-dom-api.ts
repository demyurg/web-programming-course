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

// Создаем интерфейсы для типизации
interface ValidationRule {
    validate: (value: string) => boolean;
    message: string;
}

interface FormField {
    name: string;
    element: HTMLElement;
    validators: ValidationRule[];
    errorElement?: HTMLElement | null;
}

interface FormDataType {
    [fieldName: string]: string;
}

// Утилита для безопасного получения элемента
function getElementById(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Элемент с ID "${id}" не найден`);
    }
    return element;
}

// Утилита для получения элемента определенного типа
function getElementByIdAsType<T extends HTMLElement>(id: string, expectedType: string): T {
    const element = getElementById(id);
    
    if (element.tagName.toLowerCase() !== expectedType.toLowerCase()) {
        throw new Error(`Элемент "${id}" должен быть ${expectedType}, но это ${element.tagName}`);
    }
    
    return element as T;
}

// Класс для управления формой
class FormManager {
    public form: HTMLFormElement;
    public fields: Map<string, FormField>;
    public errors: Map<string, string>;

    constructor(formId: string) {
        this.form = getElementByIdAsType<HTMLFormElement>(formId, 'form');
        this.fields = new Map<string, FormField>();
        this.errors = new Map<string, string>();
        
        this.setupEventListeners();
    }
    
    // Добавление поля с валидацией
    addField(fieldName: string, fieldId: string, validators?: ValidationRule[]): FormManager {
        const element = getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);
        
        const field: FormField = {
            name: fieldName,
            element: element,
            validators: validators || [],
            errorElement: errorElement
        };
        
        this.fields.set(fieldName, field);
        
        // Добавляем обработчики событий для поля
        element.addEventListener('input', (event: Event) => {
            const target = event.target as HTMLInputElement;
            this.validateField(fieldName, target.value);
        });
        
        element.addEventListener('blur', (event: Event) => {
            const target = event.target as HTMLInputElement;
            this.validateField(fieldName, target.value);
        });
        
        return this;
    }
    
    // Настройка основных обработчиков событий
    setupEventListeners(): void {
        this.form.addEventListener('submit', (event: Event) => {
            event.preventDefault();
            this.handleSubmit(event);
        });
        
        // Обработчик для кнопки сброса
        const resetButton = this.form.querySelector('button[type="reset"]');
        if (resetButton) {
            resetButton.addEventListener('click', (event: Event) => {
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
    setFieldError(fieldName: string, message: string): void {
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
    clearFieldError(fieldName: string): void {
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
    getFormData(): FormDataType {
        const formData: FormDataType = {};
        
        this.fields.forEach((field: FormField, fieldName: string) => {
            const element = field.element as HTMLInputElement;
            
            if (element.type === 'checkbox') {
                formData[fieldName] = element.checked.toString();
            } else if (element.type === 'radio') {
                const radioGroup = this.form.querySelectorAll(`input[name="${element.name}"]`);
                const checked = Array.from(radioGroup).find(radio => (radio as HTMLInputElement).checked) as HTMLInputElement;
                formData[fieldName] = checked ? checked.value : '';
            } else {
                formData[fieldName] = element.value;
            }
        });
        
        return formData;
    }
    
    // Обработка отправки формы
    handleSubmit(_event: Event): void {
        console.log('Отправка формы...');
        
        // Валидируем все поля
        let isValid = true;
        this.fields.forEach((_field: FormField, fieldName: string) => {
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
    getFieldValue(fieldName: string): string {
        const field = this.fields.get(fieldName);
        if (!field) return '';
        
        return (field.element as HTMLInputElement).value;
    }
    
    // Обработка сброса формы
    handleReset(_event: Event): void {
        console.log('Сброс формы...');
        
        // Очищаем все ошибки
        this.fields.forEach((_field: FormField, fieldName: string) => {
            this.clearFieldError(fieldName);
        });
        
        this.errors.clear();
    }
    
    // Успешная отправка формы (переопределяется)
    onSubmitSuccess(formData: FormDataType): void {
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
        validate: (value: string) => value.trim().length > 0,
        message: message || 'Поле обязательно для заполнения'
    }),
    
    minLength: (minLen: number, message?: string): ValidationRule => ({
        validate: (value: string) => value.length >= minLen,
        message: message || `Минимальная длина: ${minLen} символов`
    }),
    
    email: (message?: string): ValidationRule => ({
        validate: (value: string) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        },
        message: message || 'Введите корректный email'
    }),
    
    phone: (message?: string): ValidationRule => ({
        validate: (value: string) => {
            const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
            return phoneRegex.test(value);
        },
        message: message || 'Введите корректный номер телефона'
    })
};

// Утилиты для работы с DOM событиями
function addClickListener(elementId: string, handler: (event: MouseEvent) => void): HTMLElement {
    const element = getElementById(elementId);
    element.addEventListener('click', handler);
    return element;
}

function addKeyboardListener(elementId: string, handler: (event: KeyboardEvent) => void, keyCode?: string): HTMLElement {
    const element = getElementById(elementId);
    
    element.addEventListener('keydown', (event: KeyboardEvent) => {
        if (!keyCode || event.code === keyCode) {
            handler(event);
        }
    });
    
    return element;
}

// Интерфейс для опций создания элемента
interface CreateElementOptions {
    id?: string;
    className?: string;
    textContent?: string;
    innerHTML?: string;
    attributes?: Record<string, string>;
    styles?: Record<string, string>;
    parent?: HTMLElement;
}

// Утилита для создания элементов
function createElement<T extends HTMLElement>(tagName: string, options: CreateElementOptions = {}): T {
    const element = document.createElement(tagName) as T;
    
    if (options.id) element.id = options.id;
    if (options.className) element.className = options.className;
    if (options.textContent) element.textContent = options.textContent;
    if (options.innerHTML) element.innerHTML = options.innerHTML;
    
    if (options.attributes) {
        Object.entries(options.attributes).forEach(([key, value]: [string, string]) => {
            element.setAttribute(key, value);
        });
    }
    
    if (options.styles) {
        Object.entries(options.styles).forEach(([property, value]: [string, string]) => {
            (element.style as any)[property] = value;
        });
    }
    
    if (options.parent) {
        options.parent.appendChild(element);
    }
    
    return element;
}

// Пример использования (должен работать после типизации)
function initializeForm(): void {
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
function demonstrateEventHandling(): void {
    console.log('=== Демонстрация типизации событий ===');
    
    // Пример типизации различных событий
    const eventExamples: Record<string, string> = {
        click: 'MouseEvent',
        keydown: 'KeyboardEvent', 
        input: 'InputEvent',
        change: 'Event',
        submit: 'SubmitEvent',
        resize: 'UIEvent',
        scroll: 'Event'
    };
    
    Object.entries(eventExamples).forEach(([eventType, eventInterface]: [string, string]) => {
        console.log(`${eventType} -> ${eventInterface}`);
    });
}

// Демонстрация
demonstrateEventHandling();
initializeForm();

export{}