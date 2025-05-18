"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Users, GraduationCap, UserPlus, FileText, CalendarClock, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Stats {
  studentsCount: number;
  teachersCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ studentsCount: 0, teachersCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const studentsResponse = await fetch('/api/students');
        const studentsData = await studentsResponse.json();
        
        const teachersResponse = await fetch('/api/teachers');
        const teachersData = await teachersResponse.json();
        
        setStats({
          studentsCount: studentsData.students?.length || 0,
          teachersCount: teachersData.teachers?.length || 0
        });
      } catch (error) {
        console.error('Error loading statistics:', error);
        setError('Failed to load statistics. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[rgb(251,187,20)] mx-auto mb-4"></div>
          <p className="text-[rgb(6,6,4)]">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center md:flex-row md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[rgb(6,6,4)]">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and quick actions</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center">
            <div className="relative w-12 h-12 mr-3">
              <Image 
                src="/images/netable.png" 
                alt="NE TABLE School" 
                fill 
                className="object-contain"
              />
            </div>
            <h2 className="text-xl font-bold text-[rgb(6,6,4)]">NE TABLE School</h2>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-[rgb(251,187,20)] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[rgb(6,6,4)]">Students</CardTitle>
            <Users className="h-4 w-4 text-[rgb(6,6,4)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[rgb(6,6,4)]">{stats.studentsCount}</div>
            <p className="text-xs text-gray-600">Registered students in the system</p>
            <div className="mt-4">
              <Button variant="link" className="px-0 text-[rgb(6,6,4)] hover:text-[rgb(251,187,20)] font-medium text-sm flex items-center" asChild>
                <Link href="/admin/students">
                  View all students
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-[rgb(251,187,20)] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[rgb(6,6,4)]">Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-[rgb(6,6,4)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[rgb(6,6,4)]">{stats.teachersCount}</div>
            <p className="text-xs text-gray-600">Total teachers in the system</p>
            <div className="mt-4">
              <Button variant="link" className="px-0 text-[rgb(6,6,4)] hover:text-[rgb(251,187,20)] font-medium text-sm flex items-center" asChild>
                <Link href="/admin/teachers">
                  View all teachers
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="border-[rgb(251,187,20)] shadow-sm">
        <CardHeader>
          <CardTitle className="text-[rgb(6,6,4)]">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto flex items-center justify-start p-4 whitespace-normal text-sm border-[rgb(251,187,20)] text-[rgb(6,6,4)] hover:bg-[rgb(251,187,20)] hover:text-[rgb(6,6,4)]" 
              asChild
            >
              <Link href="/admin/students">
                <Users className="h-5 w-5 min-w-5 mr-2" />
                <span>Manage Students</span>
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto flex items-center justify-start p-4 whitespace-normal text-sm border-[rgb(251,187,20)] text-[rgb(6,6,4)] hover:bg-[rgb(251,187,20)] hover:text-[rgb(6,6,4)]" 
              asChild
            >
              <Link href="/admin/teachers">
                <GraduationCap className="h-5 w-5 min-w-5 mr-2" />
                <span>Manage Teachers</span>
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto flex items-center justify-start p-4 whitespace-normal text-sm border-[rgb(251,187,20)] text-[rgb(6,6,4)] hover:bg-[rgb(251,187,20)] hover:text-[rgb(6,6,4)]" 
              asChild
            >
              <Link href="/admin/create-user">
                <UserPlus className="h-5 w-5 min-w-5 mr-2" />
                <span>Create New User</span>
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto flex items-center justify-start p-4 whitespace-normal text-sm border-[rgb(251,187,20)] text-[rgb(6,6,4)] hover:bg-[rgb(251,187,20)] hover:text-[rgb(6,6,4)]" 
              asChild
            >
              <Link href="/admin/leads">
                <FileText className="h-5 w-5 min-w-5 mr-2" />
                <span>Test Applications</span>
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto flex items-center justify-start p-4 whitespace-normal text-sm border-[rgb(251,187,20)] text-[rgb(6,6,4)] hover:bg-[rgb(251,187,20)] hover:text-[rgb(6,6,4)]" 
              asChild
            >
              <Link href="/admin/manage-assignments">
                <CalendarClock className="h-5 w-5 min-w-5 mr-2" />
                <span>Assign Students</span>
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto flex items-center justify-start p-4 whitespace-normal text-sm border-[rgb(251,187,20)] text-[rgb(6,6,4)] hover:bg-[rgb(251,187,20)] hover:text-[rgb(6,6,4)]" 
              asChild
            >
              <Link href="/admin/reports">
                <BarChart className="h-5 w-5 min-w-5 mr-2" />
                <span>Financial Reports</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 