import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import { Routers } from 'constants/Routers';

type TUseExitFromViewerProps = {
  backUrl?: string;
};

type TUseExitFromViewerResponse = {
  handleNavigateFromViewer: () => void;
};

const useExitFromViewer = ({ backUrl }: TUseExitFromViewerProps): TUseExitFromViewerResponse => {
  const navigate = useNavigate();
  const currentUser = useShallowSelector(selectors.getCurrentUser);

  const handleNavigateFromViewer = useCallback(() => {
    if (!currentUser) {
      navigate(Routers.SIGNIN);
      return;
    }
    navigate(backUrl || Routers.DOCUMENTS);
  }, [backUrl, currentUser, navigate]);

  return {
    handleNavigateFromViewer,
  };
};

export default useExitFromViewer;
