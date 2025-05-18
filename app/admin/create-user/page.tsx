"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phoneNumber: string;
  role: 'student' | 'teacher';
  englishLevel?: string;
  goals?: string;
  experience?: string;
  certificates?: string;
}

export default function CreateUserPage() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    phoneNumber: '',
    role: 'student',
    englishLevel: '',
    goals: '',
    experience: '',
    certificates: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCheckingDomain, setIsCheckingDomain] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (value && !emailRegex.test(value)) {
        setError('Будь ласка, введіть коректну email адресу');
      } else {
        setError(null);
      }
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmailDomain = async (email: string): Promise<boolean> => {
    setIsCheckingDomain(true);
    try {
      const response = await fetch('/api/validate-email-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!data.valid) {
        setError(data.message);
        return false;
      }
      
      return true;
    } catch {
      setError('Помилка перевірки домену електронної пошти');
      return false;
    } finally {
      setIsCheckingDomain(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError('Будь ласка, введіть коректну email адресу');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const isValidDomain = await validateEmailDomain(formData.email);
    if (!isValidDomain) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/admin/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Помилка при створенні користувача');
      }

      setSuccess(`Користувач успішно створений з роллю: ${formData.role}`);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        birthDate: '',
        phoneNumber: '',
        role: 'student',
        englishLevel: '',
        goals: '',
        experience: '',
        certificates: ''
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Виникла невідома помилка');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Створення нового користувача</h1>

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

      <Card>
        <CardHeader>
          <CardTitle>Форма створення користувача</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Пароль *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Мінімум 6 символів"
                  />
                </div>

                <div>
                  <Label htmlFor="firstName">Ім&apos;я *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Прізвище *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="birthDate">Дата народження</Label>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Номер телефону</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="380501234567"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Роль користувача *</Label>
                  <select
                    id="role"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="student">Студент</option>
                    <option value="teacher">Викладач</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="englishLevel">Рівень англійської</Label>
                  <select
                    id="englishLevel"
                    name="englishLevel"
                    value={formData.englishLevel || ''}
                    onChange={handleChange}
                    className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Оберіть рівень</option>
                    <option value="A1">A1 (Beginner)</option>
                    <option value="A2">A2 (Elementary)</option>
                    <option value="B1">B1 (Intermediate)</option>
                    <option value="B2">B2 (Upper Intermediate)</option>
                    <option value="C1">C1 (Advanced)</option>
                    <option value="C2">C2 (Proficiency)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {formData.role === 'student' && (
                  <div>
                    <Label htmlFor="goals">Цілі навчання</Label>
                    <textarea
                      id="goals"
                      name="goals"
                      rows={4}
                      value={formData.goals || ''}
                      onChange={handleChange}
                      className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Опишіть цілі навчання студента"
                    ></textarea>
                  </div>
                )}

                {formData.role === 'teacher' && (
                  <>
                    <div>
                      <Label htmlFor="experience">Досвід роботи</Label>
                      <textarea
                        id="experience"
                        name="experience"
                        rows={4}
                        value={formData.experience || ''}
                        onChange={handleChange}
                        className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Опишіть досвід роботи викладача"
                      ></textarea>
                    </div>
                    <div>
                      <Label htmlFor="certificates">Сертифікати</Label>
                      <textarea
                        id="certificates"
                        name="certificates"
                        rows={4}
                        value={formData.certificates || ''}
                        onChange={handleChange}
                        className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Перелічіть сертифікати та кваліфікації"
                      ></textarea>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="text-right mt-6">
              <Button 
                type="submit"
                disabled={isLoading || isCheckingDomain}
                className="w-full mt-6"
              >
                {isLoading ? 'Створення...' : isCheckingDomain ? 'Перевірка домену...' : 'Створити користувача'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 