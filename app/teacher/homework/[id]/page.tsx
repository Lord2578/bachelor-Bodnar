"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, FileIcon, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface Homework {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  title: string;
  description: string | null;
  notes: string | null;
  dueDate: string | null;
  isCompleted: boolean;
  assignedAt: string;
  classId: number | null;
}

interface HomeworkSubmission {
  id: number;
  homeworkId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  homeworkTitle: string;
  homeworkDescription: string | null;
  dueDate: string | null;
  submittedAt: string;
  content: string | null;
  link: string | null;
  teacherComment: string | null;
  grade: string | null;
}

interface HomeworkFile {
  id: number;
  file_url: string;
  uploaded_at: string;
  student_name: string;
  student_id: number;
}

export default function TeacherHomeworkDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const homeworkId = params.id as string;
  
  const [homework, setHomework] = useState<Homework | null>(null);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<HomeworkSubmission | null>(null);
  const [teacherComment, setTeacherComment] = useState('');
  const [grade, setGrade] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [viewedIds] = useState<Set<number>>(new Set());
  const [homeworkFiles, setHomeworkFiles] = useState<HomeworkFile[]>([]);
  const [filesFetchError, setFilesFetchError] = useState<string | null>(null);
  
  useEffect(() => {
    if (homeworkId && viewedIds.has(Number(homeworkId))) {
      console.log(`Запобігання повторному відкриттю завдання #${homeworkId}`);
      return;
    }
    
    const fetchHomeworkData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setFilesFetchError(null);
        
        const homeworkResponse = await fetch(`/api/teacher/homework?homeworkId=${homeworkId}`);
        
        if (!homeworkResponse.ok) {
          const errorData = await homeworkResponse.json();
          throw new Error(errorData.message || 'Помилка при отриманні даних про домашнє завдання');
        }
        
        const homeworkData = await homeworkResponse.json();
        
        if (!homeworkData.homework || homeworkData.homework.length === 0) {
          throw new Error('Домашнє завдання не знайдено');
        }
        
        setHomework(homeworkData.homework[0]);
        
        viewedIds.add(Number(homeworkId));
        
        const submissionsResponse = await fetch(`/api/teacher/homework-submissions?homeworkId=${homeworkId}`);
        
        if (submissionsResponse.ok) {
          const submissionsData = await submissionsResponse.json();
          
          if (submissionsData.submissions) {
            const uniqueSubmissions = Array.from(
              new Map(submissionsData.submissions.map((s: HomeworkSubmission) => [s.id, s]))
              .values()
            ) as HomeworkSubmission[];
            
            setSubmissions(uniqueSubmissions);
            
            if (uniqueSubmissions.length > 0) {
              const firstSubmission = uniqueSubmissions[0] as HomeworkSubmission;
              setSelectedSubmission(firstSubmission);
              setTeacherComment(firstSubmission.teacherComment || '');
              setGrade(firstSubmission.grade || '');
            }
          }
        }

        try {
          console.log(`Fetching files for homework ID: ${homeworkId}`);
          const filesResponse = await fetch(`/api/teacher/homework-files?homeworkId=${homeworkId}`);
          
          if (!filesResponse.ok) {
            const errorData = await filesResponse.json();
            throw new Error(errorData.message || 'Помилка при отриманні файлів завдання');
          }
          
          const filesData = await filesResponse.json();
          console.log('Files data received:', filesData);
          
          if (filesData.files) {
            setHomeworkFiles(filesData.files);
          } else {
            console.log('No files property in response:', filesData);
            setHomeworkFiles([]);
          }
        } catch (fileError) {
          console.error('Error fetching homework files:', fileError);
          setFilesFetchError(fileError instanceof Error ? fileError.message : 'Помилка при завантаженні файлів');
        }
        
      } catch (error: unknown) {
        console.error('Помилка при завантаженні даних:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Виникла помилка при завантаженні даних');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHomeworkData();
  }, [homeworkId, viewedIds]);
  
  const handleSelectSubmission = (submission: HomeworkSubmission) => {
    setSelectedSubmission(submission);
    setTeacherComment(submission.teacherComment || '');
    setGrade(submission.grade || '');
  };
  
  const handleSubmitGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSubmission) return;
    
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });
    
    try {
      const response = await fetch('/api/teacher/homework-submissions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          teacherComment,
          grade
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка при оцінюванні домашнього завдання');
      }
      
      const data = await response.json();
      
      setMessage({
        text: data.message || 'Домашнє завдання успішно оцінено',
        type: 'success'
      });
      
      const updatedSubmissions = submissions.map(sub => {
        if (sub.id === selectedSubmission.id) {
          return {
            ...sub,
            teacherComment,
            grade
          };
        }
        return sub;
      });
      
      setSubmissions(updatedSubmissions);
      
    } catch (error: unknown) {
      console.error('Помилка при оцінюванні домашнього завдання:', error);
      if (error instanceof Error) {
        setMessage({
          text: error.message,
          type: 'error'
        });
      } else {
        setMessage({
          text: 'Виникла помилка при оцінюванні завдання',
          type: 'error'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, 'PPP', { locale: uk });
    } catch (e) {
      console.error('Помилка форматування дати:', e);
      return 'Некоректна дата';
    }
  };
  
  const getSubmissionStatus = (submission: HomeworkSubmission) => {
    if (submission.grade) {
      return {
        text: 'Оцінено',
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-4 w-4 mr-1" />
      };
    }
    
    return {
      text: 'Очікує перевірки',
      color: 'bg-yellow-100 text-yellow-800',
      icon: <Clock className="h-4 w-4 mr-1" />
    };
  };
  
  const isDueDatePast = (dateString: string | null) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    return dueDate < new Date();
  };
  
  const renderFiles = () => {
    if (filesFetchError) {
      return (
        <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">
          <p className="font-medium">Помилка при завантаженні файлів</p>
          <p className="text-sm">{filesFetchError}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Спробувати знову
          </Button>
        </div>
      );
    }
    
    if (homeworkFiles.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-gray-500">Учень не завантажив жодних файлів для цього завдання</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {homeworkFiles.map(file => {
          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.file_url);
          const fileDate = formatDate(file.uploaded_at);
          
          return (
            <div key={file.id} className="border rounded-md p-3 flex justify-between items-center bg-white">
              <div className="flex items-center flex-1">
                {isImage ? (
                  <Image 
                    src={file.file_url} 
                    alt="Preview" 
                    width={40}
                    height={40}
                    className="rounded object-cover mr-3"
                  />
                ) : (
                  <FileIcon className="h-8 w-8 text-blue-500 mr-3" />
                )}
                <div>
                  <div className="font-medium">
                    {file.file_url.split('/').pop()}
                  </div>
                  <div className="text-sm text-gray-500 flex flex-col sm:flex-row sm:gap-2">
                    <span>Завантажено: {fileDate}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Учень: {file.student_name || 'Невідомий учень'}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <a 
                  href={file.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-blue-500 hover:text-blue-700"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Завантаження даних...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Помилка завантаження</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/teacher/homework')}>
            Повернутися до списку завдань
          </Button>
        </div>
      </div>
    );
  }
  
  if (!homework) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Завдання не знайдено</h2>
          <p className="text-gray-600 mb-4">Домашнє завдання не знайдено або у вас немає доступу до нього.</p>
          <Button onClick={() => router.push('/teacher/homework')}>
            Повернутися до списку завдань
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/teacher/homework">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{homework.title}</h2>
            <div className="flex items-center mt-1 space-x-2">
              <p className="text-gray-500">Учень: {homework.studentName}</p>
              {submissions.length > 0 && (
                <Badge className={homework.isCompleted && !submissions.some(s => s.grade) 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : getSubmissionStatus(submissions[0]).color} variant="outline">
                  <span className="flex items-center">
                    {homework.isCompleted && !submissions.some(s => s.grade) 
                      ? <Clock className="h-4 w-4 mr-1" /> 
                      : getSubmissionStatus(submissions[0]).icon}
                    {homework.isCompleted && !submissions.some(s => s.grade) 
                      ? 'Потребує перевірки' 
                      : getSubmissionStatus(submissions[0]).text}
                  </span>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {message.text && (
        <div className={`p-4 mb-4 rounded-md ${
          message.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
        }`}>
          {message.text}
          <button 
            onClick={() => setMessage({text: '', type: ''})} 
            className="ml-2 text-sm font-medium underline"
          >
            Закрити
          </button>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Завантажені файли</CardTitle>
          <CardDescription>
            Файли, які учень завантажив для цього завдання
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderFiles()}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Деталі завдання</CardTitle>
            <CardDescription>Інформація про домашнє завдання</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {homework.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Опис завдання:</h4>
                <p className="text-gray-800 whitespace-pre-line">{homework.description}</p>
              </div>
            )}
            
            {homework.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Примітки:</h4>
                <p className="text-gray-800 whitespace-pre-line">{homework.notes}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Дата призначення:</h4>
                <p className="text-gray-800">{formatDate(homework.assignedAt)}</p>
              </div>
              
              {homework.dueDate && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Термін здачі:</h4>
                  <p className={`flex items-center ${isDueDatePast(homework.dueDate) && !homework.isCompleted ? 'text-red-600 font-medium' : 'text-gray-800'}`}>
                    {formatDate(homework.dueDate)}
                    {isDueDatePast(homework.dueDate) && !homework.isCompleted && (
                      <>
                        <AlertCircle className="h-4 w-4 ml-1" />
                        <span className="ml-1">(Прострочено)</span>
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Статус:</h4>
              <div className="flex items-center">
                <div 
                  className={`w-3 h-3 rounded-full ${
                    homework.isCompleted 
                      ? 'bg-green-500' 
                      : isDueDatePast(homework.dueDate) 
                        ? 'bg-red-500'
                        : 'bg-blue-500'
                  }`} 
                />
                <span className="ml-2 text-sm">
                  {homework.isCompleted 
                    ? 'Виконано' 
                    : isDueDatePast(homework.dueDate) 
                      ? 'Прострочено' 
                      : 'Активне'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Відповіді на завдання</CardTitle>
                <CardDescription>
                  {submissions.length === 0 
                    ? 'Учень ще не відповів на це завдання' 
                    : `Відповіді на домашнє завдання`}
                </CardDescription>
              </div>
              {submissions.length > 0 && (
                <Badge className={homework.isCompleted && !submissions.some(s => s.grade) 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : getSubmissionStatus(submissions[0]).color} variant="outline">
                  <span className="flex items-center">
                    {homework.isCompleted && !submissions.some(s => s.grade) 
                      ? <Clock className="h-4 w-4 mr-1" /> 
                      : getSubmissionStatus(submissions[0]).icon}
                    {homework.isCompleted && !submissions.some(s => s.grade) 
                      ? 'Потребує перевірки' 
                      : getSubmissionStatus(submissions[0]).text}
                  </span>
                </Badge>
              )}
            </div>
          </CardHeader>
          {submissions.length === 0 ? (
            <CardContent>
              <div className="text-center py-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">
                  Учень ще не відправив відповідь на це завдання
                </p>
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <Tabs defaultValue="view" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="view">Відповідь учня</TabsTrigger>
                  <TabsTrigger value="grade">Оцінити</TabsTrigger>
                </TabsList>
                
                <TabsContent value="view" className="space-y-4">
                  {submissions.map((submission) => (
                    <div 
                      key={submission.id} 
                      className={`border p-4 rounded-md ${selectedSubmission?.id === submission.id ? 'border-blue-500 bg-blue-50' : ''}`}
                      onClick={() => handleSelectSubmission(submission)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">Відповідь від {submission.studentName}</h4>
                          <p className="text-xs text-gray-500">Відправлено: {formatDate(submission.submittedAt)}</p>
                        </div>
                        <Badge className={homework.isCompleted && !submissions.some(s => s.grade) 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : getSubmissionStatus(submission).color} variant="outline">
                          <span className="flex items-center">
                            {homework.isCompleted && !submissions.some(s => s.grade) 
                              ? <Clock className="h-4 w-4 mr-1" /> 
                              : getSubmissionStatus(submission).icon}
                            {homework.isCompleted && !submissions.some(s => s.grade) 
                              ? 'Потребує перевірки' 
                              : getSubmissionStatus(submission).text}
                          </span>
                        </Badge>
                      </div>
                      
                      {submission.content && (
                        <div className="mt-3">
                          <Label className="text-xs text-gray-500">Відповідь учня:</Label>
                          <p className="text-sm whitespace-pre-line">{submission.content}</p>
                        </div>
                      )}
                      
                      {submission.link && (
                        <div className="mt-3">
                          <Label className="text-xs text-gray-500">Посилання:</Label>
                          <p className="text-sm">
                            <a 
                              href={submission.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {submission.link}
                            </a>
                          </p>
                        </div>
                      )}
                      
                      {submission.teacherComment && (
                        <div className="mt-3 pt-3 border-t">
                          <Label className="text-xs text-gray-500">Ваш коментар:</Label>
                          <p className="text-sm">{submission.teacherComment}</p>
                        </div>
                      )}
                      
                      {submission.grade && (
                        <div className="mt-2">
                          <Label className="text-xs text-gray-500">Ваша оцінка:</Label>
                          <p className="text-sm font-bold">{submission.grade}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="grade">
                  {selectedSubmission ? (
                    <form onSubmit={handleSubmitGrade} className="space-y-4">
                      <div className="p-3 border rounded-md mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium mb-1">Відповідь від {selectedSubmission.studentName}</h4>
                            <p className="text-xs text-gray-500">
                              Відправлено: {formatDate(selectedSubmission.submittedAt)}
                            </p>
                          </div>
                          <Badge className={homework.isCompleted && !submissions.some(s => s.grade) 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : getSubmissionStatus(selectedSubmission).color} variant="outline">
                            <span className="flex items-center">
                              {homework.isCompleted && !submissions.some(s => s.grade) 
                                ? <Clock className="h-4 w-4 mr-1" /> 
                                : getSubmissionStatus(selectedSubmission).icon}
                              {homework.isCompleted && !submissions.some(s => s.grade) 
                                ? 'Потребує перевірки' 
                                : getSubmissionStatus(selectedSubmission).text}
                            </span>
                          </Badge>
                        </div>
                        
                        {selectedSubmission.content && (
                          <div className="mb-3">
                            <Label className="text-xs text-gray-500">Відповідь учня:</Label>
                            <p className="text-sm mt-1 whitespace-pre-line">{selectedSubmission.content}</p>
                          </div>
                        )}
                        
                        {selectedSubmission.link && (
                          <div className="mb-3">
                            <Label className="text-xs text-gray-500">Посилання:</Label>
                            <p className="text-sm mt-1">
                              <a 
                                href={selectedSubmission.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {selectedSubmission.link}
                              </a>
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="grade">Оцінка</Label>
                        <Input
                          id="grade"
                          placeholder="Наприклад: 10/12 або A+"
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="teacherComment">Коментар</Label>
                        <Textarea
                          id="teacherComment"
                          placeholder="Напишіть коментар до роботи учня..."
                          rows={4}
                          value={teacherComment}
                          onChange={(e) => setTeacherComment(e.target.value)}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Збереження...' : 'Зберегти оцінку та коментар'}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">
                        Виберіть відповідь учня для оцінювання
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
} 