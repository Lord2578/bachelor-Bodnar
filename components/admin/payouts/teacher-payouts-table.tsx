"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parse } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TeacherPayout {
  id: number;
  teacher_id: number;
  month_year: string;
  total_lessons: number;
  total_hours: number;
  rate_per_hour: number;
  total_amount: number;
  calculated_at: string;
  first_name: string;
  last_name: string;
}

export function TeacherPayoutsTable() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payouts, setPayouts] = useState<TeacherPayout[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherPayout | null>(null);
  const [newRate, setNewRate] = useState('');
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
  
  const fetchPayouts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/teacher/payouts?month=${selectedMonth}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Помилка при отриманні даних');
      }
      
      setPayouts(data.payouts || []);
    } catch (error) {
      console.error('Помилка при завантаженні даних про зарплати:', error);
      setError(error instanceof Error ? error.message : 'Сталася помилка');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);
  
  useEffect(() => {
    fetchPayouts();
  }, [selectedMonth, fetchPayouts]);
  
  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
  };
  
  const formatMonthYear = (monthYear: string) => {
    try {
      const date = parse(monthYear, 'yyyy-MM', new Date());
      return format(date, 'MMMM yyyy', { locale: uk });
    } catch {
      return monthYear;
    }
  };
  
  const handleEditRate = (teacher: TeacherPayout) => {
    setEditingTeacher(teacher);
    setNewRate(teacher.rate_per_hour.toString());
    setDialogOpen(true);
  };
  
  const submitRateChange = async () => {
    if (!editingTeacher || !newRate) return;
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/teacher/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId: editingTeacher.teacher_id,
          month: selectedMonth,
          ratePerHour: parseFloat(newRate),
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Помилка при оновленні ставки');
      }
      
      setDialogOpen(false);
      fetchPayouts();
    } catch (error) {
      console.error('Помилка при оновленні ставки:', error);
      setError(error instanceof Error ? error.message : 'Сталася помилка при оновленні ставки');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRecalculate = async (teacherId: number) => {
    try {
      setRecalculating(true);
      setError(null);
      
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
      
      setSuccessMessage(`Зарплату для вчителя успішно перераховано`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
      fetchPayouts();
      
    } catch (error) {
      console.error('Помилка при перерахунку зарплати:', error);
      setError(error instanceof Error ? error.message : 'Сталася помилка при перерахунку');
    } finally {
      setRecalculating(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Зарплати вчителів</h2>
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
          <Button variant="outline" onClick={fetchPayouts}>
            Оновити
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 border border-red-500 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 border border-green-500 bg-green-50 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}
      
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : payouts.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-md">
          <p className="text-gray-500">Немає даних про зарплати за {formatMonthYear(selectedMonth)}</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ПІБ вчителя</TableHead>
                <TableHead className="text-right">Занять</TableHead>
                <TableHead className="text-right">Годин</TableHead>
                <TableHead className="text-right">Ставка (грн/год)</TableHead>
                <TableHead className="text-right">Сума (грн)</TableHead>
                <TableHead className="text-right">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium">
                    {payout.first_name} {payout.last_name}
                  </TableCell>
                  <TableCell className="text-right">{payout.total_lessons}</TableCell>
                  <TableCell className="text-right">{Number(payout.total_hours).toFixed(1)}</TableCell>
                  <TableCell className="text-right">{payout.rate_per_hour}</TableCell>
                  <TableCell className="text-right font-semibold">{Number(payout.total_amount).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditRate(payout)}>
                        Змінити ставку
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => handleRecalculate(payout.teacher_id)}
                        disabled={recalculating}
                      >
                        Перерахувати
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-bold">
                  Загальна сума виплат:
                </TableCell>
                <TableCell className="text-right font-bold text-lg">
                  {payouts.reduce((sum, payout) => sum + Number(payout.total_amount), 0).toFixed(2)} грн
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Зміна ставки для вчителя</DialogTitle>
            <DialogDescription>
              {editingTeacher && `${editingTeacher.first_name} ${editingTeacher.last_name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rate">Нова ставка (грн/год)</Label>
              <Input
                id="rate"
                type="number"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Скасувати
              </Button>
              <Button onClick={submitRateChange}>
                Зберегти
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 