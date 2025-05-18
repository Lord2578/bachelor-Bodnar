/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import React from 'react';

interface Student {
  id: number;
  userId: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  englishLevel?: string;
  goals?: string;
  learningStyle?: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const fetchStudents = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/students');
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
    } catch (error: any) {
      console.error('Помилка при завантаженні даних:', error);
      setError(error.message || 'Виникла помилка при завантаженні даних');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchStudents();
  }, []);
  
  const handleShowDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowDetails(true);
  };
  
  const handleCloseDetails = () => {
    setShowDetails(false);
  };
  
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Завантаження списку студентів...</p>
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
          <Button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
          >
            Спробувати ще раз
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Список студентів</h2>
      </div>
      
      {showDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{selectedStudent.name}</h3>
              <button 
                onClick={handleCloseDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-500 text-sm">ID:</p>
                <p className="font-medium">{selectedStudent.id}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">User ID:</p>
                <p className="font-medium">{selectedStudent.userId}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Ім&apos;я:</p>
                <p className="font-medium">{selectedStudent.firstName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Прізвище:</p>
                <p className="font-medium">{selectedStudent.lastName}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 text-sm">Email:</p>
                <p className="font-medium">{selectedStudent.email}</p>
              </div>
              {selectedStudent.englishLevel && (
                <div>
                  <p className="text-gray-500 text-sm">Рівень англійської:</p>
                  <p className="font-medium">{selectedStudent.englishLevel}</p>
                </div>
              )}
              {selectedStudent.goals && (
                <div className="col-span-2">
                  <p className="text-gray-500 text-sm">Цілі навчання:</p>
                  <p className="font-medium">{selectedStudent.goals}</p>
                </div>
              )}
              {selectedStudent.learningStyle && (
                <div className="col-span-2">
                  <p className="text-gray-500 text-sm">Стиль навчання:</p>
                  <p className="font-medium">{selectedStudent.learningStyle}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 text-right">
              <Button onClick={handleCloseDetails}>
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
          <h3 className="text-xl font-medium text-gray-700 mb-2">Немає студентів</h3>
          <p className="text-gray-500">
            У системі поки немає зареєстрованих студентів.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ім&apos;я та прізвище
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Рівень англійської
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дії
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.englishLevel || 'Не вказано'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleShowDetails(student)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Деталі
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 