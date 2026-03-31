import { useEffect } from 'react';

import LoadingLogo from '@/components/LoadingLogo/LoadingLogo';

export default function Logout() {
  useEffect(() => {
    window.close();
  }, []);
  return <LoadingLogo />;
}
