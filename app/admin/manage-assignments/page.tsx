"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Teacher {
  id: number;
  name: string;
  email: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
  assigned: boolean;
}

export default function ManageAssignmentsPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch('/api/teachers');
        if (!response.ok) {
          throw new Error('Не вдалося завантажити список вчителів');
        }
        const data = await response.json();
        setTeachers(data.teachers || []);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Не вдалося завантажити список вчителів');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacher) {
      setIsLoading(true);
      const fetchStudentsForTeacher = async () => {
        try {
          const response = await fetch(`/api/admin/teacher-students?teacherId=${selectedTeacher}`);
          if (!response.ok) {
            throw new Error('Не вдалося завантажити дані про призначення');
          }
          const data = await response.json();
          setStudents(data.students || []);
        } catch (error: unknown) {
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError('Не вдалося завантажити дані про призначення');
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchStudentsForTeacher();
    }
  }, [selectedTeacher]);

  const handleTeacherSelect = (teacherId: number) => {
    setSelectedTeacher(teacherId);
    setError(null);
    setSuccess(null);
  };

  const handleToggleAssignment = async (studentId: number, currentlyAssigned: boolean) => {
    if (!selectedTeacher) return;
    
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/admin/assign-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId: selectedTeacher,
          studentId,
          action: currentlyAssigned ? 'remove' : 'assign'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не вдалося змінити призначення');
      }

      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === studentId
            ? { ...student, assigned: !currentlyAssigned }
            : student
        )
      );

      setSuccess(
        currentlyAssigned 
          ? 'Студента успішно видалено з призначень викладача' 
          : 'Студента успішно призначено викладачу'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Не вдалося змінити призначення');
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading && !selectedTeacher) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Управління призначеннями студентів</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Викладачі</CardTitle>
          </CardHeader>
          <CardContent>
            {teachers.length === 0 ? (
              <p className="text-gray-500">Немає доступних викладачів</p>
            ) : (
              <div className="space-y-2">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedTeacher === teacher.id
                        ? 'bg-blue-100 border border-blue-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => handleTeacherSelect(teacher.id)}
                  >
                    <p className="font-medium">{teacher.name}</p>
                    <p className="text-sm text-gray-500">{teacher.email}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedTeacher
                ? `Студенти для викладача: ${
                    teachers.find((t) => t.id === selectedTeacher)?.name || ''
                  }`
                : 'Оберіть викладача зі списку зліва'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedTeacher ? (
              <p className="text-gray-500">Спочатку оберіть викладача зі списку зліва</p>
            ) : isLoading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : students.length === 0 ? (
              <p className="text-gray-500">Немає доступних студентів</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="p-4 bg-gray-50 rounded-md flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                      <Button
                        onClick={() => handleToggleAssignment(student.id, student.assigned)}
                        variant={student.assigned ? "destructive" : "default"}
                        disabled={actionLoading}
                      >
                        {student.assigned ? 'Відкріпити' : 'Призначити'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 