export interface Progress {
  studentId: number;
  courseId: number;
  completedLessons: number;
  totalLessons: number;
  grades: Grade[];
  lastActivity: string;
  averageGrade: number;
}

export interface Grade {
  lessonId: number;
  lessonTitle: string;
  grade: number;
  date: string;
  feedback?: string;
}

export const progressData: Progress[] = [
  {
    studentId: 1,
    courseId: 1,
    completedLessons: 8,
    totalLessons: 12,
    grades: [
      {
        lessonId: 1,
        lessonTitle: "Вступ до англійської",
        grade: 90,
        date: "05.02.2023",
        feedback: "Відмінна робота!",
      },
      {
        lessonId: 2,
        lessonTitle: "Алфавіт і звуки",
        grade: 85,
        date: "12.02.2023",
      },
      {
        lessonId: 3,
        lessonTitle: "Базові фрази",
        grade: 88,
        date: "19.02.2023",
      },
      {
        lessonId: 4,
        lessonTitle: "Числа і кольори",
        grade: 92,
        date: "26.02.2023",
        feedback: "Дуже добре!",
      },
      {
        lessonId: 5,
        lessonTitle: "Сім&apos;я і друзі",
        grade: 78,
        date: "05.03.2023",
        feedback: "Потрібно більше практики",
      },
      {
        lessonId: 6,
        lessonTitle: "Їжа і напої",
        grade: 85,
        date: "12.03.2023",
      },
      { lessonId: 7, lessonTitle: "Час і дати", grade: 80, date: "19.03.2023" },
      {
        lessonId: 8,
        lessonTitle: "Хобі та інтереси",
        grade: 88,
        date: "26.03.2023",
      },
    ],
    lastActivity: "26.03.2023",
    averageGrade: 85.75,
  },
  {
    studentId: 1,
    courseId: 2,
    completedLessons: 5,
    totalLessons: 8,
    grades: [
      {
        lessonId: 1,
        lessonTitle: "Дієслово &apos;to be&apos;",
        grade: 90,
        date: "20.02.2023",
      },
      {
        lessonId: 2,
        lessonTitle: "Артиклі",
        grade: 82,
        date: "27.02.2023",
        feedback: "Добре, але потрібно більше практики",
      },
      {
        lessonId: 3,
        lessonTitle: "Множина іменників",
        grade: 88,
        date: "06.03.2023",
      },
      {
        lessonId: 4,
        lessonTitle: "Присвійні займенники",
        grade: 85,
        date: "13.03.2023",
      },
      {
        lessonId: 5,
        lessonTitle: "Present Simple",
        grade: 80,
        date: "20.03.2023",
        feedback: "Зверніть увагу на правила утворення",
      },
    ],
    lastActivity: "20.03.2023",
    averageGrade: 85,
  },
  {
    studentId: 2,
    courseId: 7,
    completedLessons: 7,
    totalLessons: 12,
    grades: [
      {
        lessonId: 1,
        lessonTitle: "Ділова комунікація",
        grade: 95,
        date: "20.02.2023",
        feedback: "Відмінно!",
      },
      {
        lessonId: 2,
        lessonTitle: "Ділове листування",
        grade: 90,
        date: "27.02.2023",
      },
      {
        lessonId: 3,
        lessonTitle: "Телефонні розмови",
        grade: 88,
        date: "06.03.2023",
      },
      {
        lessonId: 4,
        lessonTitle: "Презентації",
        grade: 92,
        date: "13.03.2023",
        feedback: "Дуже добре!",
      },
      { lessonId: 5, lessonTitle: "Переговори", grade: 85, date: "20.03.2023" },
      {
        lessonId: 6,
        lessonTitle: "Ділові зустрічі",
        grade: 90,
        date: "27.03.2023",
      },
      {
        lessonId: 7,
        lessonTitle: "Бізнес-плани",
        grade: 94,
        date: "03.04.2023",
        feedback: "Відмінна робота!",
      },
    ],
    lastActivity: "03.04.2023",
    averageGrade: 90.57,
  },
];

export const getStudentProgress = (studentId: number): Progress[] => {
  return progressData.filter((progress) => progress.studentId === studentId);
};

export const getStudentCourseProgress = (
  studentId: number,
  courseId: number
): Progress | undefined => {
  return progressData.find(
    (progress) =>
      progress.studentId === studentId && progress.courseId === courseId
  );
};
