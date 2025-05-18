export interface Note {
  id: number;
  studentId: number;
  teacherId: number;
  text: string;
  date: string;
  isPrivate: boolean;
}

export const notes: Note[] = [
  {
    id: 1,
    studentId: 1,
    teacherId: 1,
    text: "Анна показує відмінні результати в граматиці, але потребує більше практики в розмовній мові.",
    date: "15.02.2023",
    isPrivate: false,
  },
  {
    id: 2,
    studentId: 1,
    teacherId: 2,
    text: "Студентка дуже старанна, виконує всі домашні завдання вчасно.",
    date: "01.03.2023",
    isPrivate: false,
  },
  {
    id: 3,
    studentId: 2,
    teacherId: 3,
    text: "Олександр має відмінні навички ділового спілкування, але потребує роботи над вимовою.",
    date: "10.03.2023",
    isPrivate: false,
  },
  {
    id: 4,
    studentId: 2,
    teacherId: 3,
    text: "Пропустив два заняття через відрядження, потрібно надати додаткові матеріали.",
    date: "20.03.2023",
    isPrivate: true,
  },
  {
    id: 5,
    studentId: 3,
    teacherId: 4,
    text: "Ірина готується до IELTS, показує високі результати в усіх аспектах.",
    date: "05.03.2023",
    isPrivate: false,
  },
  {
    id: 6,
    studentId: 4,
    teacherId: 2,
    text: "Максим часто пропускає заняття, потрібно провести додаткову бесіду.",
    date: "15.03.2023",
    isPrivate: true,
  },
  {
    id: 7,
    studentId: 5,
    teacherId: 1,
    text: "Марія активна на заняттях, але має труднощі з аудіюванням.",
    date: "12.03.2023",
    isPrivate: false,
  },
];

export const getStudentNotes = (
  studentId: number,
  includePrivate = false
): Note[] => {
  return notes.filter(
    (note) =>
      note.studentId === studentId && (includePrivate || !note.isPrivate)
  );
};

export const addNote = (note: Omit<Note, "id">): Note => {
  const newNote: Note = {
    id: notes.length + 1,
    ...note,
  };
  notes.push(newNote);
  return newNote;
};
