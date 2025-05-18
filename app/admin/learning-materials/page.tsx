"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { FileIcon, ExternalLink } from 'lucide-react';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface LearningMaterial {
  id: number;
  title: string;
  description: string;
  file_url: string;
  uploaded_by_admin_id: number;
  uploaded_at: string;
  admin_name?: string;
}

export default function LearningMaterialsPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error'; message: string} | null>(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        
        if (response.ok) {
          setUser(data.user);
        } else {
          setError('Не вдалося завантажити дані користувача');
        }
      } catch (error) {
        console.error('Помилка завантаження даних користувача', error);
        setError('Не вдалося завантажити дані користувача');
      }
    };

    fetchUserData();
  }, []);
  
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/admin/learning-materials');
        
        if (!response.ok) {
          throw new Error('Помилка при отриманні даних');
        }
        
        const data = await response.json();
        if (data && data.materials) {
          setMaterials(data.materials || []);
        } else {
          setMaterials([]);
        }
      } catch (err) {
        console.error('Помилка при завантаженні навчальних матеріалів:', err);
        setError(err instanceof Error ? err.message : 'Сталася помилка');
      } finally {
        setLoading(false);
      }
    };
    
    if (user && user.role === 'admin') {
      fetchMaterials();
    }
  }, [user]);
  
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  
  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setNotification({
        type: 'error',
        message: 'Будь ласка, введіть назву матеріалу'
      });
      return;
    }
    
    if (!selectedFile) {
      setNotification({
        type: 'error',
        message: 'Будь ласка, виберіть файл для завантаження'
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', 'learning_material');
      formData.append('title', title);
      formData.append('description', description);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка при завантаженні файлу');
      }
      
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      
      const materialsResponse = await fetch('/api/admin/learning-materials');
      if (materialsResponse.ok) {
        const data = await materialsResponse.json();
        if (data && data.materials) {
          setMaterials(data.materials || []);
        }
      }
      
      setNotification({
        type: 'success',
        message: 'Навчальний матеріал успішно завантажено'
      });
    } catch (error) {
      console.error('Помилка при завантаженні матеріалу:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Помилка при завантаженні матеріалу'
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPP, HH:mm', { locale: uk });
    } catch {
      return dateString || 'Н/Д';
    }
  };
  
  if (loading && !user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-2xl">Завантаження даних...</div>
        </div>
      </div>
    );
  }
  
  if (user && user.role !== 'admin') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-2xl text-red-500">Доступ заборонено. Ця сторінка доступна тільки для адміністраторів.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {notification && (
        <div 
          className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${
            notification.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          {notification.message}
        </div>
      )}
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Навчальні матеріали</h1>
        <p className="text-gray-600 mt-2">
          Завантажуйте та керуйте навчальними матеріалами, які будуть доступні студентам та викладачам
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Завантажити новий матеріал</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Назва*</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Введіть назву матеріалу"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Опис</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Введіть опис матеріалу"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Файл*</Label>
                <FileUpload
                  onFileSelected={handleFileSelected}
                  selectedFile={selectedFile}
                  description="Підтримуються PDF, документи, архіви та інші формати"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isUploading || !title.trim() || !selectedFile}
              >
                {isUploading ? 'Завантаження...' : 'Завантажити матеріал'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Список матеріалів</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 border border-red-500 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center p-6 bg-gray-50 rounded-md">
                <p className="text-gray-500">Немає завантажених матеріалів</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Назва</TableHead>
                      <TableHead>Опис</TableHead>
                      <TableHead>Дата завантаження</TableHead>
                      <TableHead>Дії</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <FileIcon className="h-4 w-4 mr-2 text-blue-500" />
                            {material.title}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {material.description || '—'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(material.uploaded_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <a 
                              href={material.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 text-blue-500 hover:text-blue-700"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 