'use client';

import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface MediaUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  folder?: string;
}

export function MediaUpload({ value, onChange, folder = 'glampings' }: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        
        const { data } = await api.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data.path;
      });

      const uploadedPaths = await Promise.all(uploadPromises);
      onChange([...value, ...uploadedPaths]);
      toast.success('Images uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (pathToRemove: string) => {
    onChange(value.filter(path => path !== pathToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {value.map((path, index) => (
          <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
            <Image 
              src={path.startsWith('http') ? path : `${process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage/'}${path}`} 
              alt={`Upload ${index}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(path)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        <label className={`
          aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors
          ${isUploading ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'border-gray-300 hover:border-primary hover:bg-primary/5'}
        `}>
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 mt-2">Upload Photo</span>
            </>
          )}
          <input 
            type="file" 
            multiple 
            className="hidden" 
            accept="image/*" 
            disabled={isUploading}
            onChange={handleUpload}
          />
        </label>
      </div>
    </div>
  );
}
