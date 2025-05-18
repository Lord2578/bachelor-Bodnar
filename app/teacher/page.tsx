"use client";

import { useEffect, useState } from 'react';
import { StudentsGrid } from "@/components/teacher/dashboard/students-grid"
import { CalendarWidget } from "@/components/teacher/dashboard/calendar-widget"
import { HomeworkActivity } from "@/components/teacher/dashboard/homework-activity"
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface TeacherInfo {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
  subjects: string[];
}

interface Student {
  id: number;
  name: string;
  email: string;
}

interface Homework {
  id: number;
  title: string;
  studentName: string;
  submittedAt: string;
  isCompleted?: boolean;
  grade?: string | null;
  teacherComment?: string | null;
}

export default function TeacherDashboard() {
  const [, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [, setUpcomingClasses] = useState<Array<unknown>>([]);
  const [recentHomework, setRecentHomework] = useState<Homework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        
        if (response.ok) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Помилка завантаження даних користувача', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const teacherResponse = await fetch('/api/teacher/current');
        if (!teacherResponse.ok) {
          throw new Error('Помилка при отриманні даних викладача');
        }
        const teacherData = await teacherResponse.json();
        setTeacherInfo(teacherData.teacher);
        
        const studentsResponse = await fetch('/api/teacher/students');
        if (!studentsResponse.ok) {
          throw new Error('Помилка при отриманні даних про студентів');
        }
        const studentsData = await studentsResponse.json();
        setStudents(studentsData.students || []);
        
        const scheduleResponse = await fetch('/api/teacher/schedule?upcoming=true&limit=3');
        if (scheduleResponse.ok) {
          const scheduleData = await scheduleResponse.json();
          setUpcomingClasses(scheduleData.schedule || []);
        }
        
        const homeworkResponse = await fetch('/api/teacher/homework-submissions?limit=5');
        if (homeworkResponse.ok) {
          const homeworkData = await homeworkResponse.json();
          const formattedSubmissions = homeworkData.submissions?.map((submission: {
            homeworkId: number;
            homeworkTitle: string;
            studentName: string;
            submittedAt: string;
            isCompleted?: boolean;
            grade?: string | null;
            teacherComment?: string | null;
          }) => ({
            id: submission.homeworkId,
            title: submission.homeworkTitle,
            studentName: submission.studentName,
            submittedAt: submission.submittedAt,
            isCompleted: submission.isCompleted,
            grade: submission.grade,
            teacherComment: submission.teacherComment
          })) || [];
          setRecentHomework(formattedSubmissions);
        }
        
      } catch (error) {
        console.error('Помилка при завантаженні даних:', error);
        setError(error instanceof Error ? error.message : 'Помилка при завантаженні даних');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPP', { locale: uk });
    } catch (e) {
      console.error('Помилка форматування дати:', e);
      return 'Некоректна дата';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-2xl">Завантаження...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Завантаження даних...</p>
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
          <Button onClick={() => window.location.reload()}>
            Спробувати ще раз
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full">
      <div className="flex flex-col lg:flex-row w-full">
        <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8 overflow-auto">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome, {teacherInfo ? `${teacherInfo.firstName} ${teacherInfo.lastName}` : 'Teacher'}</h1>
            <p className="text-muted-foreground">Here&apos;s what&apos;s happening today.</p>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 md:gap-6">
            <HomeworkActivity recentHomework={recentHomework} formatDate={formatDate} />
            <StudentsGrid students={students} />
          </div>
        </div>

        <div className="w-full lg:w-auto lg:min-w-[300px] lg:max-w-[350px] xl:max-w-[400px] border-t lg:border-l lg:border-t-0 p-4 md:p-6 lg:p-8 bg-white flex-shrink-0">
          <div className="space-y-6">
            <CalendarWidget events={[]} />
          </div>
        </div>
      </div>
    </div>
  );
}

