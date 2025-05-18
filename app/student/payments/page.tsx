"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

interface Payment {
  id: number;
  studentId: number;
  studentName: string;
  lessonsPaid: number;
  amount: number;
  paidAt: string;
  confirmed: boolean;
}

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    lessonsPaid: '',
    amount: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [remainingLessons, setRemainingLessons] = useState<number | null>(null);
  const [showLowLessonsWarning, setShowLowLessonsWarning] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/student/payments');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Помилка при отриманні платежів');
        }
        
        setPayments(data.payments);
        
        await calculateRemainingLessons();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Невідома помилка');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayments();
  }, []);
  
  const calculateRemainingLessons = async () => {
    try {
      const response = await fetch('/api/student/lessons-remaining');
      
      if (!response.ok) {
        throw new Error('Помилка при отриманні кількості уроків');
      }
      
      const data = await response.json();
      setRemainingLessons(data.remainingLessons);
      
      setShowLowLessonsWarning(data.showWarning);
    } catch (err) {
      console.error('Помилка при обчисленні залишку уроків:', err);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'lessonsPaid' || name === 'amount') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setPaymentFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setPaymentFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const lessonsPaid = parseInt(paymentFormData.lessonsPaid);
      const amount = parseInt(paymentFormData.amount);
      
      if (isNaN(lessonsPaid) || lessonsPaid <= 0) {
        throw new Error('Кількість уроків має бути більше 0');
      }
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Сума має бути більше 0');
      }
      
      const response = await fetch('/api/student/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonsPaid,
          amount
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Помилка при створенні оплати');
      }
      
      setSuccess('Оплату успішно додано! Після підтвердження адміністратором ваш баланс уроків буде оновлено.');
      setPaymentFormData({
        lessonsPaid: '',
        amount: ''
      });
      setShowPaymentForm(false);
      
      const paymentsResponse = await fetch('/api/student/payments');
      const paymentsData = await paymentsResponse.json();
      
      if (paymentsResponse.ok) {
        setPayments(paymentsData.payments);
        await calculateRemainingLessons();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Невідома помилка');
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Мої оплати</h1>
      
      {showLowLessonsWarning && (
        <div className="mb-6 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative flex items-center">
          <AlertTriangle className="mr-2" />
          <span>
            У вас залишилось лише <strong>{remainingLessons}</strong> {remainingLessons === 1 ? 'урок' : 'уроки'}. Будь ласка, поповніть баланс, щоб продовжити навчання.
          </span>
        </div>
      )}
      
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Баланс уроків</h2>
            <p className="text-gray-600">
              {remainingLessons !== null ? (
                <>
                  У вас залишилось: <span className="font-bold text-xl">{remainingLessons}</span> {remainingLessons === 1 ? 'урок' : (remainingLessons <= 4 ? 'уроки' : 'уроків')}
                </>
              ) : (
                'Завантаження інформації...'
              )}
            </p>
          </div>
          <Button 
            onClick={() => setShowPaymentForm(true)}
            disabled={showPaymentForm}
          >
            Додати оплату
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      
      {showPaymentForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Додати нову оплату</CardTitle>
            <CardDescription>
              Заповніть форму, щоб додати інформацію про оплату. Після підтвердження адміністратором уроки будуть додані до вашого балансу.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lessonsPaid">Кількість оплачених уроків</Label>
                  <Input
                    id="lessonsPaid"
                    name="lessonsPaid"
                    type="text"
                    value={paymentFormData.lessonsPaid}
                    onChange={handleChange}
                    required
                    placeholder="Наприклад: 10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Сума оплати (грн)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="text"
                    value={paymentFormData.amount}
                    onChange={handleChange}
                    required
                    placeholder="Наприклад: 2000"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowPaymentForm(false)}
                  disabled={submitting}
                >
                  Скасувати
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                >
                  {submitting ? 'Відправка...' : 'Додати оплату'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <h2 className="text-2xl font-semibold mb-4">Історія оплат</h2>
      
      {loading ? (
        <p>Завантаження...</p>
      ) : payments.length === 0 ? (
        <p className="text-gray-500">У вас ще немає жодної оплати.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-4 border text-left">Дата</th>
                <th className="py-2 px-4 border text-left">Кількість уроків</th>
                <th className="py-2 px-4 border text-left">Сума (грн)</th>
                <th className="py-2 px-4 border text-left">Статус</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border">{formatDate(payment.paidAt)}</td>
                  <td className="py-2 px-4 border">{payment.lessonsPaid}</td>
                  <td className="py-2 px-4 border">{payment.amount}</td>
                  <td className="py-2 px-4 border">
                    {payment.confirmed ? (
                      <span className="text-green-600 font-medium">Підтверджено</span>
                    ) : (
                      <span className="text-yellow-600 font-medium">Очікує підтвердження</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 