import { useEffect } from 'react';

import { environment } from '@/configs/environment';

const useLogVersion = () => {
  useEffect(() => {
    console.log(`%c${environment.public.common.version}`, `color: white; background:#f2385a; border-radius: 4px; padding: 4px; font-weight: bold`);
  }, []);
};

export default useLogVersion;
