"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import Link from 'next/link';

interface Teacher {
  id: number;
  name: string;
}

interface Homework {
  id: number;
  title: string;
  description: string | null;
  notes: string | null;
  dueDate: string | null;
  isCompleted: boolean;
  assignedAt: string;
  teacher: Teacher;
}

export default function StudentHomeworkPage() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [activeHomework, setActiveHomework] = useState<Homework[]>([]);
  const [completedHomework, setCompletedHomework] = useState<Homework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState({text: '', type: ''});
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  
  const fetchHomework = async (showAll = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = showAll ? '/api/student/homework?showAll=true' : '/api/student/homework';
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка при отриманні домашніх завдань');
      }
      
      const data = await response.json();
      
      if (!data.homework || !Array.isArray(data.homework)) {
        throw new Error('Некоректні дані про домашні завдання');
      }
      
      setHomework(data.homework);
      
      const active = data.homework.filter((hw: Homework) => !hw.isCompleted);
      const completed = data.homework.filter((hw: Homework) => hw.isCompleted);
      
      setActiveHomework(active);
      setCompletedHomework(completed);
      
    } catch (error: unknown) {
      console.error('Помилка при завантаженні домашніх завдань:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Виникла помилка при завантаженні даних');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchHomework(true);
  }, []);
  
  const handleToggleComplete = async (homework: Homework) => {
    try {
      const response = await fetch('/api/student/homework', {
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
      
      const data = await response.json();
      
      setMessage({
        text: data.message,
        type: 'success'
      });
      
      fetchHomework(true);
      
    } catch (error: unknown) {
      console.error('Помилка при оновленні статусу завдання:', error);
      if (error instanceof Error) {
        setMessage({
          text: error.message,
          type: 'error'
        });
      } else {
        setMessage({
          text: 'Виникла помилка при оновленні статусу',
          type: 'error'
        });
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Завантаження домашніх завдань...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Помилка завантаження</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => fetchHomework(true)}>
            Спробувати ще раз
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Мої домашні завдання</h2>
          <p className="text-gray-500 mt-1">
            {activeHomework.length === 0 
              ? 'У вас немає активних домашніх завдань' 
              : `У вас ${activeHomework.length} активних завдань`}
          </p>
        </div>
      </div>
      
      {message.text && (
        <div className={`p-4 mb-4 rounded-md ${
          message.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
        }`}>
          {message.text}
          <button 
            onClick={() => setMessage({text: '', type: ''})} 
            className="ml-2 text-sm font-medium underline"
          >
            Закрити
          </button>
        </div>
      )}
      
      <Tabs 
        defaultValue="active" 
        className="w-full" 
        value={activeTab}
        onValueChange={(v: string) => setActiveTab(v as 'active' | 'completed' | 'all')}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="active">
            Активні <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{activeHomework.length}</span>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Виконані <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{completedHomework.length}</span>
          </TabsTrigger>
          <TabsTrigger value="all">
            Всі <span className="ml-1 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">{homework.length}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-0">
          {activeHomework.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center border">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">Всі завдання виконано!</h3>
              <p className="text-gray-500">
                У вас немає активних домашніх завдань.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeHomework.map(hw => (
                <HomeworkCard 
                  key={hw.id} 
                  homework={hw} 
                  onToggleComplete={handleToggleComplete}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0">
          {completedHomework.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center border">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">Немає виконаних завдань</h3>
              <p className="text-gray-500">
                Ви ще не виконали жодного домашнього завдання.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedHomework.map(hw => (
                <HomeworkCard 
                  key={hw.id} 
                  homework={hw} 
                  onToggleComplete={handleToggleComplete}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="mt-0">
          {homework.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center border">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">Немає домашніх завдань</h3>
              <p className="text-gray-500">
                Ваші викладачі ще не задали вам домашніх завдань.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {homework.map(hw => (
                <HomeworkCard 
                  key={hw.id} 
                  homework={hw} 
                  onToggleComplete={handleToggleComplete}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function HomeworkCard({ 
  homework, 
  onToggleComplete
}: { 
  homework: Homework, 
  onToggleComplete: (hw: Homework) => void
}) {
  const isOverdue = (dueDateString: string | null) => {
    if (!dueDateString) return false;
    
    const dueDate = new Date(dueDateString);
    const now = new Date();
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return dueDate < today;
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, 'PPP', { locale: uk });
    } catch (e) {
      console.error('Помилка форматування дати:', e);
      return 'Некоректна дата';
    }
  };
  
  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{homework.title}</CardTitle>
          <div className="flex items-center gap-2">
            <div 
              className={`w-3 h-3 rounded-full ${
                homework.isCompleted 
                  ? 'bg-green-500' 
                  : isOverdue(homework.dueDate) 
                    ? 'bg-red-500'
                    : 'bg-blue-500'
              }`} 
            />
            <span className="text-xs text-muted-foreground font-medium">
              {homework.isCompleted 
                ? 'Виконано' 
                : isOverdue(homework.dueDate) 
                  ? 'Прострочено' 
                  : 'Активне'}
            </span>
          </div>
        </div>
        <CardDescription>
          Від викладача: {homework.teacher.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {homework.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {homework.description}
          </p>
        )}
        <div className="text-xs text-muted-foreground flex justify-between">
          <span>Призначено: {formatDate(homework.assignedAt)}</span>
          {homework.dueDate && (
            <span className={isOverdue(homework.dueDate) && !homework.isCompleted ? 'text-red-500 font-medium' : ''}>
              Термін: {formatDate(homework.dueDate)}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <Link 
          href={`/student/homework/${homework.id}`} 
          className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          {homework.isCompleted ? 'Редагувати відповідь' : 'Відправити відповідь'}
        </Link>
        <Button 
          onClick={() => onToggleComplete(homework)} 
          variant={homework.isCompleted ? "outline" : "default"} 
          size="sm"
        >
          {homework.isCompleted ? 'Позначити як невиконане' : 'Позначити як виконане'}
        </Button>
      </CardFooter>
    </Card>
  );
} 