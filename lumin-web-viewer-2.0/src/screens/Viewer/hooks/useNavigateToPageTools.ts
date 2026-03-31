import { debounce } from 'lodash';
import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

const useNavigateToPageTools = (): void => {
  const toolAutoEnabled = useSelector<unknown, string>(selectors.getToolAutoEnabled);

  // After the Accordion collapse is initially shown as default
  // there is a need to trigger a click event to expand it after a one-second delay.
  const clickToolTimeout = useCallback(
    debounce((id: string) => {
      const anchorEl = document.getElementById(id);
      anchorEl?.click();
    }, 1000),
    []
  );

  useEffect(() => {
    if (toolAutoEnabled && clickToolTimeout) {
      clickToolTimeout(toolAutoEnabled);
    }
    return () => clickToolTimeout.cancel();
  }, [clickToolTimeout, toolAutoEnabled]);
};

export default useNavigateToPageTools;
