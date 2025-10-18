import api from '@/lib/api';

export const uploadFile = async (file: File, subfolder: string = ''): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  if (subfolder) {
    formData.append('subfolder', subfolder);
  }

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.file_url;
};

export const deleteFile = async (filePath: string): Promise<boolean> => {
  const response = await api.delete('/upload', {
    data: { file_path: filePath },
  });

  return response.data.success;
};

export const getFileUrl = (filePath: string): string => {
  return `${import.meta.env.VITE_API_URL}${filePath}`;
};
