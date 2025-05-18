export interface Student {
  id: number;
  name: string;
  level: string;
  email: string;
  phone: string;
  address: string;
  birthdate: string;
  enrollmentDate: string;
  courses: string[];
  attendance: number;
  averageGrade: number;
  lastActivity: string;
  notes: string;
  avatar?: string;
}

export const students: Student[] = [
  {
    id: 1,
    name: "Анна Ковальчук",
    level: "A1",
    email: "anna.kovalchuk@example.com",
    phone: "+380991234567",
    address: "м. Київ, вул. Хрещатик, 1",
    birthdate: "15.05.1995",
    enrollmentDate: "01.09.2022",
    courses: ["Англійська для початківців", "Граматика A1"],
    attendance: 92,
    averageGrade: 85,
    lastActivity: "10.03.2023",
    notes: "Старанна студентка, швидко засвоює матеріал",
  },
  {
    id: 2,
    name: "Олександр Петренко",
    level: "B2",
    email: "oleksandr.petrenko@example.com",
    phone: "+380992345678",
    address: "м. Львів, вул. Франка, 15",
    birthdate: "22.07.1990",
    enrollmentDate: "15.01.2021",
    courses: ["Бізнес-англійська", "Розмовна практика B2"],
    attendance: 78,
    averageGrade: 92,
    lastActivity: "15.03.2023",
    notes: "Має гарні навички спілкування, потребує більше практики письма",
  },
  {
    id: 3,
    name: "Ірина Лисенко",
    level: "C1",
    email: "iryna.lysenko@example.com",
    phone: "+380993456789",
    address: "м. Одеса, вул. Дерибасівська, 7",
    birthdate: "10.12.1988",
    enrollmentDate: "05.03.2020",
    courses: ["Підготовка до IELTS", "Академічне письмо"],
    attendance: 95,
    averageGrade: 94,
    lastActivity: "18.03.2023",
    notes: "Готується до міжнародного іспиту, потребує додаткової підтримки",
  },
  {
    id: 4,
    name: "Максим Сидоренко",
    level: "A2",
    email: "maksym.sydorenko@example.com",
    phone: "+380994567890",
    address: "м. Харків, вул. Сумська, 22",
    birthdate: "05.03.1997",
    enrollmentDate: "10.10.2022",
    courses: ["Граматика A2", "Розмовний клуб"],
    attendance: 65,
    averageGrade: 72,
    lastActivity: "05.03.2023",
    notes: "Пропускає заняття, потребує додаткової мотивації",
  },
  {
    id: 5,
    name: "Марія Козак",
    level: "B1",
    email: "mariia.kozak@example.com",
    phone: "+380995678901",
    address: "м. Дніпро, пр. Гагаріна, 5",
    birthdate: "18.09.1993",
    enrollmentDate: "20.05.2021",
    courses: ["Англійська для подорожей", "Граматика B1"],
    attendance: 88,
    averageGrade: 81,
    lastActivity: "12.03.2023",
    notes: "Активна на заняттях, потребує більше практики аудіювання",
  },
  {
    id: 6,
    name: "Дмитро Шевченко",
    level: "C2",
    email: "dmytro.shevchenko@example.com",
    phone: "+380996789012",
    address: "м. Київ, вул. Володимирська, 10",
    birthdate: "30.11.1985",
    enrollmentDate: "15.02.2019",
    courses: ["Літературний переклад", "Стилістика англійської мови"],
    attendance: 97,
    averageGrade: 98,
    lastActivity: "17.03.2023",
    notes:
      "Високий рівень володіння мовою, готується до викладацької діяльності",
  },
  {
    id: 7,
    name: "Ольга Романенко",
    level: "A1",
    email: "olha.romanenko@example.com",
    phone: "+380997890123",
    address: "м. Запоріжжя, пр. Соборний, 12",
    birthdate: "25.04.1998",
    enrollmentDate: "05.02.2023",
    courses: ["Англійська для початківців"],
    attendance: 100,
    averageGrade: 79,
    lastActivity: "16.03.2023",
    notes: "Тільки почала навчання, демонструє високу мотивацію",
  },
];

export const getStudentById = (id: number): Student | undefined => {
  return students.find((student) => student.id === id);
};

export const filterStudentsByLevel = (level: string): Student[] => {
  if (level === "Всі") {
    return students;
  }
  return students.filter((student) => student.level === level);
};
