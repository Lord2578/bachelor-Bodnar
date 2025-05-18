"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { FileIcon, ExternalLink, Download, Search } from 'lucide-react';

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
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<LearningMaterial[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
        
        const response = await fetch('/api/learning-materials');
        
        if (!response.ok) {
          throw new Error('Помилка при отриманні даних');
        }
        
        const data = await response.json();
        if (data && data.materials) {
          setMaterials(data.materials || []);
          setFilteredMaterials(data.materials || []);
        } else {
          setMaterials([]);
          setFilteredMaterials([]);
        }
      } catch (err) {
        console.error('Помилка при завантаженні навчальних матеріалів:', err);
        setError(err instanceof Error ? err.message : 'Сталася помилка');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchMaterials();
    }
  }, [user]);
  
  useEffect(() => {
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      const filtered = materials.filter(material => 
        material.title.toLowerCase().includes(lowerCaseSearch) || 
        (material.description && material.description.toLowerCase().includes(lowerCaseSearch))
      );
      setFilteredMaterials(filtered);
    } else {
      setFilteredMaterials(materials);
    }
  }, [searchTerm, materials]);
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPP', { locale: uk });
    } catch {
      return dateString || 'Н/Д';
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const getMaterialFileType = (fileUrl: string) => {
    const extension = fileUrl.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return { name: 'PDF документ', color: 'text-red-500' };
      case 'doc':
      case 'docx':
        return { name: 'Word документ', color: 'text-blue-500' };
      case 'xls':
      case 'xlsx':
        return { name: 'Excel таблиця', color: 'text-green-500' };
      case 'ppt':
      case 'pptx':
        return { name: 'PowerPoint презентація', color: 'text-orange-500' };
      case 'jpg':
      case 'jpeg':
      case 'png':
        return { name: 'Зображення', color: 'text-purple-500' };
      case 'zip':
      case 'rar':
        return { name: 'Архів', color: 'text-yellow-600' };
      default:
        return { name: 'Файл', color: 'text-gray-500' };
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Навчальні матеріали</h1>
        <p className="text-gray-600 mt-2">
          Доступні навчальні матеріали та ресурси
        </p>
      </div>
      
      <div className="relative mb-6">
        <Input
          type="text"
          placeholder="Пошук по назві або опису..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-10"
        />
        <Search className="h-4 w-4 absolute left-3 top-3 text-gray-500" />
      </div>
      
      {error && (
        <div className="mb-4 p-3 border border-red-500 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-md">
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'Матеріали за вашим запитом не знайдено' : 'Немає доступних навчальних матеріалів'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => {
            const fileType = getMaterialFileType(material.file_url);
            
            return (
              <Card key={material.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-start gap-2">
                    <FileIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${fileType.color}`} />
                    <span className="line-clamp-2">{material.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {material.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">{material.description}</p>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Додано: {formatDate(material.uploaded_at)}
                  </div>
                  
                  <div className="text-xs text-gray-500 flex items-center">
                    <span className={`inline-block h-2 w-2 rounded-full mr-1.5 ${fileType.color}`}></span>
                    {fileType.name}
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      asChild
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <a 
                        href={material.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Відкрити
                      </a>
                    </Button>
                    
                    <Button 
                      asChild
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <a 
                        href={material.file_url} 
                        download
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Завантажити
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 