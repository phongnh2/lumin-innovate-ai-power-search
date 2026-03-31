import { useLayoutEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useCleanHomeUrlFromSign = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  useLayoutEffect(() => {
    const searchParamToClean = 'active_tab';
    if (searchParams.has(searchParamToClean)) {
      searchParams.delete(searchParamToClean);
      setSearchParams(searchParams);
    }
  }, []);
};
