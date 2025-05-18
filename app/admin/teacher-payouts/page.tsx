"use client";

import { useEffect, useState } from 'react';
import { TeacherPayoutsTable } from '@/components/admin/payouts/teacher-payouts-table';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function AdminTeacherPayoutsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
        setError('Не вдалося завантажити дані користувача');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Завантаження...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-red-500">{error}</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-red-500">Доступ заборонено. Ця сторінка доступна тільки для адміністраторів.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Управління оплатою вчителів</h1>
        <p className="text-gray-600 mt-2">
          Перегляд та управління зарплатами вчителів за різні періоди
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <TeacherPayoutsTable />
      </div>
      
      <div className="mt-8 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h2 className="text-xl font-semibold mb-4">Інформація щодо управління зарплатами</h2>
        <div className="space-y-3">
          <p>
            <span className="font-semibold">Розрахунок зарплати:</span> Зарплата розраховується автоматично на основі кількості годин, які вчитель провів за місяць.
          </p>
          <p>
            <span className="font-semibold">Ставка за годину:</span> За замовчуванням ставка становить 210 грн/год, але ви можете змінити її для кожного вчителя індивідуально.
          </p>
          <p>
            <span className="font-semibold">Проведені заняття:</span> Зарплата нараховується тільки за ті заняття, які позначені як &quot;проведені&quot; в системі.
          </p>
          <p>
            <span className="font-semibold">Зміна ставки:</span> При зміні ставки для вчителя, сума зарплати буде автоматично перерахована.
          </p>
        </div>
      </div>
    </div>
  );
} 