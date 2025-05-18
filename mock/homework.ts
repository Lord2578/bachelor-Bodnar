export interface Homework {
    id: number
    studentId: number
    courseId: number
    title: string
    description: string
    assignedDate: string
    dueDate: string
    status: "assigned" | "submitted" | "graded" | "late" | "missed"
    grade?: number
    feedback?: string
    attachments?: string[]
  }
  
  export const homeworkData: Homework[] = [
    {
      id: 1,
      studentId: 1,
      courseId: 1,
      title: "Вправи з алфавіту",
      description: "Виконати вправи 1-5 на сторінці 12 підручника",
      assignedDate: "05.02.2023",
      dueDate: "12.02.2023",
      status: "graded",
      grade: 90,
      feedback: "Відмінна робота! Всі вправи виконані правильно.",
    },
    {
      id: 2,
      studentId: 1,
      courseId: 1,
      title: "Базові фрази",
      description: "Вивчити 20 базових фраз зі сторінки 15",
      assignedDate: "12.02.2023",
      dueDate: "19.02.2023",
      status: "graded",
      grade: 85,
      feedback: "Добре, але є кілька помилок у вимові.",
    },
    {
      id: 3,
      studentId: 1,
      courseId: 1,
      title: "Числа і кольори",
      description: "Виконати вправи 1-3 на сторінці 20",
      assignedDate: "19.02.2023",
      dueDate: "26.02.2023",
      status: "graded",
      grade: 95,
      feedback: "Відмінно! Всі завдання виконані без помилок.",
    },
    {
      id: 4,
      studentId: 1,
      courseId: 1,
      title: "Сім&apos;я і друзі",
      description: "Написати короткий текст про свою сім&apos;ю",
      assignedDate: "26.02.2023",
      dueDate: "05.03.2023",
      status: "submitted",
      attachments: ["family_essay.docx"],
    },
    {
      id: 5,
      studentId: 1,
      courseId: 2,
      title: "Дієслово &apos;to be&apos;",
      description: "Виконати вправи 1-10 на сторінці 8",
      assignedDate: "20.02.2023",
      dueDate: "27.02.2023",
      status: "graded",
      grade: 88,
      feedback: "Добре, але зверніть увагу на негативні форми.",
    },
    {
      id: 6,
      studentId: 2,
      courseId: 7,
      title: "Ділове листування",
      description: "Написати діловий лист англійською мовою",
      assignedDate: "20.02.2023",
      dueDate: "27.02.2023",
      status: "graded",
      grade: 92,
      feedback: "Відмінний діловий лист! Гарна структура та лексика.",
    },
    {
      id: 7,
      studentId: 2,
      courseId: 7,
      title: "Телефонні розмови",
      description: "Підготувати діалог для телефонної розмови",
      assignedDate: "27.02.2023",
      dueDate: "06.03.2023",
      status: "graded",
      grade: 85,
      feedback: "Добре, але потрібно більше практики з інтонацією.",
    },
    {
      id: 8,
      studentId: 2,
      courseId: 7,
      title: "Презентація компанії",
      description: "Підготувати презентацію про вигадану компанію",
      assignedDate: "06.03.2023",
      dueDate: "13.03.2023",
      status: "late",
      attachments: ["company_presentation.pptx"],
    },
    {
      id: 9,
      studentId: 3,
      courseId: 9,
      title: "Есе для IELTS",
      description: "Написати есе на тему &apos;Глобалізація&apos;",
      assignedDate: "10.02.2023",
      dueDate: "17.02.2023",
      status: "graded",
      grade: 95,
      feedback: "Відмінне есе! Гарна структура та аргументація.",
    },
    {
      id: 10,
      studentId: 4,
      courseId: 3,
      title: "Граматичні вправи",
      description: "Виконати вправи 1-15 на сторінці 25",
      assignedDate: "15.02.2023",
      dueDate: "22.02.2023",
      status: "missed",
    },
    {
      id: 11,
      studentId: 5,
      courseId: 5,
      title: "Діалоги для подорожей",
      description: "Підготувати 5 діалогів для різних ситуацій під час подорожі",
      assignedDate: "05.03.2023",
      dueDate: "12.03.2023",
      status: "submitted",
      attachments: ["travel_dialogues.docx"],
    },
  ]
  
  export const getStudentHomework = (studentId: number): Homework[] => {
    return homeworkData.filter((homework) => homework.studentId === studentId)
  }
  
  export const getCourseHomework = (courseId: number): Homework[] => {
    return homeworkData.filter((homework) => homework.courseId === courseId)
  }
  
  export const getStudentCourseHomework = (studentId: number, courseId: number): Homework[] => {
    return homeworkData.filter((homework) => homework.studentId === studentId && homework.courseId === courseId)
  }
  
  export const addHomework = (homework: Omit<Homework, "id">): Homework => {
    const newHomework: Homework = {
      id: homeworkData.length + 1,
      ...homework,
    }
    homeworkData.push(newHomework)
    return newHomework
  }
  
  export const updateHomeworkStatus = (
    homeworkId: number,
    status: Homework["status"],
    grade?: number,
    feedback?: string,
  ): Homework | undefined => {
    const homeworkIndex = homeworkData.findIndex((hw) => hw.id === homeworkId)
    if (homeworkIndex !== -1) {
      homeworkData[homeworkIndex] = {
        ...homeworkData[homeworkIndex],
        status,
        ...(grade !== undefined && { grade }),
        ...(feedback !== undefined && { feedback }),
      }
      return homeworkData[homeworkIndex]
    }
    return undefined
  }
  
  