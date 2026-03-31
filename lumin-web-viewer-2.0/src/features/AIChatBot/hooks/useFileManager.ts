import { useState } from 'react';

export const useFileManager = (onAddFile?: (files: File[]) => void) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleAddFiles = (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
    onAddFile?.(files);
  };

  const handleRemoveFile = (fileName: string) => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  const resetFiles = () => {
    setSelectedFiles([]);
  };

  return {
    selectedFiles,
    handleAddFiles,
    handleRemoveFile,
    resetFiles,
  };
};