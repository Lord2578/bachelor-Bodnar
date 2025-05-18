"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parse, startOfMonth, endOfMonth } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDownIcon, ArrowUpIcon, DownloadIcon, RefreshCw } from 'lucide-react';

interface Payment {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  lessonsPaid: number;
  amount: number;
  paidAt: string;
  confirmed: boolean;
}

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

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  confirmedPayments: number;
  pendingPayments: number;
  teacherPayouts: number;
  totalLessons: number;
  totalHours: number;
}

export default function FinancialReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [studentPayments, setStudentPayments] = useState<Payment[]>([]);
  const [teacherPayouts, setTeacherPayouts] = useState<TeacherPayout[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    confirmedPayments: 0,
    pendingPayments: 0,
    teacherPayouts: 0,
    totalLessons: 0,
    totalHours: 0
  });

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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const startDate = format(startOfMonth(parse(selectedMonth, 'yyyy-MM', new Date())), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(parse(selectedMonth, 'yyyy-MM', new Date())), 'yyyy-MM-dd');
      
      const paymentsResponse = await fetch(`/api/admin/reports/payments?startDate=${startDate}&endDate=${endDate}`);
      
      if (!paymentsResponse.ok) {
        const errorData = await paymentsResponse.json();
        throw new Error(errorData.message || 'Помилка при отриманні даних про платежі студентів');
      }
      
      const paymentsData = await paymentsResponse.json();
      setStudentPayments(paymentsData.payments || []);

      const payoutsResponse = await fetch(`/api/teacher/payouts?month=${selectedMonth}`);
      
      if (!payoutsResponse.ok) {
        const errorData = await payoutsResponse.json();
        throw new Error(errorData.message || 'Помилка при отриманні даних про виплати викладачам');
      }
      
      const payoutsData = await payoutsResponse.json();
      setTeacherPayouts(payoutsData.payouts || []);

      const confirmedPayments = paymentsData.payments.filter((p: Payment) => p.confirmed);
      const pendingPayments = paymentsData.payments.filter((p: Payment) => !p.confirmed);
      
      const totalIncome = confirmedPayments.reduce((sum: number, payment: Payment) => sum + parseFloat(payment.amount.toString()), 0);
      const totalExpenses = payoutsData.payouts.reduce((sum: number, payout: TeacherPayout) => sum + parseFloat(payout.total_amount.toString()), 0);
      
      setSummary({
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        confirmedPayments: confirmedPayments.length,
        pendingPayments: pendingPayments.length,
        teacherPayouts: payoutsData.payouts.length,
        totalLessons: payoutsData.payouts.reduce((sum: number, payout: TeacherPayout) => sum + payout.total_lessons, 0),
        totalHours: payoutsData.payouts.reduce((sum: number, payout: TeacherPayout) => sum + parseFloat(payout.total_hours.toString()), 0)
      });
      
    } catch (error) {
      console.error('Помилка при завантаженні фінансових даних:', error);
      setError(error instanceof Error ? error.message : 'Сталася помилка при завантаженні даних');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [selectedMonth, fetchData]);

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd MMMM yyyy, HH:mm', { locale: uk });
  };

  const exportToCSV = (data: Payment[] | TeacherPayout[], filename: string) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (data.length > 0) {
      const header = Object.keys(data[0]);
      csvContent += header.join(",") + "\r\n";
    }
    
    data.forEach(item => {
      const row = Object.values(item).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(",");
      csvContent += row + "\r\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Фінансовий звіт</h1>
      
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold">
          Звіт за {formatMonthYear(selectedMonth)}
        </h2>
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
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Оновити
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Загальний дохід</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.totalIncome)}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.confirmedPayments} підтверджених платежів
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Загальні витрати</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.teacherPayouts} виплат викладачам
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Чистий прибуток</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.netProfit >= 0 ? <ArrowUpIcon className="h-5 w-5 inline-block mr-1" /> : <ArrowDownIcon className="h-5 w-5 inline-block mr-1" />}
                  {formatCurrency(Math.abs(summary.netProfit))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {((summary.totalIncome > 0) ? 
                    ((summary.netProfit / summary.totalIncome) * 100).toFixed(1) : 
                    0)}% від доходу
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Проведено занять</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalLessons}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.totalHours.toFixed(1)} годин
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="payments" className="mb-6">
            <TabsList>
              <TabsTrigger value="payments">Платежі студентів</TabsTrigger>
              <TabsTrigger value="payouts">Виплати викладачам</TabsTrigger>
            </TabsList>
            
            <TabsContent value="payments" className="mt-4">
              <Card>
                <CardHeader className="py-4 px-6 flex flex-row items-center justify-between">
                  <CardTitle>Платежі студентів</CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={() => exportToCSV(studentPayments, 'student_payments')}
                    disabled={studentPayments.length === 0}
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Експорт CSV
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {studentPayments.length === 0 ? (
                    <div className="py-6 px-6 text-center text-gray-500">
                      Немає платежів за обраний період
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Дата</TableHead>
                            <TableHead>Студент</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Уроків</TableHead>
                            <TableHead className="text-right">Сума</TableHead>
                            <TableHead>Статус</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {studentPayments.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>{formatDate(payment.paidAt)}</TableCell>
                              <TableCell className="font-medium">{payment.studentName}</TableCell>
                              <TableCell>{payment.studentEmail}</TableCell>
                              <TableCell className="text-right">{payment.lessonsPaid}</TableCell>
                              <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  payment.confirmed 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {payment.confirmed ? 'Підтверджено' : 'Очікує підтвердження'}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payouts" className="mt-4">
              <Card>
                <CardHeader className="py-4 px-6 flex flex-row items-center justify-between">
                  <CardTitle>Виплати викладачам</CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={() => exportToCSV(teacherPayouts, 'teacher_payouts')}
                    disabled={teacherPayouts.length === 0}
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Експорт CSV
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {teacherPayouts.length === 0 ? (
                    <div className="py-6 px-6 text-center text-gray-500">
                      Немає виплат за обраний період
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Викладач</TableHead>
                            <TableHead className="text-right">Занять</TableHead>
                            <TableHead className="text-right">Годин</TableHead>
                            <TableHead className="text-right">Ставка</TableHead>
                            <TableHead className="text-right">Сума</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teacherPayouts.map((payout) => (
                            <TableRow key={payout.id}>
                              <TableCell className="font-medium">
                                {payout.first_name} {payout.last_name}
                              </TableCell>
                              <TableCell className="text-right">{payout.total_lessons}</TableCell>
                              <TableCell className="text-right">{Number(payout.total_hours).toFixed(1)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(payout.rate_per_hour)}</TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatCurrency(payout.total_amount)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
      
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Про фінансовий звіт</h3>
          <div className="space-y-3 text-gray-600 text-sm">
            <p>
              Цей звіт надає загальну картину фінансового стану за обраний місяць, включаючи надходження від студентів та виплати викладачам.
            </p>
            <p>
              <strong>Загальний дохід</strong> - сума всіх підтверджених платежів від студентів за обраний період.
            </p>
            <p>
              <strong>Загальні витрати</strong> - сума всіх виплат викладачам за проведені заняття за обраний період.
            </p>
            <p>
              <strong>Чистий прибуток</strong> - різниця між доходами та витратами.
            </p>
            <p>
              <strong>Експорт CSV</strong> - дозволяє завантажити дані у форматі CSV для подальшого аналізу в Excel або інших програмах.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 