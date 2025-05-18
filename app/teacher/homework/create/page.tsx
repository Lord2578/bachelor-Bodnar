"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Student {
  id: number;
  name: string;
  email: string;
}

export default function CreateHomeworkPage() {
  const router = useRouter();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/teacher/students');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Помилка при отриманні списку студентів');
        }
        
        const data = await response.json();
        
        if (data.students) {
          setStudents(data.students);
        }
        
      } catch (error: unknown) {
        console.error('Помилка при завантаженні студентів:', error);
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentId || !title) {
      setMessage({
        text: 'Будь ласка, виберіть учня та введіть заголовок завдання',
        type: 'error'
      });
      return;
    }
    
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });
    
    try {
      const response = await fetch('/api/teacher/homework', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: Number(studentId),
          title,
          description: description || null,
          notes: notes || null,
          dueDate: dueDate || null
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка при створенні домашнього завдання');
      }
      
      const data = await response.json();
      
      setMessage({
        text: data.message || 'Домашнє завдання успішно створено',
        type: 'success'
      });
      
      setStudentId('');
      setTitle('');
      setDescription('');
      setNotes('');
      setDueDate('');
      
      setTimeout(() => {
        router.push('/teacher/homework');
      }, 2000);
      
    } catch (error: unknown) {
      console.error('Помилка при створенні домашнього завдання:', error);
      if (error instanceof Error) {
        setMessage({
          text: error.message,
          type: 'error'
        });
      } else {
        setMessage({
          text: 'Виникла помилка при створенні завдання',
          type: 'error'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Завантаження даних...</p>
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
          <Button onClick={() => router.push('/teacher/homework')}>
            Повернутися до списку завдань
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Створення нового домашнього завдання</h2>
          <p className="text-gray-500">Заповніть форму, щоб створити нове домашнє завдання для учня</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/teacher/homework">
            Назад до списку
          </Link>
        </Button>
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
      
      <Card>
        <CardHeader>
          <CardTitle>Нове домашнє завдання</CardTitle>
          <CardDescription>Введіть інформацію про нове домашнє завдання</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student">Учень</Label>
              <Select
                value={studentId}
                onValueChange={setStudentId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Виберіть учня" />
                </SelectTrigger>
                <SelectContent>
                  {students.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Немає доступних учнів
                    </SelectItem>
                  ) : (
                    students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Заголовок</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введіть заголовок домашнього завдання"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Опис завдання</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Введіть детальний опис завдання"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Примітки</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Додаткові примітки (за потреби)"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Термін виконання</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Створення...' : 'Створити завдання'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 