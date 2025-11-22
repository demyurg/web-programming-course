type StudentId = number;
type CourseId = number;

interface Grade {
  score: number;
  date: Date;
}

interface Student {
  id: StudentId;
  name: string;
  email: string;
  enrolledCourses: CourseId[];
  grades: Record<CourseId, Grade[]>;
}

interface Course {
  id: CourseId;
  title: string;
  instructor: string;
  duration: number;
  maxStudents: number;
  enrolledStudents: StudentId[];
}

interface CourseStats {
  courseId: CourseId;
  totalStudents: number;
  averageGrade: number;
  completionRate: number;
}

interface ActionResult {
  success: boolean;
  message: string;
}

function createStudent(id: StudentId, name: string, email: string): Student {
  return {
    id,
    name,
    email,
    enrolledCourses: [],
    grades: {},
  };
}

function createCourse(
  id: CourseId,
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
    enrolledStudents: [],
  };
}

function enrollStudent(student: Student, course: Course): ActionResult {
  if (course.enrolledStudents.length >= course.maxStudents) {
    return { success: false, message: "Курс переполнен" };
  }

  if (student.enrolledCourses.includes(course.id)) {
    return { success: false, message: "Студент уже записан на этот курс" };
  }

  student.enrolledCourses.push(course.id);
  course.enrolledStudents.push(student.id);

  return { success: true, message: "Студент успешно записан на курс" };
}

function assignGrade(
  student: Student,
  courseId: CourseId,
  score: number
): ActionResult {
  if (!student.enrolledCourses.includes(courseId)) {
    return { success: false, message: "Студент не записан на этот курс" };
  }

  if (score < 0 || score > 100) {
    return { success: false, message: "Оценка должна быть от 0 до 100" };
  }

  if (!student.grades[courseId]) {
    student.grades[courseId] = [];
  }

  student.grades[courseId].push({ score, date: new Date() });

  return { success: true, message: "Оценка выставлена" };
}

function calculateStudentAverage(
  student: Student,
  courseId: CourseId
): number | null {
  const grades = student.grades[courseId];
  if (!grades || grades.length === 0) {
    return null;
  }

  const sum = grades.reduce((acc, g) => acc + g.score, 0);
  return Math.round((sum / grades.length) * 100) / 100;
}

function getCourseStats(course: Course, students: Student[]): CourseStats {
  const enrolledStudents = students.filter((s) =>
    s.enrolledCourses.includes(course.id)
  );

  const allScores = enrolledStudents
    .flatMap((s) => s.grades[course.id] ?? [])
    .map((g) => g.score);

  const averageGrade =
    allScores.length > 0
      ? allScores.reduce((a, b) => a + b, 0) / allScores.length
      : 0;

  const studentsWithGrades = enrolledStudents.filter(
    (s) => !!s.grades[course.id]?.length
  ).length;

  const completionRate =
    enrolledStudents.length > 0
      ? (studentsWithGrades / enrolledStudents.length) * 100
      : 0;

  return {
    courseId: course.id,
    totalStudents: enrolledStudents.length,
    averageGrade: Math.round(averageGrade * 100) / 100,
    completionRate: Math.round(completionRate * 100) / 100,
  };
}

interface StudentWithAverage extends Student {
  average: number | null;
}

function getTopStudents(
  students: Student[],
  courseId: CourseId,
  limit: number = 5
): (Student & { average: number })[] {
  const withAverage = students
    .map((student) => ({
      ...student,
      average: calculateStudentAverage(student, courseId),
    }))
    .filter((s): s is Student & { average: number } => s.average !== null)
    .sort((a, b) => b.average - a.average)
    .slice(0, limit);

  return withAverage;
}

// примеры

const students: Student[] = [
  createStudent(1, "Анна Иванова", "anna@example.com"),
  createStudent(2, "Петр Петров", "peter@example.com"),
  createStudent(3, "Мария Сидорова", "maria@example.com"),
];

const courses: Course[] = [
  createCourse(101, "JavaScript Основы", "Иван Учителев", 40, 20),
  createCourse(102, "React Advanced", "Мария Преподователь", 60, 15),
];

// Запись
enrollStudent(students[0]!, courses[0]!);
enrollStudent(students[1]!, courses[0]!);
enrollStudent(students[0]!, courses[1]!);

// Оценки
assignGrade(students[0]!, 101, 95);
assignGrade(students[0]!, 101, 87);
assignGrade(students[1]!, 101, 78);

console.log(
  "Средняя оценка Анны по JS:",
  calculateStudentAverage(students[0]!, 101)
);
console.log("Статистика курса JS:", getCourseStats(courses[0]!, students));
console.log("Лучшие студенты по JS:", getTopStudents(students, 101, 2));
