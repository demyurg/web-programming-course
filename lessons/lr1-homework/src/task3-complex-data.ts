// Система управления курсами и студентами

// Интерфейсы
interface Student {
    id: number;
    name: string;
    email: string;
    enrolledCourses: string[];      
    grades: Record<string, Grade[]>;
}

interface Course {
    id: string;
    title: string;
    instructor: string;
    duration: number;               
    maxStudents: number;
    enrolledStudents: number[];
}

interface Grade {
    studentId: number;
    courseId: string;
    score: number;                  
    date: Date;
}

interface CourseStats {
    courseId: string;
    averageGrade: number;           
    totalStudents: number;          
    completionRate: number;         
}

interface AverageGrade {
    student: Student;
    average: number | null;
}

// Создание студента
function createStudent(id: number, name: string, email: string): Student {
    return {
        id,
        name,
        email,
        enrolledCourses: [],
        grades: {}
    };
}

// Создание курса
function createCourse(id: string, title: string, instructor: string, duration: number, maxStudents: number): Course {
    return {
        id,
        title,
        instructor,
        duration,
        maxStudents,
        enrolledStudents: []
    };
}

// Запись студента на курс
function enrollStudent(student: Student, course: Course): { success: boolean, message: string } {
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
function assignGrade(student: Student, courseId: string, score: number): { success: boolean, message: string } {
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

    student.grades[courseId].push({ studentId: student.id, courseId, score, date: new Date() });

    return {
        success: true,
        message: 'Оценка выставлена'
    };
}

// Среднюю оценку студента по курсу
function calculateStudentAverage(student: Student, courseId: string): number | null {
    const grades = student.grades[courseId];
    if (!grades || grades.length === 0) {
        return null;
    }

    const sum = grades.reduce((acc, grade) => acc + grade.score, 0);
    return Math.round((sum / grades.length) * 100) / 100;
}

// Статистика по курсу
function getCourseStats(course: Course, students: Student[]): CourseStats {
    const enrolledStudents = students.filter(student => student.enrolledCourses.includes(course.id));

    const allGrades = enrolledStudents
        .map(student => student.grades[course.id] || [])
        .flat()
        .map(grade => grade.score);

    const averageGrade = allGrades.length > 0
        ? allGrades.reduce((sum, score) => sum + score, 0) / allGrades.length
        : 0;

    const studentsWithGrades = enrolledStudents.filter(student => 
        student.grades[course.id] && student.grades[course.id].length > 0
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

// Топ студентов по среднему баллу
function getTopStudents(students: Student[], courseId: string, limit: number): AverageGrade[] {
    return students
        .map(student => ({ 
            student, 
            average: calculateStudentAverage(student, courseId) 
        }))
        .filter(avg => avg.average !== null)                 
        .sort((a, b) => {
            if (a.average === b.average) {                 
                return a.student.name.localeCompare(b.student.name); 
            }
            return b.average! - a.average!;                    
        })
        .slice(0, limit);                                    
}

// Примеры использования
const students = [
    createStudent(1, 'Анна Иванова', 'anna@example.com'),   // Первый студент
    createStudent(2, 'Пётр Петров', 'peter@example.com'),  // Второй студент
    createStudent(3, 'Мария Сидорова', 'maria@example.com') // Третий студент
];

const courses = [
    createCourse('JS101', 'Основы JavaScript', 'Иван Учителев', 40, 20), // Курс №1
    createCourse('REACT201', 'Advanced React', 'Мария Преподователь', 60, 15) // Курс №2
];

// Записываем студентов на курсы
enrollStudent(students[0], courses[0]); // Анна на JS
enrollStudent(students[1], courses[0]); // Пётр на JS
enrollStudent(students[0], courses[1]); // Анна на React

// Выставляем оценки студентам
assignGrade(students[0], 'JS101', 95);  // Анне ставим первую оценку
assignGrade(students[0], 'JS101', 87);  // Вторую оценку
assignGrade(students[1], 'JS101', 78);  // Питеру одну оценку

// Проверяем среднюю оценку Анны по первому курсу
console.log('Средняя оценка Анны по JS:', calculateStudentAverage(students[0], 'JS101'));

// Получаем статистику по курсу JavaScript
console.log('Статистика курса JS:', getCourseStats(courses[0], students));

// Получаем двух лучших студентов по курсу JavaScript
console.log('Лучшие студенты по JS:', getTopStudents(students, 'JS101', 2));