/*
 * Главный файл для демонстрации TypeScript концепций
 * Запуск: npm run build && npm start
 */
/*
 * Главный файл для демонстрации TypeScript концепций
 * Запуск: npm run build && npm start
 */
console.log('🚀 TypeScript Lab 1');
console.log('============================================\n');
// базовые типы
function demonstrateBasicTypes() {
    console.log('📝 Базовые типы:');
    var name = "TypeScript";
    var version = 5.0;
    var isAwesome = true;
    console.log("\u042F\u0437\u044B\u043A: ".concat(name, ", \u0432\u0435\u0440\u0441\u0438\u044F: ").concat(version, ", \u043A\u0440\u0443\u0442\u043E\u0439: ").concat(isAwesome, "\n"));
}
function demonstrateInterfaces() {
    console.log('🏗️ Интерфейсы:');
    var user = {
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
    var stringResult = identity("Hello TypeScript!");
    var numberResult = identity(42);
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
            var _exhaustive = status;
            return _exhaustive;
    }
}
function demonstrateUnionTypes() {
    console.log('🔀 Union типы:');
    var statuses = ["loading", "success", "error"];
    statuses.forEach(function (status) {
        console.log("".concat(status, ": ").concat(handleStatus(status)));
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
