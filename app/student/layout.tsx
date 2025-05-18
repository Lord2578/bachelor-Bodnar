"use client";

import type React from "react"
import { Suspense, useEffect, useState } from "react"
import { StudentSidebar } from "@/components/student/student-sidebar"
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };

    const name = getCookie('userName');
    if (name) {
      setUserName(decodeURIComponent(name));
    }
  }, []);

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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      <StudentSidebar />
      
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
            {userName && (
              <span className="text-sm mr-4" style={{ color: 'rgb(6,6,4)' }}>
                Welcome, {userName}
              </span>
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
            <Suspense fallback={<div className="p-8 flex justify-center items-center w-full h-full">Завантаження...</div>}>
              {children}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}

