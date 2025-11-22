interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

interface FormField {
  name: string;
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  validators: ValidationRule[];
  errorElement: HTMLElement | null;
}

type FormData = Record<string, string>;

function getElementById<T extends HTMLElement = HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Элемент с ID "${id}" не найден`);
  }
  return element as T;
}

function isInputElement(element: HTMLElement): element is HTMLInputElement {
  return element.tagName === "INPUT" || element.tagName === "TEXTAREA";
}

function getInputElement(id: string): HTMLInputElement {
  const element = getElementById(id);
  if (!isInputElement(element)) {
    throw new Error(
      `Элемент "${id}" должен быть input/textarea, но это ${element.tagName}`
    );
  }
  return element;
}

class FormManager {
  private form: HTMLFormElement;
  private fields = new Map<string, FormField>();
  private errors = new Map<string, string>();

  constructor(formId: string) {
    this.form = getElementById<HTMLFormElement>(formId);
    this.setupEventListeners();
  }

  addField(
    fieldName: string,
    fieldId: string,
    validators: ValidationRule[] = []
  ): this {
    const element = getInputElement(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);

    const field: FormField = {
      name: fieldName,
      element,
      validators,
      errorElement,
    };

    this.fields.set(fieldName, field);
    element.addEventListener("input", (e: Event) => {
      const target = e.target as HTMLInputElement;
      this.validateField(fieldName, target.value);
    });

    element.addEventListener("blur", (e: Event) => {
      const target = e.target as HTMLInputElement;
      this.validateField(fieldName, target.value);
    });

    return this;
  }

  private setupEventListeners(): void {
    this.form.addEventListener("submit", (event: SubmitEvent) => {
      event.preventDefault();
      this.handleSubmit();
    });

    const resetButton = this.form.querySelector('button[type="reset"]');
    if (resetButton) {
      resetButton.addEventListener("click", () => this.handleReset());
    }
  }

  private validateField(fieldName: string, value: string): boolean {
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
    field.element.classList.add("error");

    if (field.errorElement) {
      field.errorElement.textContent = message;
      field.errorElement.style.display = "block";
    }
  }

  private clearFieldError(fieldName: string): void {
    const field = this.fields.get(fieldName);
    if (!field) return;

    this.errors.delete(fieldName);
    field.element.classList.remove("error");

    if (field.errorElement) {
      field.errorElement.textContent = "";
      field.errorElement.style.display = "none";
    }
  }

  private getFormData(): FormData {
    const data: FormData = {};

    this.fields.forEach((field, fieldName) => {
      const el = field.element;

      const isCheckbox = el.type === "checkbox" && "checked" in el;
      const isRadio = el.type === "radio" && "checked" in el;

      if (isCheckbox) {
        data[fieldName] = (el as HTMLInputElement).checked ? "true" : "false";
      } else if (isRadio) {
        const checked = this.form.querySelector<HTMLInputElement>(
          `input[name="${el.name}"]:checked`
        );
        data[fieldName] = checked?.value ?? "";
      } else {
        data[fieldName] = el.value;
      }
    });

    return data;
  }

  private handleSubmit(): void {
    console.log("Отправка формы...");

    let isValid = true;
    this.fields.forEach((field, fieldName) => {
      const value = field.element.value;
      if (!this.validateField(fieldName, value)) {
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

  private handleReset(): void {
    console.log("Сброс формы...");
    this.fields.forEach((_, fieldName) => this.clearFieldError(fieldName));
    this.errors.clear();
  }

  onSubmitSuccess(formData: FormData): void {
    console.log("Форма отправлена успешно:", formData);
    alert("Форма отправлена успешно!");
  }

  onSubmitError(): void {
    console.log("Ошибки в форме");
    alert("Пожалуйста, исправьте ошибки в форме");
  }
}

const Validators = {
  required: (message = "Поле обязательно для заполнения"): ValidationRule => ({
    validate: (value: string) => value.trim().length > 0,
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value: string) => value.length >= min,
    message: message ?? `Минимальная длина: ${min} символов`,
  }),

  email: (message = "Введите корректный email"): ValidationRule => ({
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  phone: (message = "Введите корректный номер телефона"): ValidationRule => ({
    validate: (value: string) => /^\+?[\d\s\-\(\)]{10,}$/.test(value),
    message,
  }),
};

function addClickListener(
  elementId: string,
  handler: (event: MouseEvent) => void
): HTMLElement {
  const el = getElementById(elementId);
  el.addEventListener("click", handler);
  return el;
}

function addKeyboardListener(
  elementId: string,
  handler: (event: KeyboardEvent) => void,
  key?: string
): HTMLElement {
  const el = getElementById(elementId);
  el.addEventListener("keydown", (e: KeyboardEvent) => {
    if (!key || e.code === key || e.key === key) {
      handler(e);
    }
  });
  return el;
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
    Object.entries(options.attributes).forEach(([k, v]) =>
      el.setAttribute(k, v)
    );
  }

  if (options.styles) {
    Object.assign(el.style, options.styles);
  }

  if (options.parent) {
    options.parent.appendChild(el);
  }

  return el;
}

function demonstrateEventHandling() {
  console.log("=== Типы событий в TypeScript ===");
  const events = {
    click: "MouseEvent",
    keydown: "KeyboardEvent",
    input: "Event | InputEvent",
    change: "Event",
    submit: "SubmitEvent",
    focus: "FocusEvent",
    resize: "UIEvent",
  };

  Object.entries(events).forEach(([name, type]) => {
    console.log(`${name} → ${type}`);
  });
}

function initializeForm() {
  console.log("FormManager готов к использованию!");
  console.log("Пример инициализации (раскомментируйте в реальном проекте):");

  // Пример использования (в реальном HTML):
  /*
    const form = new FormManager('registration-form');

    form
        .addField('name', 'name', [
            Validators.required(),
            Validators.minLength(2)
        ])
        .addField('email', 'email', [
            Validators.required(),
            Validators.email()
        ])
        .addField('phone', 'phone', [
            Validators.required(),
            Validators.phone()
        ]);

    form.onSubmitSuccess = (data) => {
        console.log('Регистрация:', data);
        // fetch('/api/register', { method: 'POST', body: JSON.stringify(data) })
    };
    */
}

demonstrateEventHandling();
initializeForm();
