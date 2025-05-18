"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isValid, parse } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface TeacherPayoutProps {
  teacherId?: number;
}

interface PayoutData {
  id: number;
  teacher_id: number;
  month_year: string;
  total_lessons: number;
  total_hours: number;
  rate_per_hour: number;
  total_amount: number;
  calculated_at: string;
}

export function TeacherPayout({ teacherId }: TeacherPayoutProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payoutData, setPayoutData] = useState<PayoutData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [recalculating, setRecalculating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const getLastMonths = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy', { locale: uk })
      });
    }
    
    return months;
  };
  
  const months = getLastMonths();
  
  const fetchPayoutData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `/api/teacher/payouts?month=${selectedMonth}`;
      if (teacherId) {
        url += `&teacherId=${teacherId}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Помилка при отриманні даних');
      }
      
      setPayoutData(data.payout || null);
    } catch (error) {
      console.error('Помилка при завантаженні даних про зарплату:', error);
      setError(error instanceof Error ? error.message : 'Сталася помилка');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, teacherId]);
  
  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
  };
  
  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await fetch('/api/teacher/payouts/recalculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId,
          month: selectedMonth,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Помилка при перерахунку зарплати');
      }
      
      setPayoutData(data.payout || null);
      setSuccessMessage('Зарплату успішно перераховано');
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (error) {
      console.error('Помилка при перерахунку зарплати:', error);
      setError(error instanceof Error ? error.message : 'Сталася помилка при перерахунку');
    } finally {
      setRecalculating(false);
    }
  };
  
  useEffect(() => {
    fetchPayoutData();
  }, [selectedMonth, teacherId, fetchPayoutData]);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isValid(date)) {
        return format(date, 'dd MMMM yyyy, HH:mm', { locale: uk });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };
  
  const formatMonthYear = (monthYear: string) => {
    try {
      const date = parse(monthYear, 'yyyy-MM', new Date());
      return format(date, 'MMMM yyyy', { locale: uk });
    } catch {
      return monthYear;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Зарплата вчителя</CardTitle>
            <CardDescription>
              Інформація про проведені заняття та розрахунок зарплати
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedMonth} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Оберіть місяць" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchPayoutData} disabled={loading}>
              Оновити
            </Button>
            <Button 
              variant="default" 
              onClick={handleRecalculate} 
              disabled={recalculating || loading}
            >
              {recalculating ? 'Перерахунок...' : 'Перерахувати'}
            </Button>
          </div>
        </div>
        {successMessage && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : error ? (
          <div className="text-center p-6 text-red-500">
            <p>{error}</p>
          </div>
        ) : !payoutData ? (
          <div className="text-center p-6 text-gray-500">
            <p>Немає даних про зарплату за {formatMonthYear(selectedMonth)}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Період</p>
                  <p className="text-lg font-medium">{formatMonthYear(payoutData.month_year)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Кількість проведених занять</p>
                  <p className="text-lg font-medium">{payoutData.total_lessons}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Всього годин</p>
                  <p className="text-lg font-medium">{payoutData.total_hours} год.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Ставка за годину</p>
                  <p className="text-lg font-medium">{payoutData.rate_per_hour} грн.</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Загальна сума</p>
                  <p className="text-xl font-bold text-green-600">{Number(payoutData.total_amount).toFixed(2)} грн.</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Дата розрахунку</p>
                  <p className="text-sm">{formatDate(payoutData.calculated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 