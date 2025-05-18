'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function LessonsWarning() {
  const [remainingLessons, setRemainingLessons] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRemainingLessons = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/student/lessons-remaining');
        
        if (!response.ok) {
          console.error('Помилка при отриманні кількості уроків');
          return;
        }
        
        const data = await response.json();
        setRemainingLessons(data.remainingLessons);
        setShowWarning(data.showWarning);
      } catch (err) {
        console.error('Помилка при перевірці кількості уроків:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkRemainingLessons();
  }, []);
  
  if (loading || !showWarning) {
    return null;
  }
  
  return (
    <Card className="mb-6 border-yellow-300 bg-yellow-50">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3" />
          <div>
            <p className="font-medium">
              У вас залишилось лише <span className="font-bold">{remainingLessons}</span> {remainingLessons === 1 ? 'урок' : 'уроки'}!
            </p>
            <p className="text-sm text-yellow-700">
              Будь ласка, поповніть баланс, щоб продовжити навчання без перерви.
            </p>
          </div>
        </div>
        <Link href="/student/payments">
          <Button variant="default">
            Оплатити
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
} 