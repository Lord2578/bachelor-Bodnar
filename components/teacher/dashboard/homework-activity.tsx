"use client";

import Link from "next/link"
import { Paperclip, User } from "lucide-react"
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { CustomAvatar, CustomAvatarFallback } from "@/components/ui/custom-avatar"
import { CustomButton } from "@/components/ui/custom-button"

interface HomeworkSubmission {
  id: number;
  homeworkId?: number;
  studentId?: number;
  studentName: string;
  studentEmail?: string;
  homeworkTitle?: string;
  submittedAt: string;
  content?: string | null;
  link?: string | null;
  teacherComment?: string | null;
  grade?: string | null;
  title?: string;
  isCompleted?: boolean;
}

interface HomeworkActivityProps {
  homeworkSubmissions?: HomeworkSubmission[];
  recentHomework?: HomeworkSubmission[];
  formatDate?: (date: string) => string;
}

export function HomeworkActivity({ homeworkSubmissions, recentHomework, formatDate: propFormatDate }: HomeworkActivityProps) {
  const submissions = recentHomework || homeworkSubmissions || [];

  const formatDate = propFormatDate || ((dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd.MM.yyyy', { locale: uk });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_unused) {
      return '';
    }
  });

  const isGraded = (submission: HomeworkSubmission): boolean => {
    return submission.grade !== null && 
           submission.grade !== undefined && 
           submission.grade !== '';
  }
  
  const isReviewed = (submission: HomeworkSubmission): boolean => {
    return (submission.teacherComment !== null && 
            submission.teacherComment !== undefined && 
            submission.teacherComment !== '') || 
            isGraded(submission) ||
            (submission.isCompleted === true);
  }

  return (
    <div className="space-y-4 bg-white rounded-lg p-4 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Останні відповіді на домашні</h2>
        <CustomButton variant="link" className="text-sm text-blue-500 shrink-0">
          <Link href="/teacher/homework">
            Всі домашні
          </Link>
        </CustomButton>
      </div>
      <div className="space-y-4 overflow-auto flex-1 max-h-[400px]">
        {!submissions || submissions.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Немає нових відповідей на домашні завдання</p>
          </div>
        ) : (
          submissions.map((submission) => (
            <Link
              key={submission.id}
              href={`/teacher/homework/${submission.homeworkId || submission.id}`}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors border border-gray-100"
            >
              <CustomAvatar>
                <User className="h-6 w-6 text-gray-500" />
                <CustomAvatarFallback>{submission.studentName.substring(0, 2).toUpperCase()}</CustomAvatarFallback>
              </CustomAvatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {submission.studentName}
                  <span className="text-xs text-gray-500 ml-2">
                    {formatDate(submission.submittedAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{submission.homeworkTitle || submission.title}</span>
                  {submission.link && <Paperclip className="h-3 w-3 flex-shrink-0" />}
                </div>
                <div className="mt-1 text-xs">
                  {isGraded(submission) ? (
                    <span className="text-green-600">Оцінено: {submission.grade}</span>
                  ) : isReviewed(submission) ? (
                    <span className="text-blue-600">Перевірено</span>
                  ) : (
                    <span className="text-orange-500">Не перевірено</span>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

