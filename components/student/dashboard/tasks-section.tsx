"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface HomeworkAssignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  isCompleted?: boolean;
}

const colorVariants = {
  purple: "bg-violet-100 border-violet-200",
  green: "bg-emerald-100 border-emerald-200",
  orange: "bg-orange-100 border-orange-200",
}

const progressColorVariants = {
  purple: "bg-violet-500",
  green: "bg-emerald-500",
  orange: "bg-orange-500",
}

const colorOptions = ["purple", "green", "orange"];

export function TasksSection() {
  const [homeworks, setHomeworks] = useState<HomeworkAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeworks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/student/homework');
        
        if (!response.ok) {
          throw new Error('Failed to fetch homework assignments');
        }
        
        const data = await response.json();
        if (data && data.homework) {
          setHomeworks(data.homework || []);
        } else {
          setHomeworks([]);
        }
      } catch (err) {
        console.error('Error fetching homework:', err);
        setError(err instanceof Error ? err.message : 'Error loading homework');
        setHomeworks([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHomeworks();
  }, []);

  function formatDeadline(dueDate: string): string {
    try {
      const date = new Date(dueDate);
      const today = new Date();
      
      if (date.toDateString() === today.toDateString()) {
        return `Today, ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      }
      
      return `Till ${date.toLocaleDateString()}`;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_unused) {
      return 'No deadline';
    }
  }

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Homework tasks</h2>
          <Button variant="link" className="text-blue-500" asChild>
            <Link href="/student/homework">View all</Link>
          </Button>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Homework tasks</h2>
          <Button variant="link" className="text-blue-500" asChild>
            <Link href="/student/homework">View all</Link>
          </Button>
        </div>
        <div className="p-4 bg-red-50 text-red-500 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-white rounded-lg p-4 shadow-sm flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Homework tasks</h2>
        <Button variant="link" className="text-sm text-blue-500 shrink-0" asChild>
          <Link href="/student/homework">View all</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto">
        {homeworks.length > 0 ? (
          homeworks.slice(0, 3).map((homework, index) => {
            const colorKey = colorOptions[index % colorOptions.length] as "purple" | "green" | "orange";
            const progress = homework.isCompleted ? 100 : 0;
            
            return (
              <Card key={homework.id} className={`p-4 border-2 ${colorVariants[colorKey]} h-[140px] flex flex-col`}>
                <div className="flex flex-col h-full">
                  <h3 className="font-semibold mb-1 text-sm">{homework.title}</h3>
                  <p className="text-gray-600 mb-2 text-xs line-clamp-2">{homework.description}</p>
                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">{formatDeadline(homework.dueDate)}</span>
                      <Button variant="link" className="text-blue-500 p-0 shrink-0 text-xs h-6" asChild>
                        <Link href={`/student/homework/${homework.id}`}>
                          {homework.isCompleted ? 'View' : 'Start'}
                        </Link>
                      </Button>
                    </div>
                    <Progress
                      value={progress}
                      className="h-1.5 bg-gray-100"
                      indicatorClassName={progressColorVariants[colorKey]}
                    />
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 py-8 text-center text-gray-500">
            No homework tasks assigned
          </div>
        )}
      </div>
    </div>
  )
}

