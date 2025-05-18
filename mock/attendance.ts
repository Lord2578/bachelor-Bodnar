export interface Attendance {
  studentId: number;
  courseId: number;
  lessons: LessonAttendance[];
  overallAttendance: number;
}

export interface LessonAttendance {
  lessonId: number;
  lessonTitle: string;
  date: string;
  attended: boolean;
  reason?: string;
}

export const attendanceData: Attendance[] = [
  {
    studentId: 1,
    courseId: 1,
    lessons: [
      {
        lessonId: 1,
        lessonTitle: "Вступ до англійської",
        date: "05.02.2023",
        attended: true,
      },
      {
        lessonId: 2,
        lessonTitle: "Алфавіт і звуки",
        date: "12.02.2023",
        attended: true,
      },
      {
        lessonId: 3,
        lessonTitle: "Базові фрази",
        date: "19.02.2023",
        attended: true,
      },
      {
        lessonId: 4,
        lessonTitle: "Числа і кольори",
        date: "26.02.2023",
        attended: true,
      },
      {
        lessonId: 5,
        lessonTitle: "Сім&apos;я і друзі",
        date: "05.03.2023",
        attended: false,
        reason: "Хвороба",
      },
      {
        lessonId: 6,
        lessonTitle: "Їжа і напої",
        date: "12.03.2023",
        attended: true,
      },
      {
        lessonId: 7,
        lessonTitle: "Час і дати",
        date: "19.03.2023",
        attended: true,
      },
      {
        lessonId: 8,
        lessonTitle: "Хобі та інтереси",
        date: "26.03.2023",
        attended: true,
      },
    ],
    overallAttendance: 87.5,
  },
  {
    studentId: 1,
    courseId: 2,
    lessons: [
      {
        lessonId: 1,
        lessonTitle: "Дієслово &apos;to be&apos;",
        date: "20.02.2023",
        attended: true,
      },
      {
        lessonId: 2,
        lessonTitle: "Артиклі",
        date: "27.02.2023",
        attended: true,
      },
      {
        lessonId: 3,
        lessonTitle: "Множина іменників",
        date: "06.03.2023",
        attended: true,
      },
      {
        lessonId: 4,
        lessonTitle: "Присвійні займенники",
        date: "13.03.2023",
        attended: true,
      },
      {
        lessonId: 5,
        lessonTitle: "Present Simple",
        date: "20.03.2023",
        attended: true,
      },
    ],
    overallAttendance: 100,
  },
  {
    studentId: 2,
    courseId: 7,
    lessons: [
      {
        lessonId: 1,
        lessonTitle: "Ділова комунікація",
        date: "20.02.2023",
        attended: true,
      },
      {
        lessonId: 2,
        lessonTitle: "Ділове листування",
        date: "27.02.2023",
        attended: false,
        reason: "Відрядження",
      },
      {
        lessonId: 3,
        lessonTitle: "Телефонні розмови",
        date: "06.03.2023",
        attended: true,
      },
      {
        lessonId: 4,
        lessonTitle: "Презентації",
        date: "13.03.2023",
        attended: true,
      },
      {
        lessonId: 5,
        lessonTitle: "Переговори",
        date: "20.03.2023",
        attended: false,
        reason: "Особисті причини",
      },
      {
        lessonId: 6,
        lessonTitle: "Ділові зустрічі",
        date: "27.03.2023",
        attended: true,
      },
      {
        lessonId: 7,
        lessonTitle: "Бізнес-плани",
        date: "03.04.2023",
        attended: true,
      },
    ],
    overallAttendance: 71.4,
  },
];

export const getStudentAttendance = (studentId: number): Attendance[] => {
  return attendanceData.filter(
    (attendance) => attendance.studentId === studentId
  );
};

export const getStudentCourseAttendance = (
  studentId: number,
  courseId: number
): Attendance | undefined => {
  return attendanceData.find(
    (attendance) =>
      attendance.studentId === studentId && attendance.courseId === courseId
  );
};
