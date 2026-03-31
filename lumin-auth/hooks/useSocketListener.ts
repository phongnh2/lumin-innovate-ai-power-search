import { useEffect } from 'react';

import socket from '@/lib/socket';

const useSocketListener = (message: string, callback: (params?: any) => unknown, deps: unknown[] = []) => {
  useEffect(() => {
    socket.on(message, callback);
    return () => {
      socket.removeListener(message);
    };
  }, deps);
};

export default useSocketListener;
