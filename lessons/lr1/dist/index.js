"use strict";
/*
 * Главный файл для демонстрации TypeScript концепций
 * Запуск: npm run build && npm start
 */
Object.defineProperty(exports, "__esModule", { value: true });
console.log('🚀 TypeScript Lab 1');
console.log('============================================\n');
// базовые типы
function demonstrateBasicTypes() {
    console.log('📝 Базовые типы:');
    const name = "TypeScript";
    const version = 5.0;
    const isAwesome = true;
    console.log(`Язык: ${name}, версия: ${version}, крутой: ${isAwesome}\n`);
}
function demonstrateInterfaces() {
    console.log('🏗️ Интерфейсы:');
    const user = {
        id: 1,
        name: "Анна Петрова",
        email: "anna@example.com",
        isActive: true
    };
    console.log('Пользователь:', user);
    console.log('');
}
// generic функции
function identity(arg) {
    return arg;
}
function demonstrateGenerics() {
    console.log('🎭 Generics:');
    const stringResult = identity("Hello TypeScript!");
    const numberResult = identity(42);
    console.log('String result:', stringResult);
    console.log('Number result:', numberResult);
    console.log('');
}
function handleStatus(status) {
    switch (status) {
        case "loading":
            return "⏳ Загрузка...";
        case "success":
            return "✅ Успешно!";
        case "error":
            return "❌ Ошибка!";
        default:
            // TypeScript проверит что все варианты обработаны
            const _exhaustive = status;
            return _exhaustive;
    }
}
function demonstrateUnionTypes() {
    console.log('🔀 Union типы:');
    const statuses = ["loading", "success", "error"];
    statuses.forEach(status => {
        console.log(`${status}: ${handleStatus(status)}`);
    });
    console.log('');
}
function main() {
    demonstrateBasicTypes();
    demonstrateInterfaces();
    demonstrateGenerics();
    demonstrateUnionTypes();
    console.log('📁 Откройте файлы task1-refactor.js - task6-type-problems.js');
    console.log('📖 Следуйте инструкциям в каждом файле');
    console.log('🔧 Используйте команды: npm run dev, npm run build, npm run type-check');
}
main();
//# sourceMappingURL=index.js.map