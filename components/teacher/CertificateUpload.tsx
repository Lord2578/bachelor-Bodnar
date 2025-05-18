"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import { FileIcon, ExternalLink, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import Image from 'next/image';

interface Certificate {
  id: number;
  teacher_id: number;
  file_url: string;
  description: string | null;
  uploaded_at: string;
}

export default function CertificateUpload() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error'; text: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchCertificates();
  }, []);
  
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  
  const fetchCertificates = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      console.log('Fetching teacher certificates...');
      const response = await fetch('/api/teacher/certificates');
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from API:', errorData);
        throw new Error(errorData.message || 'Помилка при отриманні сертифікатів');
      }
      
      const data = await response.json();
      console.log('Certificates data received:', data);
      setCertificates(data.certificates || []);
    } catch (err) {
      console.error('Помилка при завантаженні сертифікатів:', err);
      const errorMessage = err instanceof Error ? err.message : 'Сталася помилка';
      setError(`Помилка при завантаженні сертифікатів: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setError(null);
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({
        type: 'error',
        text: 'Будь ласка, виберіть файл для завантаження'
      });
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', 'teacher_certificate');
      
      if (description) {
        formData.append('description', description);
      }
      
      console.log(`Uploading certificate: ${selectedFile.name}, Size: ${selectedFile.size} bytes`);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error response from upload API:', data);
        throw new Error(data.message || 'Помилка при завантаженні сертифіката');
      }
      
      console.log('Upload response:', data);
      
      await fetchCertificates();
      
      setSelectedFile(null);
      setDescription('');
      setMessage({
        type: 'success',
        text: 'Сертифікат успішно завантажено'
      });
    } catch (err) {
      console.error('Помилка при завантаженні сертифіката:', err);
      const errorMessage = err instanceof Error ? err.message : 'Невідома помилка';
      setError(`Помилка при завантаженні сертифіката: ${errorMessage}`);
      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPP', { locale: uk });
    } catch {
      return dateString;
    }
  };

  const getFileTypeIcon = (fileUrl: string) => {
    const fileName = fileUrl.split('/').pop() || '';
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
    
    return isImage ? (
      <Image 
        src={fileUrl} 
        alt="Certificate preview" 
        width={40}
        height={40}
        className="rounded bg-gray-100 object-cover"
      />
    ) : (
      <div className={`h-10 w-10 flex items-center justify-center rounded ${isPdf ? 'bg-red-50' : 'bg-blue-50'}`}>
        <FileIcon className={`h-6 w-6 ${isPdf ? 'text-red-500' : 'text-blue-500'}`} />
      </div>
    );
  };
  
  return (
    <Card className="shadow-sm">
      {message && (
        <div 
          className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}
      
      <CardHeader>
        <CardTitle>Мої сертифікати</CardTitle>
        <CardDescription>Завантажте ваші сертифікати та дипломи</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border p-4 rounded-md bg-gray-50">
          <h3 className="text-md font-medium mb-3">Додати новий сертифікат</h3>
          <div className="space-y-4">
            <div>
              <FileUpload 
                onFileSelected={handleFileSelected}
                selectedFile={selectedFile}
                accept="application/pdf,image/*"
                description="Завантажте копію сертифіката (PDF або зображення)"
              />
            </div>
            
            <div>
              <Textarea
                placeholder="Опис сертифіката (необов'язково)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Button
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
              className="w-full"
            >
              {isUploading ? 'Завантаження...' : 'Завантажити сертифікат'}
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 p-4 text-red-700 border border-red-300 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-1">Помилка</h4>
                <p className="text-sm">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-xs"
                  onClick={fetchCertificates}
                >
                  Спробувати знову
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-500">Завантаження сертифікатів...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {certificates.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-md border border-dashed">
                <p className="text-gray-500">У вас ще немає завантажених сертифікатів</p>
              </div>
            ) : (
              certificates.map((certificate) => (
                <div key={certificate.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    {getFileTypeIcon(certificate.file_url)}
                    <div>
                      <p className="font-medium">
                        {certificate.description || 'Сертифікат без опису'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Додано: {formatDate(certificate.uploaded_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <a 
                      href={certificate.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 text-blue-500 hover:text-blue-700"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 