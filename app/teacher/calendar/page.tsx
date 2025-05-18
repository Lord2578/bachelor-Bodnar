"use client";

import { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

const localizer = momentLocalizer(moment);

interface ScheduleClass {
  id: number;
  startAt: string;
  endAt: string;
  description: string;
  isCompleted: boolean;
  teacher: {
    id: number;
    name: string;
  };
  student: {
    id: number;
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
  isCompleted: boolean;
}

interface Student {
  id: number;
  userId: number;
  name: string;
  email: string;
}

interface Teacher {
  id: number;
  userId: number;
  name: string;
}

export default function TeacherCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    description: '',
  });
  const [error, setError] = useState('');
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const teacherResponse = await fetch('/api/teacher/current');
        if (!teacherResponse.ok) throw new Error('Помилка отримання даних вчителя');
        const teacherData = await teacherResponse.json();
        setCurrentTeacher(teacherData.teacher);
        
        const studentsResponse = await fetch('/api/teacher/students');
        if (!studentsResponse.ok) throw new Error('Помилка отримання студентів');
        const studentsData = await studentsResponse.json();
        setStudents(studentsData.students);
        
        if (teacherData.teacher.id) {
          const scheduleResponse = await fetch(`/api/schedule?teacherId=${teacherData.teacher.id}`);
          if (!scheduleResponse.ok) throw new Error('Помилка отримання розкладу');
          const scheduleData = await scheduleResponse.json();
          
          const transformedEvents = transformClasses(scheduleData.classes);
          setEvents(transformedEvents);
        }
      } catch (error) {
        console.error('Помилка завантаження даних:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleAddClass = () => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;
    
    const endTime = new Date(now.getTime() + 60 * 60 * 1000);
    const endHour = endTime.getHours().toString().padStart(2, '0');
    const endMinute = endTime.getMinutes().toString().padStart(2, '0');
    const endTimeString = `${endHour}:${endMinute}`;
    
    setFormData({
      studentId: '',
      startDate: currentDate,
      startTime: currentTime,
      endDate: currentDate,
      endTime: endTimeString,
      description: '',
    });
    
    setError('');
    setShowForm(true);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (!formData.studentId || !formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
        setError('Всі поля, крім опису, обов\'язкові');
        return;
      }
      
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      
      if (endDateTime <= startDateTime) {
        setError('Час закінчення має бути пізніше часу початку');
        return;
      }
      
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: currentTeacher?.id,
          studentId: formData.studentId,
          startAt: startDateTime.toISOString(),
          endAt: endDateTime.toISOString(),
          description: formData.description
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка при створенні заняття');
      }
      
      const responseData = await response.json();
      
      const student = students.find(s => s.id.toString() === formData.studentId);
      
      const newEvent: CalendarEvent = {
        id: responseData.classId,
        title: `Заняття з ${student?.name || 'студентом'}`,
        start: startDateTime,
        end: endDateTime,
        description: formData.description,
        studentId: Number(formData.studentId),
        teacherId: currentTeacher?.id || 0,
        isCompleted: false
      };
      
      setEvents(prev => [...prev, newEvent]);
      setShowForm(false);
    } catch (error: unknown) {
      console.error('Помилка при створенні заняття:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Виникла помилка при створенні заняття');
      }
    }
  };
  
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
  
  const transformClasses = (classes: ScheduleClass[]): CalendarEvent[] => {
    return classes.map(cls => ({
      id: cls.id,
      title: cls.description || `Заняття з ${cls.student.name}`,
      start: new Date(cls.startAt),
      end: new Date(cls.endAt),
      description: cls.description,
      studentId: cls.student.id,
      teacherId: cls.teacher.id,
      isCompleted: cls.isCompleted
    }));
  };
  
  const handleToggleCompleted = async (event: CalendarEvent) => {
    try {
      const response = await fetch('/api/schedule/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: event.id,
          isCompleted: !event.isCompleted,
        }),
      });
      
      if (response.ok) {
        setEvents(prev => 
          prev.map(ev => 
            ev.id === event.id 
              ? { ...ev, isCompleted: !event.isCompleted } 
              : ev
          )
        );
        
        setShowEventDetails(false);
        
        try {
          const currentMonth = format(new Date(), 'yyyy-MM');
          
          const teacherId = event.teacherId;
          
          console.log(`Оновлюємо розрахунок зарплати для вчителя ID=${teacherId} після зміни статусу заняття`);
          
          await fetch('/api/teacher/payouts/recalculate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              teacherId,
              month: currentMonth,
            }),
          });
        } catch (payoutError) {
          console.error('Помилка при оновленні розрахунку зарплати:', payoutError);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Помилка при оновленні статусу заняття');
      }
    } catch (error) {
      console.error('Error updating class status:', error);
      setError('Помилка при оновленні статусу заняття');
    }
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Завантаження...</div>;
  }
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Календар занять</h2>
        <Button onClick={handleAddClass}>Додати заняття</Button>
      </div>
      
      {showForm && (
        <div className="mb-8 p-6 border rounded-lg bg-gray-50">
          <h3 className="text-xl mb-4 font-bold">Нове заняття</h3>
          
          {error && (
            <div className="mb-4 p-3 border border-red-500 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Студент</label>
              <select 
                name="studentId" 
                value={formData.studentId} 
                onChange={handleFormChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Виберіть студента</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">Дата початку</label>
                <input 
                  type="date" 
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleFormChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Час початку</label>
                <input 
                  type="time" 
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleFormChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Дата закінчення</label>
                <input 
                  type="date" 
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleFormChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Час закінчення</label>
                <input 
                  type="time" 
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleFormChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Опис</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className="w-full p-2 border rounded-md h-24"
                placeholder="Введіть опис заняття"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Скасувати
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Зберегти
              </button>
            </div>
          </form>
        </div>
      )}
      
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
              <div>
                <span className="font-medium">Студент:</span> {students.find(s => s.id === selectedEvent.studentId)?.name || 'Невідомо'}
              </div>
              <div>
                <span className="font-medium">Статус:</span> {selectedEvent.isCompleted ? 'Проведено' : 'Не проведено'}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <button 
                onClick={() => handleToggleCompleted(selectedEvent)}
                className={`px-4 py-2 text-white rounded-md ${
                  selectedEvent.isCompleted 
                    ? 'bg-yellow-600 hover:bg-yellow-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {selectedEvent.isCompleted ? 'Позначити як не проведене' : 'Позначити як проведене'}
              </button>
              <button 
                onClick={() => setShowEventDetails(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-4 h-[70vh]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          views={['month', 'week', 'day']}
          tooltipAccessor={event => `${event.title}\n${event.description}\n${event.isCompleted ? '✓ Проведено' : '○ Не проведено'}`}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.isCompleted ? '#16a34a' : '#3174ad',
              borderColor: event.isCompleted ? '#15803d' : '#265985',
            }
          })}
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
    </div>
  );
}
