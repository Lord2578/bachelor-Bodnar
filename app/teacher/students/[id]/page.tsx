/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { getStudentById } from "@/mock/students"
import { getStudentCourses } from "@/mock/courses"
import { getStudentProgress } from "@/mock/progress"
import { getStudentAttendance } from "@/mock/attendance"
import { getStudentNotes, addNote } from "@/mock/notes"
import { getStudentHomework, addHomework } from "@/mock/homework"
import { getLessonsByCourseId } from "@/mock/lessons"
import { levelDescriptions } from "@/mock/levels"
import { CustomCard, CustomCardHeader, CustomCardTitle, CustomCardContent } from "@/components/ui/custom-card"
import { CustomButton } from "@/components/ui/custom-button"
import { CustomTabs, CustomTabsList, CustomTabsTrigger, CustomTabsContent } from "@/components/ui/custom-tabs"

export default function StudentPage() {
  const params = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<any | null>(null)
  const [studentCourses, setStudentCourses] = useState<any[]>([])
  const [studentProgress, setStudentProgress] = useState<any[]>([])
  const [studentAttendance, setStudentAttendance] = useState<any[]>([])
  const [studentNotes, setStudentNotes] = useState<any[]>([])
  const [studentHomework, setStudentHomework] = useState<any[]>([])
  const [courseLessons, setCourseLessons] = useState<any[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [newNote, setNewNote] = useState("")
  const [newHomework, setNewHomework] = useState({
    title: "",
    description: "",
    dueDate: "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const studentId = Number(params.id)
    const foundStudent = getStudentById(studentId)

    if (foundStudent) {
      setStudent(foundStudent)

      const courses = getStudentCourses(studentId, foundStudent.courses)
      setStudentCourses(courses)

      if (courses.length > 0) {
        setSelectedCourseId(courses[0].id)
        const lessons = getLessonsByCourseId(courses[0].id)
        setCourseLessons(lessons)
      }

      const progress = getStudentProgress(studentId)
      setStudentProgress(progress)

      const attendance = getStudentAttendance(studentId)
      setStudentAttendance(attendance)

      const notes = getStudentNotes(studentId)
      setStudentNotes(notes)

      const homework = getStudentHomework(studentId)
      setStudentHomework(homework)
    }

    setLoading(false)
  }, [params.id])

  const handleCourseChange = (courseId: number) => {
    setSelectedCourseId(courseId)
    const lessons = getLessonsByCourseId(courseId)
    setCourseLessons(lessons)
  }

  const handleAddNote = () => {
    if (newNote.trim() && student) {
      const note = addNote({
        studentId: student.id,
        teacherId: 1, 
        text: newNote,
        date: new Date().toLocaleDateString("uk-UA"),
        isPrivate: false,
      })

      setStudentNotes([...studentNotes, note])
      setNewNote("")
    }
  }

  const handleAddHomework = () => {
    if (
      newHomework.title.trim() &&
      newHomework.description.trim() &&
      newHomework.dueDate &&
      selectedCourseId &&
      student
    ) {
      const homework = addHomework({
        studentId: student.id,
        courseId: selectedCourseId,
        title: newHomework.title,
        description: newHomework.description,
        assignedDate: new Date().toLocaleDateString("uk-UA"),
        dueDate: newHomework.dueDate,
        status: "assigned",
      })

      setStudentHomework([...studentHomework, homework])
      setNewHomework({
        title: "",
        description: "",
        dueDate: "",
      })
    }
  }

  if (loading) {
    return <div className="flex-1 p-8 flex items-center justify-center">Завантаження...</div>
  }

  if (!student) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Студента не знайдено</h2>
        <CustomButton onClick={() => router.back()}>Повернутися назад</CustomButton>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{student.name}</h2>
        <CustomButton onClick={() => router.back()}>Повернутися до списку</CustomButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CustomCard className="md:col-span-1">
          <CustomCardHeader>
            <CustomCardTitle>Основна інформація</CustomCardTitle>
          </CustomCardHeader>
          <CustomCardContent className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                {student.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Рівень:</span>
                <span className="font-medium">
                  {student.level} ({levelDescriptions[student.level as keyof typeof levelDescriptions]})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{student.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Телефон:</span>
                <span className="font-medium">{student.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Дата народження:</span>
                <span className="font-medium">{student.birthdate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Дата реєстрації:</span>
                <span className="font-medium">{student.enrollmentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Остання активність:</span>
                <span className="font-medium">{student.lastActivity}</span>
              </div>
            </div>
          </CustomCardContent>
        </CustomCard>

        <CustomCard className="md:col-span-2">
          <CustomCardHeader>
            <CustomCardTitle>Детальна інформація</CustomCardTitle>
          </CustomCardHeader>
          <CustomCardContent>
            <CustomTabs defaultValue="attendance">
              <CustomTabsList className="mb-4">
                <CustomTabsTrigger value="attendance">Відвідуваність</CustomTabsTrigger>
                <CustomTabsTrigger value="homework">Домашні завдання</CustomTabsTrigger>
                <CustomTabsTrigger value="notes">Нотатки</CustomTabsTrigger>
              </CustomTabsList>

              <CustomTabsContent value="attendance" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Відвідуваність занять</h3>
                  {studentCourses.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Курс:</span>
                      <select
                        className="border p-1 rounded text-sm"
                        value={selectedCourseId || ""}
                        onChange={(e) => handleCourseChange(Number(e.target.value))}
                      >
                        {studentCourses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {studentAttendance.length > 0 ? (
                  studentAttendance
                    .filter((att) => selectedCourseId === null || att.courseId === selectedCourseId)
                    .map((attendance, index) => {
                      const course = studentCourses.find((c) => c.id === attendance.courseId)
                      return (
                        <div key={index} className="border rounded-md p-4">
                          <div className="font-medium mb-2">{course?.name || `Курс #${attendance.courseId}`}</div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="text-sm">Загальна відвідуваність: </div>
                            <div className="font-medium">{attendance.overallAttendance}%</div>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden ml-2">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${attendance.overallAttendance}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {attendance.lessons.map((lesson: any, i: number) => (
                              <div
                                key={i}
                                className={`p-2 rounded-md flex justify-between items-center ${
                                  lesson.attended ? "bg-green-50" : "bg-red-50"
                                }`}
                              >
                                <div>
                                  <div className="font-medium">{lesson.name}</div>
                                  <div className="text-xs text-muted-foreground">{lesson.date}</div>
                                </div>
                                <div className={`text-sm ${lesson.attended ? "text-green-600" : "text-red-600"}`}>
                                  {lesson.attended ? "Відвідав" : "Пропустив"}
                                  {!lesson.attended && lesson.reason && (
                                    <div className="text-xs text-muted-foreground">Причина: {lesson.reason}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })
                ) : (
                  <div className="text-center text-muted-foreground">Немає даних про відвідуваність</div>
                )}
              </CustomTabsContent>

              <CustomTabsContent value="homework" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Домашні завдання</h3>
                  {studentCourses.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Курс:</span>
                      <select
                        className="border p-1 rounded text-sm"
                        value={selectedCourseId || ""}
                        onChange={(e) => handleCourseChange(Number(e.target.value))}
                      >
                        {studentCourses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {studentHomework.length > 0 ? (
                  <div className="space-y-3">
                    {studentHomework
                      .filter((hw) => selectedCourseId === null || hw.courseId === selectedCourseId)
                      .map((homework, index) => {
                        const course = studentCourses.find((c) => c.id === homework.courseId)
                        return (
                          <div
                            key={index}
                            className={`p-3 border rounded-md ${
                              homework.status === "graded"
                                ? "bg-green-50"
                                : homework.status === "submitted"
                                  ? "bg-blue-50"
                                  : homework.status === "late"
                                    ? "bg-yellow-50"
                                    : homework.status === "missed"
                                      ? "bg-red-50"
                                      : "bg-gray-50"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{homework.title}</div>
                                <div className="text-sm">{course?.name || `Курс #${homework.courseId}`}</div>
                              </div>
                              <div className="text-sm">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    homework.status === "graded"
                                      ? "bg-green-200 text-green-800"
                                      : homework.status === "submitted"
                                        ? "bg-blue-200 text-blue-800"
                                        : homework.status === "late"
                                          ? "bg-yellow-200 text-yellow-800"
                                          : homework.status === "missed"
                                            ? "bg-red-200 text-red-800"
                                            : "bg-gray-200 text-gray-800"
                                  }`}
                                >
                                  {homework.status === "graded"
                                    ? "Оцінено"
                                    : homework.status === "submitted"
                                      ? "Здано"
                                      : homework.status === "late"
                                        ? "Прострочено"
                                        : homework.status === "missed"
                                          ? "Пропущено"
                                          : "Призначено"}
                                </span>
                              </div>
                            </div>
                            <div className="text-sm mt-2">{homework.description}</div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <div>Призначено: {homework.assignedDate}</div>
                              <div>Термін: {homework.dueDate}</div>
                            </div>
                            {homework.grade && (
                              <div className="mt-2 text-sm">
                                <span className="font-medium">Оцінка: {homework.grade}/100</span>
                              </div>
                            )}
                            {homework.feedback && (
                              <div className="mt-1 text-sm text-muted-foreground">
                                <span className="font-medium">Відгук:</span> {homework.feedback}
                              </div>
                            )}
                            {homework.attachments && homework.attachments.length > 0 && (
                              <div className="mt-2 text-sm">
                                <span className="font-medium">Вкладення:</span>
                                <div className="flex gap-2 mt-1">
                                  {homework.attachments.map((attachment: any, i: number) => (
                                    <div key={i} className="px-2 py-1 bg-muted rounded text-xs">
                                      {attachment}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">Немає домашніх завдань</div>
                )}

                <div className="mt-6 border-t pt-4">
                  <h3 className="text-lg font-medium mb-3">Додати нове домашнє завдання</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Курс</label>
                      <select
                        className="w-full border p-2 rounded"
                        value={selectedCourseId || ""}
                        onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                      >
                        <option value="">Виберіть курс</option>
                        {studentCourses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Назва завдання</label>
                      <input
                        type="text"
                        className="w-full border p-2 rounded"
                        value={newHomework.title}
                        onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
                        placeholder="Введіть назву завдання"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Опис завдання</label>
                      <textarea
                        className="w-full border p-2 rounded min-h-[100px]"
                        value={newHomework.description}
                        onChange={(e) => setNewHomework({ ...newHomework, description: e.target.value })}
                        placeholder="Введіть опис завдання"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Термін виконання</label>
                      <input
                        type="date"
                        className="w-full border p-2 rounded"
                        value={newHomework.dueDate}
                        onChange={(e) => setNewHomework({ ...newHomework, dueDate: e.target.value })}
                      />
                    </div>
                    <CustomButton onClick={handleAddHomework}>Додати завдання</CustomButton>
                  </div>
                </div>
              </CustomTabsContent>

              <CustomTabsContent value="notes" className="space-y-4">
                {studentNotes.length > 0 ? (
                  <div className="space-y-2">
                    {studentNotes.map((note, index) => (
                      <div key={index} className="p-4 border rounded-md bg-muted/50">
                        <p>{note.text}</p>
                        <div className="mt-2 text-xs text-muted-foreground">Додано: {note.date}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">Немає нотаток</div>
                )}

                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Додати нотатку</h3>
                  <textarea
                    className="w-full p-2 border rounded-md min-h-[100px]"
                    placeholder="Введіть нотатку про студента..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  ></textarea>
                  <CustomButton className="mt-2" onClick={handleAddNote}>
                    Зберегти нотатку
                  </CustomButton>
                </div>
              </CustomTabsContent>
            </CustomTabs>
          </CustomCardContent>
        </CustomCard>
      </div>
    </div>
  )
}

