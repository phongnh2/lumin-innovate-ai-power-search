import { useEffect, useMemo, useState } from 'react';

import { isChrome } from 'helpers/device';

const useGetPromoteChromeExtensionFlag = () => {
  const [hasInstalledChromeExtension, setHasInstalledChromeExtension] = useState(false);

  useEffect(() => {
    const img = new Image();

    const handleLoad = () => setHasInstalledChromeExtension(true);
    const handleError = () => {
      setHasInstalledChromeExtension(false);
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = 'chrome-extension://dbkidnlfklnjanneifjjojofckpcogcl/assets/icons/i-32.png';

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, []);

  const isPromoteChromeExtension = useMemo(
    () => !hasInstalledChromeExtension && isChrome,
    [hasInstalledChromeExtension]
  );

  return { isPromoteChromeExtension };
};

export { useGetPromoteChromeExtensionFlag };
