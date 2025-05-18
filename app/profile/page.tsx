"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StudentSidebar } from '@/components/student/student-sidebar';
import { TeacherSidebar } from '@/components/teacher/teacher-sidebar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CertificateUpload from '@/components/teacher/CertificateUpload';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface User {
  id: number;
  role: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        
        if (response.ok) {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const userInitials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {user?.role === 'admin' && <AdminSidebar />}
      {user?.role === 'teacher' && <TeacherSidebar />}
      {user?.role === 'student' && <StudentSidebar />}
      
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="sticky top-0 z-30 h-16 border-b flex items-center px-6 sm:gap-4" style={{ backgroundColor: 'white', borderColor: 'rgb(251,187,20)' }}>
          <div className="flex items-center">
            <h1 className="text-lg font-bold" style={{ color: 'rgb(6,6,4)' }}>Мій профіль</h1>
          </div>

          <div className="flex flex-1 items-center justify-end">
            <Button 
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
              className="text-[rgb(6,6,4)]"
            >
              Назад
            </Button>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <Card className="shadow-sm">
                  <CardContent className="p-6 flex flex-col items-center">
                    <Avatar className="h-32 w-32 border-4 mb-4" style={{ borderColor: 'rgb(251,187,20)' }}>
                      <AvatarImage src="/images/avatar-placeholder.png" alt={`${user.first_name} ${user.last_name}`} />
                      <AvatarFallback style={{ backgroundColor: 'rgb(251,187,20)', color: 'rgb(6,6,4)', fontSize: '2rem' }}>
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold">{user.first_name} {user.last_name}</h2>
                    <p className="text-gray-500 capitalize">{user.role}</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-3">
                <Tabs defaultValue={user.role === 'teacher' ? "personal" : "personal"}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="personal">Особиста інформація</TabsTrigger>
                    {user.role === 'teacher' && (
                      <TabsTrigger value="certificates">Сертифікати</TabsTrigger>
                    )}
                  </TabsList>
                  
                  <TabsContent value="personal">
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle>Особиста інформація</CardTitle>
                        <CardDescription>Ваші дані в системі</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Ім&apos;я</p>
                              <p className="text-base">{user.first_name}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Прізвище</p>
                              <p className="text-base">{user.last_name}</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="text-base">{user.email}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">Роль</p>
                            <p className="text-base capitalize">{user.role}</p>
                          </div>
                          
                          {user.phone && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Телефон</p>
                              <p className="text-base">{user.phone}</p>
                            </div>
                          )}
                          
                          {user.address && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Адреса</p>
                              <p className="text-base">{user.address}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {user.role === 'teacher' && (
                    <TabsContent value="certificates">
                      <CertificateUpload />
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 