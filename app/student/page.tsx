"use client"

import { useEffect, useState } from 'react';
import { CalendarWidget } from "@/components/student/dashboard/calendar-widget"
import { TasksSection } from "@/components/student/dashboard/tasks-section"
import LessonsWarning from "@/components/student/dashboard/lessons-warning"


interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user');
        
        if (!response.ok) {
          throw new Error('Failed to load user data');
        }
        
        const data = await response.json();
        
        if (response.ok) {
          setUser(data.user);
        } else {
          setError('Failed to load user data');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Error loading user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const response = await fetch('/api/student/schedule?upcoming=true&limit=3');
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.classes) {
            console.log(`Found ${data.classes.length} upcoming classes`);
          }
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
      }
    };
    
    if (user) {
    fetchCalendarData();
    }
  }, [user]);
  
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Error loading dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full">
      <div className="flex flex-col lg:flex-row w-full">
        <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8 overflow-auto">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.name || 'Student'}</h1>
            <p className="text-muted-foreground">Let`s study!</p>
          </div>

          <LessonsWarning />

          <TasksSection />
        </div>

        <div className="w-full lg:w-auto lg:min-w-[300px] lg:max-w-[350px] xl:max-w-[400px] border-t lg:border-l lg:border-t-0 p-4 md:p-6 lg:p-8 bg-white flex-shrink-0">
          <div className="space-y-6">
            <CalendarWidget events={[]} />
          </div>
        </div>
      </div>
    </div>
  );
}

