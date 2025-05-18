"use client";

import { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface ScheduleClass {
  id: number;
  startAt: string;
  endAt: string;
  description: string;
  teacher: {
    id: number;
    userId: number;
    name: string;
  };
  student: {
    id: number;
    userId: number;
    name: string;
  };
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  description: string;
  studentId: number;
  teacherId: number;
}

export default function StudentCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const userResponse = await fetch('/api/user');
        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          console.error('Помилка API користувача:', errorData);
          throw new Error(`Помилка отримання даних користувача: ${errorData.message || 'Невідома помилка'}`);
        }
        const userData = await userResponse.json();
        console.log('Дані користувача:', userData);
        
        if (!userData || !userData.user || !userData.user.id) {
          throw new Error('Некоректні дані користувача');
        }
        
        console.log('ID користувача:', userData.user.id);
        console.log('Роль користувача:', userData.user.role);
        
        if (userData.user.role !== 'student') {
          throw new Error('Доступ дозволено лише студентам');
        }
        
        const studentQueryResponse = await fetch(`/api/students?userId=${userData.user.id}`);
        if (!studentQueryResponse.ok) {
          const errorData = await studentQueryResponse.json();
          console.error('Помилка запиту студента:', errorData);
          throw new Error(`Помилка отримання ID студента: ${errorData.message || 'Невідома помилка'}`);
        }
        const studentQueryData = await studentQueryResponse.json();
        console.log('Результат запиту студента:', studentQueryData);
        
        if (!studentQueryData.students || !studentQueryData.students.length) {
          throw new Error('Студента не знайдено');
        }
        
        const studentData = studentQueryData.students[0];
        
        const scheduleResponse = await fetch(`/api/schedule?studentId=${studentData.id}`);
        if (!scheduleResponse.ok) {
          const errorData = await scheduleResponse.json();
          console.error('Помилка API розкладу:', errorData);
          throw new Error(`Помилка отримання розкладу: ${errorData.message || 'Невідома помилка'}`);
        }
        const scheduleData = await scheduleResponse.json();
        console.log('Дані розкладу:', scheduleData);
        
        if (!scheduleData.classes || !Array.isArray(scheduleData.classes)) {
          throw new Error('Некоректні дані розкладу');
        }
        
        const calendarEvents = scheduleData.classes.map((classItem: ScheduleClass) => ({
          id: classItem.id,
          title: `Заняття з ${classItem.teacher.name}`,
          start: new Date(classItem.startAt),
          end: new Date(classItem.endAt),
          description: classItem.description,
          studentId: classItem.student.id,
          teacherId: classItem.teacher.id
        }));
        
        setEvents(calendarEvents);
      } catch (error: unknown) {
        console.error('Помилка завантаження даних:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Виникла помилка при завантаженні даних');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    const fetchData = async () => {
      try {
        const userResponse = await fetch('/api/user');
        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          throw new Error(`Помилка отримання даних користувача: ${errorData.message || 'Невідома помилка'}`);
        }
        const userData = await userResponse.json();
        
        if (!userData || !userData.user || !userData.user.id) {
          throw new Error('Некоректні дані користувача');
        }
        
        console.log('ID користувача:', userData.user.id);
        console.log('Роль користувача:', userData.user.role);
        
        if (userData.user.role !== 'student') {
          throw new Error('Доступ дозволено лише студентам');
        }
        
        const studentQueryResponse = await fetch(`/api/students?userId=${userData.user.id}`);
        if (!studentQueryResponse.ok) {
          const errorData = await studentQueryResponse.json();
          console.error('Помилка запиту студента:', errorData);
          throw new Error(`Помилка отримання ID студента: ${errorData.message || 'Невідома помилка'}`);
        }
        const studentQueryData = await studentQueryResponse.json();
        console.log('Результат запиту студента:', studentQueryData);
        
        if (!studentQueryData.students || !studentQueryData.students.length) {
          throw new Error('Студента не знайдено');
        }
        
        const studentData = studentQueryData.students[0];
        
        const scheduleResponse = await fetch(`/api/schedule?studentId=${studentData.id}`);
        if (!scheduleResponse.ok) {
          const errorData = await scheduleResponse.json();
          throw new Error(`Помилка отримання розкладу: ${errorData.message || 'Невідома помилка'}`);
        }
        const scheduleData = await scheduleResponse.json();
        
        if (!scheduleData.classes || !Array.isArray(scheduleData.classes)) {
          throw new Error('Некоректні дані розкладу');
        }
        
        const calendarEvents = scheduleData.classes.map((classItem: ScheduleClass) => ({
          id: classItem.id,
          title: `Заняття з ${classItem.teacher.name}`,
          start: new Date(classItem.startAt),
          end: new Date(classItem.endAt),
          description: classItem.description,
          studentId: classItem.student.id,
          teacherId: classItem.teacher.id
        }));
        
        setEvents(calendarEvents);
      } catch (error: unknown) {
        console.error('Помилка завантаження даних:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Виникла помилка при завантаженні даних');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-700">Завантаження розкладу...</p>
      </div>
    </div>;
  }
  
  if (error) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-bold text-gray-800 mb-3">Помилка завантаження</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
        >
          Спробувати ще раз
        </button>
      </div>
    </div>;
  }
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Мій розклад занять</h2>
      </div>
      
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
              <button 
                onClick={() => setShowEventDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="font-medium">Початок:</span> {formatDate(selectedEvent.start)}
              </div>
              <div>
                <span className="font-medium">Кінець:</span> {formatDate(selectedEvent.end)}
              </div>
              {selectedEvent.description && (
                <div>
                  <span className="font-medium">Опис:</span> {selectedEvent.description}
                </div>
              )}
            </div>
            
            <div className="mt-6 text-right">
              <button 
                onClick={() => setShowEventDetails(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}
      
      {events.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">Немає запланованих занять</h3>
          <p className="text-gray-500">
            У вашому розкладі поки немає занять. Вони з&apos;являться тут, коли вчитель додасть їх.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-4 h-[70vh]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={['month', 'week', 'day']}
            tooltipAccessor={event => `${event.title}\n${event.description}`}
            onSelectEvent={handleSelectEvent}
            messages={{
              today: 'Сьогодні',
              previous: 'Назад',
              next: 'Вперед',
              month: 'Місяць',
              week: 'Тиждень',
              day: 'День',
              agenda: 'Розклад',
              date: 'Дата',
              time: 'Час',
              event: 'Подія',
              noEventsInRange: 'Немає занять в цьому діапазоні'
            }}
          />
        </div>
      )}
    </div>
  );
}
