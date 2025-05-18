"use client"

import { useState, useEffect } from "react"
import Calendar from "react-calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import "react-calendar/dist/Calendar.css"

type ValuePiece = Date | null
type Value = ValuePiece | [ValuePiece, ValuePiece]

interface Event {
  title: string
  time: string
  color: string
  date: Date
  id?: number
}

interface ScheduleClass {
  id: number;
  description?: string;
  startAt: string;
  endAt: string;
  teacher: { name: string };
  student: { name: string };
}

interface CalendarWidgetProps {
  events: Event[]
}

export function CalendarWidget({ events: propEvents }: CalendarWidgetProps) {
  const [value, setValue] = useState<Value>(new Date())
  const [activeDate, setActiveDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>(propEvents)
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true)
        const userResponse = await fetch('/api/user')
        const userData = await userResponse.json()
        
        if (!userData.user) {
          console.error('Користувача не знайдено')
          return
        }
        
        if (userData.user.role === 'teacher') {
          const teacherResponse = await fetch('/api/teacher/current')
          const teacherData = await teacherResponse.json()
          
          if (teacherData.teacher) {
            const teacherId = teacherData.teacher.id
            const scheduleResponse = await fetch(`/api/schedule?teacherId=${teacherId}`)
            const scheduleData = await scheduleResponse.json()
            
            if (scheduleData.classes && Array.isArray(scheduleData.classes)) {
              const calendarEvents = scheduleData.classes.map((cls: ScheduleClass) => ({
                id: cls.id,
                title: cls.description || `Заняття з ${cls.student.name}`,
                time: `${new Date(cls.startAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(cls.endAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
                color: getRandomColor(),
                date: new Date(cls.startAt)
              }))
              
              const allEvents = [...propEvents, ...calendarEvents]
              const uniqueEvents = Array.from(
                new Map(allEvents.map(event => [event.id || `${event.title}-${event.time}`, event])).values()
              )
              
              setEvents(uniqueEvents)
            }
          }
        }
      } catch (error) {
        console.error('Помилка при отриманні розкладу:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchedule()
  }, [propEvents])

  function getRandomColor() {
    const colors = ['bg-blue-100', 'bg-pink-100', 'bg-yellow-100', 'bg-green-100', 'bg-purple-100']
    return colors[Math.floor(Math.random() * colors.length)]
  }
  
  const selectedDateEvents = events.filter((event) => {
    if (!value) return false
    const eventDate = new Date(event.date)
    const selectedDate = value instanceof Date ? value : new Date()

    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    )
  })

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null

    const hasEvent = events.some(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear(),
    )

    return hasEvent ? <div className="event-dot"></div> : null
  }

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return ""
    return date.getDay() === 0 || date.getDay() === 6 ? "weekend-day" : ""
  }

  const handleDateChange = (value: Value) => {
    setValue(value)
    if (value instanceof Date) {
      setActiveDate(value)
    }
  }

  const formatMonthYear = (locale: string, date: Date) => {
    return date.toLocaleDateString("uk-UA", { month: "long", year: "numeric" })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Календар</h2>
        <Button variant="link" className="text-sm text-blue-500" asChild>
          <a href="/teacher/calendar">Переглянути все</a>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{formatMonthYear("uk-UA", activeDate)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="custom-calendar-container">
            <Calendar
              onChange={handleDateChange}
              value={value}
              tileContent={tileContent}
              tileClassName={tileClassName}
              onActiveStartDateChange={({ activeStartDate }) => activeStartDate && setActiveDate(activeStartDate)}
              prevLabel="←"
              nextLabel="→"
              prev2Label={null}
              next2Label={null}
              showNeighboringMonth={false}
              className="custom-calendar"
              formatShortWeekday={(locale, date) => date.toLocaleDateString("uk-UA", { weekday: "short" }).slice(0, 3)}
            />
            <style jsx global>{`
              .custom-calendar {
                width: 100%;
                border: none;
                background: transparent;
                font-family: inherit;
              }
              .react-calendar__navigation {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
              }
              .react-calendar__navigation button {
                min-width: 32px;
                background: transparent;
                font-size: 0.875rem;
              }
              .react-calendar__navigation button:disabled {
                opacity: 0.5;
              }
              .react-calendar__navigation button:enabled:hover,
              .react-calendar__navigation button:enabled:focus {
                background-color: #f1f5f9;
                border-radius: 0.25rem;
              }
              .react-calendar__month-view__weekdays {
                font-size: 0.75rem;
                font-weight: 500;
                color: #64748b;
                text-transform: uppercase;
              }
              .react-calendar__month-view__weekdays__weekday {
                padding: 0.5rem 0;
                text-align: center;
              }
              .react-calendar__month-view__weekdays__weekday abbr {
                text-decoration: none;
              }
              .react-calendar__tile {
                padding: 0.75rem 0.5rem;
                font-size: 0.875rem;
                position: relative;
                text-align: center;
                border-radius: 0.25rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 2px;
              }
              .react-calendar__tile:enabled:hover,
              .react-calendar__tile:enabled:focus {
                background-color: #f1f5f9;
              }
              .react-calendar__tile--active {
                background-color: #3b82f6;
                color: white;
              }
              .react-calendar__tile--now {
                background-color: transparent;
                color: #3b82f6;
                font-weight: 600;
              }
              .react-calendar__tile--now.react-calendar__tile--active {
                background-color: #3b82f6;
                color: white;
              }
              .weekend-day {
                color: #ef4444;
              }
              .react-calendar__month-view__days__day--neighboringMonth {
                color: #94a3b8;
              }
              .event-dot {
                width: 4px;
                height: 4px;
                background-color: #3b82f6;
                border-radius: 50%;
                margin-top: 2px;
              }
            `}</style>
          </div>

          {isLoading ? (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Завантаження занять...
            </div>
          ) : selectedDateEvents.length > 0 ? (
            <div className="mt-4 space-y-2">
              <div className="text-xs font-medium">
                Заняття на{" "}
                {value instanceof Date
                  ? value.toLocaleDateString("uk-UA", { month: "long", day: "numeric" })
                  : "сьогодні"}
              </div>
              {selectedDateEvents.map((event, index) => (
                <div key={event.id || index} className={`rounded-md ${event.color} p-2 text-sm`}>
                  <div className="font-medium">{event.title}</div>
                  <div className="text-xs text-muted-foreground">{event.time}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              На цю дату немає занять
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
