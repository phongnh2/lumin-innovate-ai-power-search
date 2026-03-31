import { matchPath, useLocation } from 'react-router';

const useAnonymousViewPath = () => {
  const location = useLocation();
  return matchPath(
    {
      path: '/viewer/guest/:documentId',
    },
    location.pathname
  );
};

export default useAnonymousViewPath;
