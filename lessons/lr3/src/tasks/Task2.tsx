import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "small" | "medium";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
}

function Button({
  variant = "primary",
  size = "medium",
  className = "",
  children,
  ...props
}: ButtonProps) {
  // Базовые классы
  const baseClasses =
    "rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  // Классы для вариантов
  const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500",
    secondary: "bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500",
  };

  // Классы для размеров
  const sizeClasses: Record<ButtonSize, string> = {
    small: "px-3 py-1 text-sm",
    medium: "px-4 py-2 text-base",
  };

  const buttonClasses =
    `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
}

function Task2() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Задание 2: Кнопки с вариантами
        </h2>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-10">
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-gray-700">
              Варианты кнопок
            </h3>
            <div className="flex flex-wrap gap-6">
              <Button variant="primary">Primary кнопка</Button>
              <Button variant="secondary">Secondary кнопка</Button>
              <Button variant="primary" disabled>
                Disabled Primary
              </Button>
              <Button variant="secondary" disabled>
                Disabled Secondary
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-6 text-gray-700">
              Размеры кнопок
            </h3>
            <div className="flex flex-wrap items-end gap-6">
              <Button size="small" variant="primary">
                Small кнопка
              </Button>
              <Button size="medium" variant="primary">
                Medium кнопка (по умолчанию)
              </Button>
              <Button size="small" variant="secondary">
                Small Secondary
              </Button>
              <Button size="medium" variant="secondary">
                Medium Secondary
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-6 text-gray-700">
              Комбинации
            </h3>
            <div className="flex flex-wrap gap-6">
              <Button size="small" variant="primary">
                Маленькая Primary
              </Button>
              <Button size="small" variant="secondary">
                Маленькая Secondary
              </Button>
              <Button size="medium" variant="primary">
                Большая Primary
              </Button>
              <Button size="medium" variant="secondary">
                Большая Secondary
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Task2;
