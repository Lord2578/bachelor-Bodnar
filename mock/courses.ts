export interface Course {
  id: number;
  title: string;
  level: string;
  description: string;
  duration: string;
  startDate: string;
  teacher: string;
  studentsCount: number;
  materials: string[];
}

export const courses: Course[] = [
  {
    id: 1,
    title: "Англійська для початківців",
    level: "A1",
    description:
      "Базовий курс для тих, хто тільки починає вивчати англійську мову",
    duration: "3 місяці",
    startDate: "01.02.2023",
    teacher: "Ірина Коваленко",
    studentsCount: 15,
    materials: [
      "Підручник &apos;English File A1&apos;",
      "Робочий зошит",
      "Аудіоматеріали",
    ],
  },
  {
    id: 2,
    title: "Граматика A1",
    level: "A1",
    description: "Поглиблене вивчення граматики для початкового рівня",
    duration: "2 місяці",
    startDate: "15.02.2023",
    teacher: "Олена Петрова",
    studentsCount: 12,
    materials: ["Граматичний довідник", "Збірник вправ"],
  },
  {
    id: 3,
    title: "Граматика A2",
    level: "A2",
    description: "Граматика для рівня Elementary",
    duration: "2 місяці",
    startDate: "10.01.2023",
    teacher: "Олена Петрова",
    studentsCount: 10,
    materials: ["Граматичний довідник A2", "Збірник вправ"],
  },
  {
    id: 4,
    title: "Розмовний клуб",
    level: "A2",
    description: "Практика розмовної англійської для початківців",
    duration: "Постійно",
    startDate: "Щотижня",
    teacher: "Джон Сміт",
    studentsCount: 8,
    materials: ["Розмовні теми", "Картки для дискусій"],
  },
  {
    id: 5,
    title: "Англійська для подорожей",
    level: "B1",
    description: "Курс для тих, хто планує подорожувати англомовними країнами",
    duration: "1.5 місяці",
    startDate: "05.03.2023",
    teacher: "Марія Іванова",
    studentsCount: 14,
    materials: ["Розмовник для подорожей", "Аудіоматеріали"],
  },
  {
    id: 6,
    title: "Граматика B1",
    level: "B1",
    description: "Поглиблене вивчення граматики для середнього рівня",
    duration: "2.5 місяці",
    startDate: "20.01.2023",
    teacher: "Олена Петрова",
    studentsCount: 11,
    materials: ["Граматичний довідник B1", "Збірник вправ"],
  },
  {
    id: 7,
    title: "Бізнес-англійська",
    level: "B2",
    description: "Курс ділової англійської для професійного спілкування",
    duration: "3 місяці",
    startDate: "15.02.2023",
    teacher: "Роберт Джонсон",
    studentsCount: 9,
    materials: [
      "Підручник &apos;Business English&apos;",
      "Ділові кейси",
      "Шаблони документів",
    ],
  },
  {
    id: 8,
    title: "Розмовна практика B2",
    level: "B2",
    description:
      "Інтенсивна практика розмовної англійської для рівня Upper-Intermediate",
    duration: "2 місяці",
    startDate: "01.03.2023",
    teacher: "Сара Вільямс",
    studentsCount: 8,
    materials: ["Дискусійні теми", "Відеоматеріали"],
  },
  {
    id: 9,
    title: "Підготовка до IELTS",
    level: "C1",
    description: "Підготовка до міжнародного іспиту IELTS",
    duration: "4 місяці",
    startDate: "10.01.2023",
    teacher: "Девід Браун",
    studentsCount: 12,
    materials: [
      "Офіційний посібник IELTS",
      "Практичні тести",
      "Аудіоматеріали",
    ],
  },
  {
    id: 10,
    title: "Академічне письмо",
    level: "C1",
    description: "Курс з написання академічних текстів англійською мовою",
    duration: "2 місяці",
    startDate: "05.02.2023",
    teacher: "Елізабет Тейлор",
    studentsCount: 7,
    materials: ["Посібник з академічного письма", "Зразки есе"],
  },
  {
    id: 11,
    title: "Літературний переклад",
    level: "C2",
    description: "Курс з художнього перекладу англійською мовою",
    duration: "3 місяці",
    startDate: "01.02.2023",
    teacher: "Вільям Грін",
    studentsCount: 5,
    materials: ["Літературні тексти", "Посібник з перекладу"],
  },
  {
    id: 12,
    title: "Стилістика англійської мови",
    level: "C2",
    description:
      "Поглиблене вивчення стилістичних особливостей англійської мови",
    duration: "2.5 місяці",
    startDate: "15.01.2023",
    teacher: "Річард Кінг",
    studentsCount: 6,
    materials: ["Підручник зі стилістики", "Літературні приклади"],
  },
];

export const getCourseById = (id: number): Course | undefined => {
  return courses.find((course) => course.id === id);
};

export const filterCoursesByLevel = (level: string): Course[] => {
  if (level === "Всі") {
    return courses;
  }
  return courses.filter((course) => course.level === level);
};

export const getStudentCourses = (
  studentId: number,
  studentCourses: string[]
): Course[] => {
  return courses.filter((course) => studentCourses.includes(course.title));
};
