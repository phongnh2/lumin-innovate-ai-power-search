import { useEffect } from 'react';

// Nullifies window.opener if it's from a cross-origin source to prevent opener-based attacks
// Don't set Cross-Origin-Opener-Policy header in nginx.conf because it will break upload file from OneDrive
// Ref: https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/6829
const useWindowOpenerProtection = () => {
  useEffect(() => {
    if (window.opener) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/no-unsafe-member-access
        window.opener.origin;
      } catch {
        window.opener = null;
      }
    }
  }, []);
};

export default useWindowOpenerProtection;
