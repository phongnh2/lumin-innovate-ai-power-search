import { useLocation } from 'react-router';

import useDidUpdate from 'hooks/useDidUpdate';

type UseCloseModalOnRouteChangeProps = {
  opened: boolean;
  close(): void;
  closeOnRouteChange: boolean;
};

const useCloseModalOnRouteChange = ({ opened, close, closeOnRouteChange }: UseCloseModalOnRouteChangeProps) => {
  const location = useLocation();

  useDidUpdate(() => {
    if (opened && closeOnRouteChange) {
      close();
    }
  }, [location.pathname]);
};

export default useCloseModalOnRouteChange;
