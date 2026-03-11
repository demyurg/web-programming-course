/*
 * ЗАДАЧА 3: Работа с массивами и объектами сложной структуры
 *
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Создайте интерфейсы для всех сложных объектов
 * 3. Типизируйте все функции работы с данными
 * 4. Используйте generic типы где это уместно
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
// Создание студента
function createStudent(id, name, email) {
    return {
        id: id,
        name: name,
        email: email,
        enrolledCourses: [],
        grades: {}
    };
}
// Создание курса
function createCourse(id, title, instructor, duration, maxStudents) {
    return {
        id: id,
        title: title,
        instructor: instructor,
        duration: duration,
        maxStudents: maxStudents,
        enrolledStudents: []
    };
}
// Запись студента на курс
function enrollStudent(student, course) {
    if (course.enrolledStudents.length >= course.maxStudents) {
        return {
            success: false,
            message: 'Курс переполнен'
        };
    }
    if (student.enrolledCourses.includes(course.id)) {
        return {
            success: false,
            message: 'Студент уже записан на этот курс'
        };
    }
    student.enrolledCourses.push(course.id);
    course.enrolledStudents.push(student.id);
    return {
        success: true,
        message: 'Студент успешно записан на курс'
    };
}
// Выставление оценки
function assignGrade(student, courseId, score) {
    if (!student.enrolledCourses.includes(courseId)) {
        return {
            success: false,
            message: 'Студент не записан на этот курс'
        };
    }
    if (score < 0 || score > 100) {
        return {
            success: false,
            message: 'Оценка должна быть от 0 до 100'
        };
    }
    if (!student.grades[courseId]) {
        student.grades[courseId] = [];
    }
    student.grades[courseId].push({
        score: score,
        date: new Date()
    });
    return {
        success: true,
        message: 'Оценка выставлена'
    };
}
// Расчет средней оценки студента
function calculateStudentAverage(student, courseId) {
    var grades = student.grades[courseId];
    if (!grades || grades.length === 0) {
        return null;
    }
    var sum = grades.reduce(function (acc, grade) { return acc + grade.score; }, 0);
    return Math.round((sum / grades.length) * 100) / 100;
}
// Получение статистики по курсу
function getCourseStats(course, students) {
    var enrolledStudents = students.filter(function (student) {
        return student.enrolledCourses.includes(course.id);
    });
    var allGrades = enrolledStudents
        .map(function (student) { return student.grades[course.id] || []; })
        .flat()
        .map(function (grade) { return grade.score; });
    var averageGrade = allGrades.length > 0
        ? allGrades.reduce(function (sum, score) { return sum + score; }, 0) / allGrades.length
        : 0;
    var studentsWithGrades = enrolledStudents.filter(function (student) {
        return student.grades[course.id] && student.grades[course.id].length > 0;
    }).length;
    var completionRate = enrolledStudents.length > 0
        ? (studentsWithGrades / enrolledStudents.length) * 100
        : 0;
    return {
        courseId: course.id,
        totalStudents: enrolledStudents.length,
        averageGrade: Math.round(averageGrade * 100) / 100,
        completionRate: Math.round(completionRate * 100) / 100
    };
}
// Поиск лучших студентов
function getTopStudents(students, courseId, limit) {
    return students
        .map(function (student) { return (__assign(__assign({}, student), { average: calculateStudentAverage(student, courseId) })); })
        .filter(function (student) { return student.average !== null; })
        .sort(function (a, b) { return b.average - a.average; })
        .slice(0, limit);
}
// Примеры использования
var students = [
    createStudent(1, 'Анна Иванова', 'anna@example.com'),
    createStudent(2, 'Петр Петров', 'peter@example.com'),
    createStudent(3, 'Мария Сидорова', 'maria@example.com')
];
var courses = [
    createCourse(101, 'JavaScript Основы', 'Иван Учителев', 40, 20),
    createCourse(102, 'React Advanced', 'Мария Преподователь', 60, 15)
];
// Записываем студентов на курсы
enrollStudent(students[0], courses[0]);
enrollStudent(students[1], courses[0]);
enrollStudent(students[0], courses[1]);
// Выставляем оценки
assignGrade(students[0], 101, 95);
assignGrade(students[0], 101, 87);
assignGrade(students[1], 101, 78);
console.log('Средняя оценка Анны по JS:', calculateStudentAverage(students[0], 101));
console.log('Статистика курса JS:', getCourseStats(courses[0], students));
console.log('Лучшие студенты по JS:', getTopStudents(students, 101, 2));
