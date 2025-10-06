"use strict";
/*
 * ЗАДАЧА 3: Работа с массивами и объектами сложной структуры
 *
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Создайте интерфейсы для всех сложных объектов
 * 3. Типизируйте все функции работы с данными
 * 4. Используйте generic типы где это уместно
 */
Object.defineProperty(exports, "__esModule", { value: true });
function createStudent(id, name, email) {
    return {
        id,
        name,
        email,
        enrolledCourses: [],
        grades: {},
    };
}
function createCourse(id, title, instructor, duration, maxStudents) {
    return {
        id,
        title,
        instructor,
        duration,
        maxStudents,
        enrolledStudents: [],
    };
}
function enrollStudent(student, course) {
    if (course.enrolledStudents.length >= course.maxStudents) {
        return {
            success: false,
            message: 'Курс переполнен',
        };
    }
    if (student.enrolledCourses.includes(course.id)) {
        return {
            success: false,
            message: 'Студент уже записан на этот курс',
        };
    }
    student.enrolledCourses.push(course.id);
    course.enrolledStudents.push(student.id);
    return {
        success: true,
        message: 'Студент успешно записан на курс',
    };
}
function assignGrade(student, courseId, score) {
    if (!student.enrolledCourses.includes(courseId)) {
        return {
            success: false,
            message: 'Студент не записан на этот курс',
        };
    }
    if (score < 0 || score > 100) {
        return {
            success: false,
            message: 'Оценка должна быть от 0 до 100',
        };
    }
    if (!student.grades[courseId]) {
        student.grades[courseId] = [];
    }
    student.grades[courseId].push({
        studentId: student.id,
        courseId,
        score,
        date: new Date(),
    });
    return {
        success: true,
        message: 'Оценка выставлена',
    };
}
function calculateStudentAverage(student, courseId) {
    const grades = student.grades?.[courseId];
    if (!grades || grades.length === 0) {
        return null;
    }
    const sum = grades.reduce((acc, grade) => acc + grade.score, 0);
    return Math.round((sum / grades.length) * 100) / 100;
}
function getCourseStats(course, students) {
    const enrolledStudents = students.filter(student => student.enrolledCourses.includes(course.id));
    const allGrades = enrolledStudents
        .flatMap(student => student.grades?.[course.id] || [])
        .map(grade => grade.score);
    const averageGrade = allGrades.length > 0
        ? allGrades.reduce((sum, score) => sum + score, 0) / allGrades.length
        : 0;
    const studentsWithGrades = enrolledStudents.filter(student => student.grades?.[course.id] && student.grades[course.id].length > 0).length;
    const completionRate = enrolledStudents.length > 0
        ? (studentsWithGrades / enrolledStudents.length) * 100
        : 0;
    return {
        courseId: course.id,
        totalStudents: enrolledStudents.length,
        averageGrade: Math.round(averageGrade * 100) / 100,
        completionRate: Math.round(completionRate * 100) / 100,
    };
}
function getTopStudents(students, courseId, limit) {
    return students
        .map(student => ({
        ...student,
        average: calculateStudentAverage(student, courseId),
    }))
        .filter((student) => student.average !== null)
        .sort((a, b) => b.average - a.average)
        .slice(0, limit);
}
const students = [
    createStudent(1, 'Анна Иванова', 'anna@example.com'),
    createStudent(2, 'Петр Петров', 'peter@example.com'),
    createStudent(3, 'Мария Сидорова', 'maria@example.com'),
];
const courses = [
    createCourse(101, 'JavaScript Основы', 'Иван Учителев', 40, 20),
    createCourse(102, 'React Advanced', 'Мария Преподователь', 60, 15),
];
if (students[0] && courses[0])
    enrollStudent(students[0], courses[0]);
if (students[1] && courses[0])
    enrollStudent(students[1], courses[0]);
if (students[0] && courses[1])
    enrollStudent(students[0], courses[1]);
if (students[0])
    assignGrade(students[0], 101, 95);
if (students[0])
    assignGrade(students[0], 101, 87);
if (students[1])
    assignGrade(students[1], 101, 78);
if (students[0]) {
    console.log('Средняя оценка Анны по JS:', calculateStudentAverage(students[0], 101));
}
if (courses[0]) {
    console.log('Статистика курса JS:', getCourseStats(courses[0], students));
}
console.log('Лучшие студенты по JS:', getTopStudents(students, 101, 2));
//# sourceMappingURL=task3-complex-data.js.map