import React, { useState, useRef } from 'react';
import { XMarkIcon, PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import Button from './Button';

const FileUpload = ({
  label,
  accept = 'image/*',
  multiple = false,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  value = [],
  onChange,
  onError,
  className = '',
  placeholder = 'Drop files here or click to browse'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    
    // Validate file count
    if (multiple && value.length + fileArray.length > maxFiles) {
      onError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file types and sizes
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        onError?.(`${file.name} is not an image file`);
        return false;
      }
      
      if (file.size > maxSize) {
        onError?.(`${file.name} is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      const newFiles = multiple ? [...value, ...validFiles] : validFiles;
      onChange?.(newFiles);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange?.(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-200 mb-2">
          {label}
        </label>
      )}
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-primary-500 bg-primary-500/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="space-y-4">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          
          <div className="text-sm text-gray-400">
            <p className="font-medium">{placeholder}</p>
            <p className="mt-1">
              {multiple ? `Up to ${maxFiles} files` : 'Single file'} • 
              Max size: {Math.round(maxSize / 1024 / 1024)}MB • 
              Images only
            </p>
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            className="mx-auto"
          >
            <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
            Browse Files
          </Button>
        </div>
      </div>

      {/* File Preview */}
      {value.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-200">
            Selected Files ({value.length})
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {value.map((file, index) => (
              <div
                key={index}
                className="relative group bg-gray-700 rounded-lg p-3 border border-gray-600"
              >
                {/* Preview */}
                <div className="aspect-square rounded-md overflow-hidden bg-gray-800 mb-2">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PhotoIcon className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                </div>
                
                {/* File Info */}
                <div className="text-xs text-gray-300">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-gray-400">{formatFileSize(file.size)}</p>
                </div>
                
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
