"use client";

import { useEffect, useState } from 'react';
import { TeacherPayout } from '@/components/teacher/salary/teacher-payout';

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

export default function TeacherSalaryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null);

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
    const fetchTeacherInfo = async () => {
      if (!user || user.role !== 'teacher') return;
      
      try {
        const response = await fetch('/api/teacher/current');
        const data = await response.json();
        
        if (response.ok) {
          setTeacherInfo(data.teacher);
        }
      } catch (error) {
        console.error('Помилка завантаження даних вчителя', error);
      }
    };

    fetchTeacherInfo();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Завантаження...</div>
      </div>
    );
  }

  if (!user || user.role !== 'teacher') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-red-500">Доступ заборонено</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Мої фінанси</h1>
      <div className="grid grid-cols-1 gap-8">
        <TeacherPayout teacherId={teacherInfo?.id} />
        
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Інформація щодо розрахунку зарплати</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Ваша зарплата обчислюється на основі кількості проведених годин за поточний місяць</li>
            <li>Ставка за годину становить 210 грн/год (або інше значення, встановлене адміністратором)</li>
            <li>Зарплата нараховується тільки за позначені як проведені заняття</li>
            <li>При виникненні питань щодо розрахунку зарплати, будь ласка, зверніться до адміністратора</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 