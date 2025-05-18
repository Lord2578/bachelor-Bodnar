export interface Lesson {
    id: number
    courseId: number
    title: string
    description: string
    date: string
    startTime: string
    endTime: string
    materials?: string[]
    homeworkId?: number
  }
  
  export const lessons: Lesson[] = [
    {
      id: 1,
      courseId: 1,
      title: "Вступ до англійської",
      description: "Знайомство з курсом, базові поняття",
      date: "05.02.2023",
      startTime: "10:00",
      endTime: "11:30",
      homeworkId: 1,
    },
    {
      id: 2,
      courseId: 1,
      title: "Алфавіт і звуки",
      description: "Вивчення англійського алфавіту та звуків",
      date: "12.02.2023",
      startTime: "10:00",
      endTime: "11:30",
      materials: ["alphabet_handout.pdf", "pronunciation_guide.pdf"],
      homeworkId: 2,
    },
    {
      id: 3,
      courseId: 1,
      title: "Базові фрази",
      description: "Вивчення базових фраз для спілкування",
      date: "19.02.2023",
      startTime: "10:00",
      endTime: "11:30",
      homeworkId: 3,
    },
    {
      id: 4,
      courseId: 1,
      title: "Числа і кольори",
      description: "Вивчення чисел та кольорів",
      date: "26.02.2023",
      startTime: "10:00",
      endTime: "11:30",
      homeworkId: 4,
    },
    {
      id: 5,
      courseId: 1,
      title: "Сім&apos;я і друзі",
      description: "Лексика для опису сім&apos;ї та друзів",
      date: "05.03.2023",
      startTime: "10:00",
      endTime: "11:30",
    },
    {
      id: 6,
      courseId: 2,
      title: "Дієслово &apos;to be&apos;",
      description: "Вивчення дієслова &apos;to be&apos; та його форм",
      date: "20.02.2023",
      startTime: "14:00",
      endTime: "15:30",
      homeworkId: 5,
    },
    {
      id: 7,
      courseId: 7,
      title: "Ділова комунікація",
      description: "Основи ділової комунікації англійською",
      date: "20.02.2023",
      startTime: "18:00",
      endTime: "19:30",
    },
    {
      id: 8,
      courseId: 7,
      title: "Ділове листування",
      description: "Правила ділового листування англійською",
      date: "27.02.2023",
      startTime: "18:00",
      endTime: "19:30",
      materials: ["business_letter_templates.pdf"],
      homeworkId: 6,
    },
    {
      id: 9,
      courseId: 7,
      title: "Телефонні розмови",
      description: "Фрази для ділових телефонних розмов",
      date: "06.03.2023",
      startTime: "18:00",
      endTime: "19:30",
      homeworkId: 7,
    },
    {
      id: 10,
      courseId: 7,
      title: "Презентації",
      description: "Підготовка та проведення презентацій англійською",
      date: "13.03.2023",
      startTime: "18:00",
      endTime: "19:30",
      materials: ["presentation_tips.pdf", "example_slides.pptx"],
      homeworkId: 8,
    },
  ]
  
  export const getLessonsByCourseId = (courseId: number): Lesson[] => {
    return lessons.filter((lesson) => lesson.courseId === courseId)
  }
  
  export const getLessonById = (id: number): Lesson | undefined => {
    return lessons.find((lesson) => lesson.id === id)
  }
  
  export const getUpcomingLessons = (date: string): Lesson[] => {
    return lessons
      .filter((lesson) => new Date(lesson.date) >= new Date(date))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }
  
  export const getLessonsByDate = (date: string): Lesson[] => {
    return lessons.filter((lesson) => lesson.date === date)
  }
  
  