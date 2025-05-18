"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processingPaymentIds, setProcessingPaymentIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student/payments');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Помилка при отриманні платежів');
      }
      
      setPayments(data.payments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Невідома помилка');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (paymentId: number, confirmed: boolean) => {
    try {
      setProcessingPaymentIds(prev => new Set(prev).add(paymentId));
      setError(null);
      setSuccess(null);
      
      const response = await fetch('/api/admin/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          confirmed
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Помилка при підтвердженні платежу');
      }
      
      setSuccess(data.message);
      
      await fetchPayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Невідома помилка');
    } finally {
      setProcessingPaymentIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(paymentId);
        return newSet;
      });
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
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Управління оплатами студентів</h1>
      
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
      
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <p>Завантаження...</p>
          ) : payments.length === 0 ? (
            <p className="text-gray-500">Не знайдено жодної оплати.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 border text-left">ID</th>
                    <th className="py-3 px-4 border text-left">Студент</th>
                    <th className="py-3 px-4 border text-left">Email</th>
                    <th className="py-3 px-4 border text-left">Дата</th>
                    <th className="py-3 px-4 border text-left">Уроків</th>
                    <th className="py-3 px-4 border text-left">Сума (грн)</th>
                    <th className="py-3 px-4 border text-left">Статус</th>
                    <th className="py-3 px-4 border text-left">Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border">{payment.id}</td>
                      <td className="py-3 px-4 border">{payment.studentName}</td>
                      <td className="py-3 px-4 border">{payment.studentEmail}</td>
                      <td className="py-3 px-4 border">{formatDate(payment.paidAt)}</td>
                      <td className="py-3 px-4 border">{payment.lessonsPaid}</td>
                      <td className="py-3 px-4 border">{payment.amount}</td>
                      <td className="py-3 px-4 border">
                        {payment.confirmed ? (
                          <span className="text-green-600 font-medium flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Підтверджено
                          </span>
                        ) : (
                          <span className="text-yellow-600 font-medium flex items-center">
                            <XCircle className="h-4 w-4 mr-1" />
                            Очікує підтвердження
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 border">
                        {payment.confirmed ? (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            disabled={processingPaymentIds.has(payment.id)}
                            onClick={() => handleConfirmPayment(payment.id, false)}
                          >
                            Скасувати
                          </Button>
                        ) : (
                          <Button 
                            variant="default" 
                            size="sm"
                            disabled={processingPaymentIds.has(payment.id)}
                            onClick={() => handleConfirmPayment(payment.id, true)}
                          >
                            Підтвердити
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 