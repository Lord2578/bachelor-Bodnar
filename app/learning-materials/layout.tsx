"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StudentSidebar } from '@/components/student/student-sidebar';
import { TeacherSidebar } from '@/components/teacher/teacher-sidebar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface User {
  id: number;
  role: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function LearningMaterialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {user?.role === 'admin' && <AdminSidebar />}
      {user?.role === 'teacher' && <TeacherSidebar />}
      {user?.role === 'student' && <StudentSidebar />}
      
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="sticky top-0 z-30 h-16 border-b flex items-center px-6 sm:gap-4" style={{ backgroundColor: 'white', borderColor: 'rgb(251,187,20)' }}>
          <div className="flex items-center">
            <div className="lg:hidden relative w-8 h-8 mr-2">
              <Image 
                src="/svg/netable.svg" 
                alt="NE TABLE logo" 
                fill 
                className="object-contain"
              />
            </div>
            <h1 className="text-lg font-bold lg:hidden" style={{ color: 'rgb(6,6,4)' }}>NE TABLE School</h1>
          </div>

          <div className="flex flex-1 items-center justify-end">
            {user && (
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-sm mr-2 hover:bg-gray-100"
                  onClick={() => router.push('/profile')}
                >
                  <span className="text-sm" style={{ color: 'rgb(6,6,4)' }}>
                    {user.first_name} {user.last_name}
                  </span>
                </Button>
              </div>
            )}
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-[rgb(251,187,20)] text-[rgb(6,6,4)] hover:bg-[rgb(251,187,20)] hover:text-[rgb(6,6,4)]"
            >
              Logout
            </Button>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 