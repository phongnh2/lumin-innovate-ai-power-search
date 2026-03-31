import { useEffect, useState } from 'react';

export function useFocusBrowserTab() {
  const [isFocusingTab, setIsFocusingTab] = useState(true);
  useEffect(() => {
    const handleFocusTab = () => {
      setIsFocusingTab(true);
    };
    const handleBlurTab = () => {
      setIsFocusingTab(false);
    };
    window.addEventListener('focus', handleFocusTab);
    window.addEventListener('blur', handleBlurTab);

    return () => {
      window.removeEventListener('focus', handleFocusTab);
      window.removeEventListener('blur', handleBlurTab);
    };
  }, []);

  return {
    isFocusingTab,
  };
}
