/*
 * ЗАДАЧА 3: Работа с массивами и объектами сложной структуры
 * 
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Создайте интерфейсы для всех сложных объектов
 * 3. Типизируйте все функции работы с данными
 * 4. Используйте generic типы где это уместно
 */

// Система управления курсами и студентами

// Интерфейсы для сложных объектов
interface Grade {
    score: number;
    date: Date;
}

interface Student {
    id: number;
    name: string;
    email: string;
    enrolledCourses: number[];
    grades: Record<number, Grade[]>;
}

interface Course {
    id: number;
    title: string;
    instructor: string;
    duration: number;
    maxStudents: number;
    enrolledStudents: number[];
}

interface CourseStats {
    courseId: number;
    totalStudents: number;
    averageGrade: number;
    completionRate: number;
}

interface EnrollmentResult {
    success: boolean;
    message: string;
}

interface OperationResult<T = void> {
    success: boolean;
    message: string;
    data?: T;
}

function createStudent(id: number, name: string, email: string): Student {
    return {
        id,
        name,
        email,
        enrolledCourses: [],
        grades: {}
    };
}

function createCourse(
    id: number,
    title: string,
    instructor: string,
    duration: number,
    maxStudents: number
): Course {
    return {
        id,
        title,
        instructor,
        duration,
        maxStudents,
        enrolledStudents: []
    };
}

function enrollStudent(student: Student, course: Course): EnrollmentResult {
    if (course.enrolledStudents.length >= course.maxStudents) {
        return { success: false, message: 'Курс переполнен' };
    }
    if (student.enrolledCourses.includes(course.id)) {
        return { success: false, message: 'Студент уже записан на этот курс' };
    }

    student.enrolledCourses.push(course.id);
    course.enrolledStudents.push(student.id);

    return { success: true, message: 'Студент успешно записан на курс' };
}

function assignGrade(student: Student, courseId: number, score: number): OperationResult<Grade> {
    if (!student.enrolledCourses.includes(courseId)) {
        return { success: false, message: 'Студент не записан на этот курс' };
    }
    if (score < 0 || score > 100) {
        return { success: false, message: 'Оценка должна быть от 0 до 100' };
    }

    if (!student.grades[courseId]) {
        student.grades[courseId] = [];
    }

    const newGrade: Grade = { score, date: new Date() };
    student.grades[courseId].push(newGrade);

    return { success: true, message: 'Оценка выставлена', data: newGrade };
}

function calculateStudentAverage(student: Student, courseId: number): number | null {
    const grades = student.grades[courseId];
    if (!grades || grades.length === 0) return null;

    const sum = grades.reduce((acc, g) => acc + g.score, 0);
    return Math.round((sum / grades.length) * 100) / 100;
}

function getCourseStats(course: Course, students: Student[]): CourseStats {
    const enrolledStudents = students.filter(s => s.enrolledCourses.includes(course.id));

    const allGrades = enrolledStudents.flatMap(s => s.grades[course.id] || []).map(g => g.score);

    const averageGrade = allGrades.length > 0
        ? allGrades.reduce((a, b) => a + b, 0) / allGrades.length
        : 0;

    const studentsWithGrades = enrolledStudents.filter(s => s.grades[course.id]?.length).length;

    const completionRate = enrolledStudents.length > 0
        ? (studentsWithGrades / enrolledStudents.length) * 100
        : 0;

    return {
        courseId: course.id,
        totalStudents: enrolledStudents.length,
        averageGrade: Math.round(averageGrade * 100) / 100,
        completionRate: Math.round(completionRate * 100) / 100
    };
}

function getTopStudents(
    students: Student[],
    courseId: number,
    limit: number
): Array<Student & { average: number }> {
    return students
        .map(s => ({ ...s, average: calculateStudentAverage(s, courseId) }))
        .filter((s): s is Student & { average: number } => s.average !== null)
        .sort((a, b) => b.average - a.average)
        .slice(0, limit);
}

function filterByCourse<T extends { enrolledCourses: number[] }>(items: T[], courseId: number): T[] {
    return items.filter(item => item.enrolledCourses.includes(courseId));
}

// ====== Пример использования ======

const students: Student[] = [
    createStudent(1, 'Анна Иванова', 'anna@example.com'),
    createStudent(2, 'Петр Петров', 'peter@example.com'),
    createStudent(3, 'Мария Сидорова', 'maria@example.com')
];

const courses: Course[] = [
    createCourse(101, 'JavaScript Основы', 'Иван Учителев', 40, 20),
    createCourse(102, 'React Advanced', 'Мария Преподаватель', 60, 15)
];

// Проверим, что курсы и студенты точно есть:
const anna = students.find(s => s.id === 1);
const peter = students.find(s => s.id === 2);
const jsCourse = courses.find(c => c.id === 101);
const reactCourse = courses.find(c => c.id === 102);

if (anna && jsCourse && reactCourse && peter) {
    enrollStudent(anna, jsCourse);
    enrollStudent(peter, jsCourse);
    enrollStudent(anna, reactCourse);

    assignGrade(anna, 101, 95);
    assignGrade(anna, 101, 87);
    assignGrade(peter, 101, 78);

    console.log('Средняя оценка Анны по JS:', calculateStudentAverage(anna, 101));
    console.log('Статистика курса JS:', getCourseStats(jsCourse, students));
    console.log('Лучшие студенты по JS:', getTopStudents(students, 101, 2));

    const studentsInJS = filterByCourse(students, 101);
    console.log('Студенты на курсе JS:', studentsInJS);
}
