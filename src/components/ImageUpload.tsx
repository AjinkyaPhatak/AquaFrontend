'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  isProcessing: boolean;
}

export default function ImageUpload({ onImageUpload, isProcessing }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.tif', '.tiff', '.webp']
    },
    multiple: false,
    disabled: isProcessing
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg shadow-lg"
            />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Click or drag to upload a different image
            </p>
          </div>
        ) : (
          <div className="py-8">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-4">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                {isDragActive ? 'Drop the lake image here' : 'Drag & drop lake satellite image'}
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                or click to browse
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Supports: JPEG, PNG, TIFF, WebP for lake frothing analysis
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
