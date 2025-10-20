/*
 * ЗАДАЧА 3: Работа с массивами и объектами сложной структурой
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
    duration: string;
    maxStudents: number;
    enrolledStudents: number[];
}

interface CourseStats {
    courseId: number;
    averageGrade: number;
    totalStudents: number;
    completionRate: number;
}


type Result<T = void> = {
    success: true;
    data?: T;
} | {
    success: false;
    error: string;
};


function createStudent(id: number, name: string, email: string): Student {
    return {
        id,
        name,
        email,
        enrolledCourses: [],
        grades: {}
    };
}

function createCourse(id: number, title: string, instructor: string, duration: string, maxStudents: number): Course {
    return {
        id,
        title,
        instructor,
        duration,
        maxStudents,
        enrolledStudents: []
    };
}

function enrollStudent(student: Student, course: Course): Result {
    if (course.enrolledStudents.length >= course.maxStudents) {
        return {
            success: false,
            error: 'Курс переполнен'
        };
    }

    if (student.enrolledCourses.includes(course.id)) {
        return {
            success: false,
            error: 'Студент уже записан на этот курс'
        };
    }

    student.enrolledCourses.push(course.id);
    course.enrolledStudents.push(student.id);

    return {
        success: true
    };
}


function assignGrade(student: Student, courseId: number, score: number): Result {
    if (!student.enrolledCourses.includes(courseId)) {
        return {
            success: false,
            error: 'Студент не записан на этот курс'
        };
    }

    if (score < 0 || score > 100) {
        return {
            success: false,
            error: 'Оценка должна быть от 0 до 100'
        };
    }

    if (!student.grades[courseId]) {
        student.grades[courseId] = [];
    }

    student.grades[courseId].push({
        score,
        date: new Date()
    });

    return {
        success: true
    };
}

function calculateStudentAverage(student: Student, courseId: number): number | null {
    const grades = student.grades[courseId];
    if (!grades || grades.length === 0) {
        return null;
    }

    const sum = grades.reduce((acc, grade) => acc + grade.score, 0);
    return Math.round((sum / grades.length) * 100) / 100;
}

function getCourseStats(course: Course, students: Student[]): CourseStats {
    const enrolledStudents = students.filter(student =>
        student.enrolledCourses.includes(course.id)
    );

    const allGrades = enrolledStudents
        .map(student => student.grades[course.id] ?? [])
        .flat()
        .map(grade => grade.score);

    const averageGrade = allGrades.length > 0
        ? allGrades.reduce((sum, score) => sum + score, 0) / allGrades.length
        : 0;

    const studentsWithGrades = enrolledStudents.filter(student =>
        (student.grades[course.id]?.length ?? 0) > 0
    ).length;

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

function getTopStudents(students: Student[], courseId: number, limit: number): (Student & { average: number })[] {
    return students
        .map(student => ({
            ...student,
            average: calculateStudentAverage(student, courseId) ?? 0
        }))
        .filter(student => student.average > 0)
        .sort((a, b) => b.average - a.average)
        .slice(0, limit);
}

function getStudentById(id: number, students: Student[]): Student | null {
    return students.find(student => student.id === id) || null;
}

function getCourseById(id: number, courses: Course[]): Course | null {
    return courses.find(course => course.id === id) || null;
}


function safeEnrollStudent(studentId: number, courseId: number, students: Student[], courses: Course[]): Result {
    const student = getStudentById(studentId, students);
    const course = getCourseById(courseId, courses);

    if (!student) {
        return {
            success: false,
            error: `Студент с ID ${studentId} не найден`
        };
    }

    if (!course) {
        return {
            success: false,
            error: `Курс с ID ${courseId} не найден`
        };
    }

    return enrollStudent(student, course);
}

function safeAssignGrade(studentId: number, courseId: number, score: number, students: Student[]): Result {
    const student = getStudentById(studentId, students);

    if (!student) {
        return {
            success: false,
            error: `Студент с ID ${studentId} не найден`
        };
    }

    return assignGrade(student, courseId, score);
}

function getStudentByIndex(index: number, students: Student[]): Student | null {
    return students[index] || null;
}

function getCourseByIndex(index: number, courses: Course[]): Course | null {
    return courses[index] || null;
}

const students: Student[] = [
    createStudent(1, 'Анна Иванова', 'anna@example.com'),
    createStudent(2, 'Петр Петров', 'peter@example.com'),
    createStudent(3, 'Мария Сидорова', 'maria@example.com')
];

const courses: Course[] = [
    createCourse(101, 'JavaScript Основы', 'Иван Учителев', '40 часов', 20),
    createCourse(102, 'React Advanced', 'Мария Преподователь', '60 часов', 15)
];

let index: number = 0;
const student = getStudentByIndex(index, students);
const course = getCourseByIndex(0, courses);

if (!student) {
    console.error('Студент не найден');
} else if (!course) {
    console.error('Курс не найден');
} else {
    const result = enrollStudent(student, course);
    if (!result.success) {
        console.error(result.error);
    }
}


const enrollResult1 = safeEnrollStudent(2, 101, students, courses);
if (!enrollResult1.success) console.error(enrollResult1.error);

const enrollResult2 = safeEnrollStudent(1, 102, students, courses);
if (!enrollResult2.success) console.error(enrollResult2.error);


const gradeResult1 = safeAssignGrade(1, 101, 95, students);
if (!gradeResult1.success) console.error(gradeResult1.error);

const gradeResult2 = safeAssignGrade(1, 101, 87, students);
if (!gradeResult2.success) console.error(gradeResult2.error);

const gradeResult3 = safeAssignGrade(2, 101, 78, students);
if (!gradeResult3.success) console.error(gradeResult3.error);


const demoStudent = getStudentByIndex(0, students);
const demoCourse = getCourseByIndex(0, courses);

if (demoStudent && demoCourse) {
    console.log('Средняя оценка Анны по JS:', calculateStudentAverage(demoStudent, 101));
    console.log('Статистика курса JS:', getCourseStats(demoCourse, students));
    console.log('Лучшие студенты по JS:', getTopStudents(students, 101, 2));
} else {
    console.error('Не удалось получить данные для демонстрации');
}

