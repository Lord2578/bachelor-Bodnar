"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Student {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  englishLevel?: string;
  assignedAt: string;
}

interface HomeworkAssignment {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  title: string;
  description: string | null;
  notes: string | null;
  dueDate: string | null;
  isCompleted: boolean;
  assignedAt: string;
  classId: number | null;
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const [homeworkList, setHomeworkList] = useState<HomeworkAssignment[]>([]);
  const [showHomeworkForm, setShowHomeworkForm] = useState(false);
  const [editingHomework, setEditingHomework] = useState<HomeworkAssignment | null>(null);
  const [homeworkFormData, setHomeworkFormData] = useState({
    title: '',
    description: '',
    notes: '',
    dueDate: '',
    studentId: 0
  });
  const [homeworkMessage, setHomeworkMessage] = useState({ text: '', type: '' });
  const [homeworkLoading, setHomeworkLoading] = useState(false);
  
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/teacher/students');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Помилка отримання списку студентів');
        }
        
        const data = await response.json();
        console.log('Отримані дані про студентів:', data);
        
        if (!data.students || !Array.isArray(data.students)) {
          throw new Error('Некоректні дані про студентів');
        }
        
        setStudents(data.students);
      } catch (error: unknown) {
        console.error('Помилка при завантаженні даних:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Виникла помилка при завантаженні даних');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStudents();
  }, []);

  const fetchHomeworkForStudent = async (studentId: number) => {
    setHomeworkLoading(true);
    
    try {
      const response = await fetch(`/api/teacher/homework?studentId=${studentId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка отримання домашніх завдань');
      }
      
      const data = await response.json();
      if (!data.homework || !Array.isArray(data.homework)) {
        throw new Error('Некоректні дані про домашні завдання');
      }
      
      setHomeworkList(data.homework);
    } catch (error: unknown) {
      console.error('Помилка при завантаженні домашніх завдань:', error);
      setHomeworkMessage({
        text: error instanceof Error ? error.message : 'Виникла помилка при завантаженні домашніх завдань',
        type: 'error'
      });
    } finally {
      setHomeworkLoading(false);
    }
  };
  
  const handleShowDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowDetails(true);
    fetchHomeworkForStudent(student.id);
  };
  
  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedStudent(null);
    setHomeworkList([]);
    resetHomeworkForm();
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      console.error('Помилка форматування дати:', e);
      return 'Некоректна дата';
    }
  };

  const formatSimpleDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      console.error('Помилка форматування дати:', e);
      return 'Некоректна дата';
    }
  };
  
  const handleHomeworkFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHomeworkFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const resetHomeworkForm = () => {
    setHomeworkFormData({
      title: '',
      description: '',
      notes: '',
      dueDate: '',
      studentId: selectedStudent?.id || 0
    });
    setEditingHomework(null);
    setShowHomeworkForm(false);
  };
  
  const handleShowHomeworkForm = (studentId: number) => {
    resetHomeworkForm();
    setHomeworkFormData(prev => ({ ...prev, studentId }));
    setShowHomeworkForm(true);
  };
  
  const handleEditHomework = (homework: HomeworkAssignment) => {
    setEditingHomework(homework);
    setHomeworkFormData({
      title: homework.title,
      description: homework.description || '',
      notes: homework.notes || '',
      dueDate: homework.dueDate ? new Date(homework.dueDate).toISOString().split('T')[0] : '',
      studentId: homework.studentId
    });
    setShowHomeworkForm(true);
  };
  
  const handleSubmitHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    setHomeworkLoading(true);
    
    try {
      const endpoint = editingHomework 
        ? '/api/teacher/homework' 
        : '/api/teacher/homework';
      
      const method = editingHomework ? 'PATCH' : 'POST';
      
      const payload = editingHomework
        ? {
            homeworkId: editingHomework.id,
            title: homeworkFormData.title,
            description: homeworkFormData.description || null,
            notes: homeworkFormData.notes || null,
            dueDate: homeworkFormData.dueDate || null
          }
        : {
            studentId: homeworkFormData.studentId,
            title: homeworkFormData.title,
            description: homeworkFormData.description || null,
            notes: homeworkFormData.notes || null,
            dueDate: homeworkFormData.dueDate || null
          };
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка при збереженні домашнього завдання');
      }
      
      await response.json();
      
      setHomeworkMessage({
        text: editingHomework 
          ? 'Домашнє завдання успішно оновлено' 
          : 'Домашнє завдання успішно створено',
        type: 'success'
      });
      
      if (selectedStudent) {
        fetchHomeworkForStudent(selectedStudent.id);
      }
      
      resetHomeworkForm();
      
    } catch (error: unknown) {
      console.error('Помилка при збереженні домашнього завдання:', error);
      setHomeworkMessage({
        text: error instanceof Error ? error.message : 'Виникла помилка при збереженні домашнього завдання',
        type: 'error'
      });
    } finally {
      setHomeworkLoading(false);
    }
  };
  
  const handleToggleComplete = async (homework: HomeworkAssignment) => {
    setHomeworkLoading(true);
    
    try {
      const response = await fetch('/api/teacher/homework', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          homeworkId: homework.id,
          isCompleted: !homework.isCompleted
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка при оновленні статусу завдання');
      }
      
      if (selectedStudent) {
        fetchHomeworkForStudent(selectedStudent.id);
      }
      
    } catch (error: unknown) {
      console.error('Помилка при оновленні статусу завдання:', error);
      setHomeworkMessage({
        text: error instanceof Error ? error.message : 'Виникла помилка при оновленні статусу завдання',
        type: 'error'
      });
    } finally {
      setHomeworkLoading(false);
    }
  };
  
  const handleDeleteHomework = async (homeworkId: number) => {
    if (!confirm('Ви впевнені, що хочете видалити це домашнє завдання?')) {
      return;
    }
    
    setHomeworkLoading(true);
    
    try {
      const response = await fetch(`/api/teacher/homework/${homeworkId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка при видаленні завдання');
      }
      
      setHomeworkMessage({
        text: 'Домашнє завдання успішно видалено',
        type: 'success'
      });
      
      if (selectedStudent) {
        fetchHomeworkForStudent(selectedStudent.id);
      }
      
    } catch (error: unknown) {
      console.error('Помилка при видаленні завдання:', error);
      setHomeworkMessage({
        text: error instanceof Error ? error.message : 'Виникла помилка при видаленні завдання',
        type: 'error'
      });
    } finally {
      setHomeworkLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Завантаження списку студентів...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Помилка завантаження</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
          >
            Спробувати ще раз
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Мої студенти</h2>
      </div>
      
      {showDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center z-50 p-2 md:p-4 overflow-y-auto pt-4 md:pt-8">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto my-2 md:my-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg md:text-xl font-bold break-words pr-2">{selectedStudent.name}</h3>
              <button 
                onClick={handleCloseDetails}
                className="text-gray-500 hover:text-gray-700 p-1"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              <div>
                <p className="text-gray-500 text-xs md:text-sm">ID:</p>
                <p className="font-medium text-sm md:text-base">{selectedStudent.id}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs md:text-sm">Ім&apos;я:</p>
                <p className="font-medium text-sm md:text-base">{selectedStudent.firstName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs md:text-sm">Прізвище:</p>
                <p className="font-medium text-sm md:text-base">{selectedStudent.lastName}</p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <p className="text-gray-500 text-xs md:text-sm">Email:</p>
                <p className="font-medium text-sm md:text-base break-words">{selectedStudent.email}</p>
              </div>
              {selectedStudent.englishLevel && (
                <div>
                  <p className="text-gray-500 text-xs md:text-sm">Рівень англійської:</p>
                  <p className="font-medium text-sm md:text-base">{selectedStudent.englishLevel}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500 text-xs md:text-sm">Дата призначення:</p>
                <p className="font-medium text-sm md:text-base">{formatDate(selectedStudent.assignedAt)}</p>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                <h4 className="text-base md:text-lg font-semibold">Домашні завдання</h4>
                <Button 
                  onClick={() => handleShowHomeworkForm(selectedStudent.id)}
                  variant="outline"
                  className="text-sm w-full sm:w-auto"
                >
                  Додати нове завдання
                </Button>
              </div>
              
              {homeworkMessage.text && (
                <div className={`p-3 rounded mb-4 ${
                  homeworkMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {homeworkMessage.text}
                </div>
              )}
              
              {showHomeworkForm && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h5 className="font-medium mb-3">
                    {editingHomework ? 'Редагувати завдання' : 'Нове домашнє завдання'}
                  </h5>
                  
                  <form onSubmit={handleSubmitHomework}>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Назва завдання*</label>
                        <Input
                          name="title"
                          value={homeworkFormData.title}
                          onChange={handleHomeworkFormChange}
                          required
                          placeholder="Введіть назву завдання"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Опис завдання</label>
                        <Textarea
                          name="description"
                          value={homeworkFormData.description}
                          onChange={handleHomeworkFormChange}
                          placeholder="Детальний опис домашнього завдання"
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Замітки</label>
                        <Textarea
                          name="notes"
                          value={homeworkFormData.notes}
                          onChange={handleHomeworkFormChange}
                          placeholder="Додаткові замітки для студента"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Дата здачі</label>
                        <Input
                          type="date"
                          name="dueDate"
                          value={homeworkFormData.dueDate}
                          onChange={handleHomeworkFormChange}
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetHomeworkForm}
                          disabled={homeworkLoading}
                        >
                          Скасувати
                        </Button>
                        <Button 
                          type="submit"
                          disabled={homeworkLoading || !homeworkFormData.title}
                        >
                          {homeworkLoading ? 'Збереження...' : editingHomework ? 'Оновити' : 'Зберегти'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
              
              {homeworkLoading && !showHomeworkForm ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-3"></div>
                  <p className="text-gray-500">Завантаження завдань...</p>
                </div>
              ) : homeworkList.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <p className="text-gray-500">У цього студента ще немає домашніх завдань</p>
                  <button
                    onClick={() => handleShowHomeworkForm(selectedStudent.id)}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Створити перше завдання
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {homeworkList.map(homework => (
                    <div 
                      key={homework.id} 
                      className={`border rounded-lg p-3 md:p-4 ${
                        homework.isCompleted ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <input
                              type="checkbox"
                              checked={homework.isCompleted}
                              onChange={() => handleToggleComplete(homework)}
                              className="h-4 w-4"
                            />
                            <h6 className={`font-medium text-sm md:text-base ${
                              homework.isCompleted ? 'line-through text-gray-500' : ''
                            }`}>
                              {homework.title}
                            </h6>
                          </div>
                          
                          {homework.description && (
                            <p className="text-xs md:text-sm text-gray-700 mt-2">{homework.description}</p>
                          )}
                          
                          {homework.notes && (
                            <div className="mt-3 text-xs md:text-sm">
                              <span className="font-medium">Замітки: </span>
                              <span className="text-gray-600">{homework.notes}</span>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
                            <span>Створено: {formatDate(homework.assignedAt)}</span>
                            {homework.dueDate && (
                              <span className={`${
                                new Date(homework.dueDate) < new Date() && !homework.isCompleted 
                                  ? 'text-red-500 font-medium' 
                                  : ''
                              }`}>
                                Термін здачі: {formatSimpleDate(homework.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-2 md:mt-0 justify-end">
                          <button
                            onClick={() => handleEditHomework(homework)}
                            className="text-blue-600 hover:text-blue-800 text-sm py-1 px-2 border border-blue-200 rounded"
                          >
                            Редагувати
                          </button>
                          <button
                            onClick={() => handleDeleteHomework(homework.id)}
                            className="text-red-600 hover:text-red-800 text-sm py-1 px-2 border border-red-200 rounded"
                          >
                            Видалити
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-8 border-t pt-4 text-right">
              <Button
                onClick={handleCloseDetails}
                variant="outline"
              >
                Закрити
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {students.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">У вас ще немає призначених студентів</h3>
          <p className="text-gray-500">
            Адміністратор має призначити вам студентів. Зверніться до адміністратора для отримання доступу до студентів.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map(student => (
            <Card key={student.id} className="overflow-hidden hover:shadow-md transition-shadow border border-gray-100">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">{student.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-gray-500 mb-3 break-words">{student.email}</p>
                {student.englishLevel && (
                  <p className="text-sm mb-2">
                    <span className="font-medium">Рівень: </span>
                    {student.englishLevel}
                  </p>
                )}
                <p className="text-xs text-gray-400 mb-3">
                  Призначено: {formatDate(student.assignedAt)}
                </p>
                <button
                  onClick={() => handleShowDetails(student)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Детальніше та завдання
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
