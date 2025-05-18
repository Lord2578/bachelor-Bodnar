"use client";

import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  onFileRemoved?: () => void;
  accept?: string;
  className?: string;
  selectedFile?: File | null;
  label?: string;
  description?: string;
  maxSizeMB?: number;
}

export function FileUpload({
  onFileSelected,
  onFileRemoved,
  accept = "application/pdf,image/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx",
  className,
  selectedFile,
  label = "Вибрати файл",
  description = "Підтримувані формати: PDF, зображення, документи",
  maxSizeMB = 10
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(selectedFile || null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`Розмір файлу перевищує ${maxSizeMB} MB`);
      return;
    }

    setError(null);
    setFile(selectedFile);
    onFileSelected(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (onFileRemoved) {
      onFileRemoved();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={cn("space-y-2", className)}>
      {!file ? (
        <>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <div className="text-sm font-medium text-gray-700">{label}</div>
            <p className="text-xs text-gray-500 text-center mt-1">{description}</p>
            <p className="text-xs text-gray-500 mt-1">Максимальний розмір: {maxSizeMB} MB</p>
          </div>
          <Input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      ) : (
        <div className="flex items-center justify-between p-3 border rounded-md bg-blue-50">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <div className="text-sm font-medium truncate max-w-[200px]">{file.name}</div>
              <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
            </div>
          </div>
          <div className="flex items-center">
            <Check className="h-4 w-4 text-green-600 mr-2" />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              className="h-8 w-8 text-gray-500 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
} 