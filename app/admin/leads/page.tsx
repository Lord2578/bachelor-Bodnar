"use client";

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  user_type: string;
  english_level: string;
  test_score: number;
  birth_date: string | null;
  created_at: string;
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error'; message: string} | null>(null);
  
  useEffect(() => {
    fetchUserData();
  }, []);
  
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchLeads();
    }
  }, [user]);
  
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  
  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
      } else {
        setError('Не вдалося завантажити дані користувача');
      }
    } catch (error) {
      console.error('Помилка завантаження даних користувача', error);
      setError('Не вдалося завантажити дані користувача');
    }
  };
  
  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/leads');
      
      if (!response.ok) {
        throw new Error('Помилка при отриманні даних');
      }
      
      const data = await response.json();
      if (data && data.leads) {
        setLeads(data.leads || []);
      } else {
        setLeads([]);
      }
    } catch (err) {
      console.error('Помилка при завантаженні заявок:', err);
      setError(err instanceof Error ? err.message : 'Сталася помилка');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPP, HH:mm', { locale: uk });
    } catch {
      return dateString || 'Н/Д';
    }
  };
  
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-2xl">Завантаження даних...</div>
        </div>
      </div>
    );
  }
  
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-red-500">Доступ заборонено. Ця сторінка доступна тільки для адміністраторів.</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      {notification && (
        <div 
          className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${
            notification.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          {notification.message}
        </div>
      )}
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Заявки на тестування</h1>
        <p className="text-gray-600 mt-2">
          Перегляд та керування заявками на тестування рівня англійської мови
        </p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 border border-red-500 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-md">
          <p className="text-gray-500">Немає заявок на тестування</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Ім&apos;я</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Рівень англійської</TableHead>
                <TableHead>Результат тесту</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.id}</TableCell>
                  <TableCell>{lead.first_name} {lead.last_name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.phone}</TableCell>
                  <TableCell>
                    {lead.english_level ? (
                      <Badge variant="outline" className="bg-blue-50">
                        {lead.english_level}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">Не вказано</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.test_score !== null ? (
                      <Badge variant="outline" className="bg-green-50">
                        {lead.test_score}%
                      </Badge>
                    ) : (
                      <span className="text-gray-400">Не вказано</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(lead.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant={lead.user_type === 'student' ? 'default' : 'secondary'}>
                      {lead.user_type === 'student' ? 'Студент' : 'Викладач'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 