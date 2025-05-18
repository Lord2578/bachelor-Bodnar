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
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, Clock, FileIcon, ExternalLink } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';

interface Teacher {
  id: number;
  name: string;
}

interface Homework {
  id: number;
  title: string;
  description: string | null;
  notes: string | null;
  dueDate: string | null;
  isCompleted: boolean;
  assignedAt: string;
  teacher: Teacher;
}

interface HomeworkSubmission {
  id: number;
  homeworkId: number;
  homeworkTitle: string;
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
}

export default function HomeworkSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const homeworkId = params.id as string;
  
  const [homework, setHomework] = useState<Homework | null>(null);
  const [submission, setSubmission] = useState<HomeworkSubmission | null>(null);
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<HomeworkFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchHomeworkDetails = async () => {
      try {
        console.log('Fetching homework details for ID:', homeworkId);
        const response = await fetch(`/api/student/homework?homeworkId=${homeworkId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error fetching homework:', errorData);
          throw new Error(errorData.message || 'Помилка при отриманні даних про домашнє завдання');
        }
        
        const homeworkData = await response.json();
        console.log('Homework data received:', homeworkData);
        
        if (!homeworkData.homework || homeworkData.homework.length === 0) {
          console.error('No homework found in the response:', homeworkData);
          throw new Error('Домашнє завдання не знайдено');
        }
        
        setHomework(homeworkData.homework[0]);
        
        const submissionResponse = await fetch(`/api/student/homework-submission?homeworkId=${homeworkId}`);
        
        if (submissionResponse.ok) {
          const submissionData = await submissionResponse.json();
          
          if (submissionData.submissions && submissionData.submissions.length > 0) {
            const existingSubmission = submissionData.submissions[0];
            setSubmission(existingSubmission);
            setContent(existingSubmission.content || '');
            setLink(existingSubmission.link || '');
          }
        }

        const filesResponse = await fetch(`/api/student/homework-files?homeworkId=${homeworkId}`);
        if (filesResponse.ok) {
          const filesData = await filesResponse.json();
          if (filesData.files) {
            setUploadedFiles(filesData.files);
          }
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
    
    fetchHomeworkDetails();
  }, [homeworkId]);
  
  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;

    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', 'homework');
      formData.append('referenceId', homeworkId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка при завантаженні файлу');
      }

      
      const filesResponse = await fetch(`/api/student/homework-files?homeworkId=${homeworkId}`);
      if (filesResponse.ok) {
        const filesData = await filesResponse.json();
        if (filesData.files) {
          setUploadedFiles(filesData.files);
        }
      }

      setSelectedFile(null);
      setMessage({
        text: 'Файл успішно завантажено',
        type: 'success'
      });

    } catch (error: unknown) {
      console.error('Помилка при завантаженні файлу:', error);
      if (error instanceof Error) {
        setMessage({
          text: error.message,
          type: 'error'
        });
      } else {
        setMessage({
          text: 'Виникла помилка при завантаженні файлу',
          type: 'error'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content && !link && uploadedFiles.length === 0) {
      setMessage({
        text: 'Будь ласка, додайте текст відповіді, посилання або файл для домашньої роботи',
        type: 'error'
      });
      return;
    }
    
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });
    
    try {
      const response = await fetch('/api/student/homework-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          homeworkId: parseInt(homeworkId, 10) || Number(homeworkId),
          content,
          link
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка при відправці домашнього завдання');
      }
      
      await response.json();
      
      setMessage({
        text: 'Домашнє завдання успішно відправлено',
        type: 'success'
      });
      
      const submissionResponse = await fetch(`/api/student/homework-submission?homeworkId=${homeworkId}`);
      
      if (submissionResponse.ok) {
        const submissionData = await submissionResponse.json();
        
        if (submissionData.submissions && submissionData.submissions.length > 0) {
          setSubmission(submissionData.submissions[0]);
        }
      }
      
      if (homework && !homework.isCompleted) {
        const homeworkResponse = await fetch('/api/student/homework', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            homeworkId: Number(homeworkId),
            isCompleted: true
          })
        });
        
        if (homeworkResponse.ok) {
          setHomework(prev => prev ? {...prev, isCompleted: true} : null);
        }
      }
      
    } catch (error: unknown) {
      console.error('Помилка при відправці домашнього завдання:', error);
      if (error instanceof Error) {
        setMessage({
          text: error.message,
          type: 'error'
        });
      } else {
        setMessage({
          text: 'Виникла помилка при відправці завдання',
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
  
  const isDueDatePast = (dateString: string | null) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    return dueDate < new Date();
  };
  
  const getFileName = (fileUrl: string) => {
    const fileName = fileUrl.split('/').pop() || 'Файл';
    return decodeURIComponent(fileName);
  };
  
  const renderSubmissionForm = () => {
    if (!homework) return null;
  
    if (submission?.grade) {
      return (
        <div className="space-y-4">
          <div className="text-lg font-semibold text-gray-900">Ваша відповідь:</div>
          {submission.content && (
            <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">{submission.content}</div>
          )}
          {submission.link && (
            <div className="bg-blue-50 p-3 rounded-md flex items-center">
              <ExternalLink className="h-5 w-5 text-blue-500 mr-2" />
              <a 
                href={submission.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate"
              >
                {submission.link}
              </a>
            </div>
          )}
          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-medium mb-2">Завантажені файли:</h3>
              <div className="space-y-2">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="bg-gray-50 p-3 rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <FileIcon className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-sm">{getFileName(file.file_url)}</span>
                    </div>
                    <a 
                      href={file.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Відкрити
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-green-50 p-4 rounded-md">
            <div className="font-medium text-green-800">Оцінка: {submission.grade}</div>
            {submission.teacherComment && (
              <div className="mt-2">
                <div className="text-sm font-medium text-green-800">Коментар викладача:</div>
                <div className="text-sm text-green-700 mt-1">{submission.teacherComment}</div>
              </div>
            )}
          </div>
        </div>
      );
    }
  
    if (submission) {
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
              <div className="text-blue-700 font-medium">Відповідь відправлено</div>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Ваша відповідь на перевірці у викладача
            </p>
          </div>
          
          <div className="text-lg font-semibold text-gray-900">Ваша відповідь:</div>
          {submission.content && (
            <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">{submission.content}</div>
          )}
          {submission.link && (
            <div className="bg-blue-50 p-3 rounded-md flex items-center">
              <ExternalLink className="h-5 w-5 text-blue-500 mr-2" />
              <a 
                href={submission.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate"
              >
                {submission.link}
              </a>
            </div>
          )}
          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-md font-medium mb-2">Завантажені файли:</h3>
              <div className="space-y-2">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="bg-gray-50 p-3 rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <FileIcon className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-sm">{getFileName(file.file_url)}</span>
                    </div>
                    <a 
                      href={file.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Відкрити
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="border-t pt-4 mt-4">
            <div className="text-lg font-semibold text-gray-900 mb-3">Додати до відповіді:</div>
            
            <form className="space-y-4">
              <div>
                <Label htmlFor="content">Текст відповіді:</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Введіть вашу відповідь..."
                  className="min-h-[120px]"
                />
              </div>
              
              <div>
                <Label htmlFor="link">Посилання на роботу:</Label>
                <Input
                  id="link"
                  type="url"
                  value={link}
                  onChange={e => setLink(e.target.value)}
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Посилання на Google Drive, Google Docs тощо
                </p>
              </div>
              
              <div>
                <Label>Додати файл:</Label>
                <div className="mt-2">
                  <FileUpload 
                    onFileSelected={handleFileSelected}
                    description="Завантажте документ або зображення з вашою роботою"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 justify-end">
                {selectedFile && (
                  <Button 
                    type="button" 
                    onClick={handleUploadFile}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Завантаження...' : 'Завантажити файл'}
                  </Button>
                )}
                
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Відправка...' : 'Оновити відповідь'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      );
    }
  
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="content">Текст відповіді:</Label>
          <Textarea
            id="content"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Введіть вашу відповідь..."
            className="min-h-[120px]"
          />
        </div>
        
        <div>
          <Label htmlFor="link">Посилання на роботу:</Label>
          <Input
            id="link"
            type="url"
            value={link}
            onChange={e => setLink(e.target.value)}
            placeholder="https://..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Посилання на Google Drive, Google Docs тощо
          </p>
        </div>
        
        <div>
          <Label>Додати файл:</Label>
          <div className="mt-2">
            <FileUpload 
              onFileSelected={handleFileSelected}
              description="Завантажте документ або зображення з вашою роботою"
            />
          </div>
        </div>
        
        {uploadedFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-medium mb-2">Завантажені файли:</h3>
            <div className="space-y-2">
              {uploadedFiles.map(file => (
                <div key={file.id} className="bg-gray-50 p-3 rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <FileIcon className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm">{getFileName(file.file_url)}</span>
                  </div>
                  <a 
                    href={file.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Відкрити
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-2 justify-end">
          {selectedFile && (
            <Button 
              type="button" 
              onClick={handleUploadFile}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Завантаження...' : 'Завантажити файл'}
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={isSubmitting || (!content && !link && !selectedFile && uploadedFiles.length === 0)}
          >
            {isSubmitting ? 'Відправка...' : 'Відправити відповідь'}
          </Button>
        </div>
      </form>
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
          <Button onClick={() => router.push('/student/homework')}>
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
          <Button onClick={() => router.push('/student/homework')}>
            Повернутися до списку завдань
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <Button 
        variant="outline" 
        onClick={() => router.push('/student/homework')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Всі домашні завдання
      </Button>
      
      {message.text && (
        <div 
          className={`p-4 mb-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}
      
      {homework && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{homework.title}</CardTitle>
              <Badge className={
                homework.isCompleted 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : isDueDatePast(homework.dueDate) 
                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }>
                {homework.isCompleted 
                  ? 'Відправлено' 
                  : isDueDatePast(homework.dueDate) 
                    ? 'Протерміновано' 
                    : 'Активне'}
              </Badge>
            </div>
            <CardDescription>
              Вчитель: {homework.teacher.name}
              {homework.dueDate && (
                <div className="flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-1 text-gray-500" />
                  <span className={`text-sm ${
                    isDueDatePast(homework.dueDate) && !homework.isCompleted 
                      ? 'text-red-600' 
                      : 'text-gray-500'
                  }`}>
                    Термін: {formatDate(homework.dueDate)}
                    {isDueDatePast(homework.dueDate) && !homework.isCompleted && (
                      <span className="ml-2 text-red-600 font-medium">
                        (Протерміновано)
                      </span>
                    )}
                  </span>
                </div>
              )}
              <div className="text-sm text-gray-500 mt-1">
                Дата призначення: {formatDate(homework.assignedAt)}
              </div>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {homework.description && (
              <div>
                <div className="text-lg font-semibold mb-2">Опис завдання:</div>
                <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                  {homework.description}
                </div>
              </div>
            )}
            
            {homework.notes && (
              <div>
                <div className="text-lg font-semibold mb-2">Додаткові нотатки:</div>
                <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                  {homework.notes}
                </div>
              </div>
            )}
            
            <div className="border-t pt-4">
              <div className="text-lg font-semibold mb-4">
                {submission ? 'Ваша відповідь' : 'Відправити домашнє завдання'}
              </div>
              
              {renderSubmissionForm()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 