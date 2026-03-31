import { useEffect } from 'react';

export function useDropboxMessageEvent() {
  useEffect(() => {
    const handleMessageDropbox = (e) => {
      if (window.location.origin === e.origin && e.data.token) {
        localStorage.setItem('token-dropbox', e.data.token);
      }
    };
    window.addEventListener('message', handleMessageDropbox);
    return () => window.removeEventListener('message', handleMessageDropbox);
  }, []);
  return null;
}
