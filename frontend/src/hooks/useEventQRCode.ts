import { useState, useEffect } from 'react';
import { Event } from '@/types/events';

export const useEventQRCode = (event: Event | null, isOpen: boolean) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (event && isOpen) {
      loadQRCode();
    }
    return () => {
      if (qrCodeDataUrl) {
        URL.revokeObjectURL(qrCodeDataUrl);
      }
    };
  }, [event, isOpen]);

  const loadQRCode = async () => {
    if (!event) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/events/${event.id}/qrcode?format=png`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load QR code');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setQrCodeDataUrl(url);
    } catch (error) {
      console.error('Failed to load QR code:', error);
    }
  };

  const downloadQRCode = async (format: 'png' | 'svg') => {
    if (!event) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/events/${event.id}/qrcode?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to download QR code');
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `event-${event.id}-qrcode.${format}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { qrCodeDataUrl, isLoading, downloadQRCode };
};
