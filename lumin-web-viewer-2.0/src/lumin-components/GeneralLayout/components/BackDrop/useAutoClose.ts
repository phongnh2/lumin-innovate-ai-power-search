import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

export const useAutoClose = () => {
  const dispatch = useDispatch();
  const configs = useSelector(selectors.getBackDropConfigs);
  const { closeDelay = 0 } = configs || {};

  const closeBackDrop = useCallback(() => {
    dispatch(actions.setBackDropMessage('', null));
  }, [dispatch]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (closeDelay) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        closeBackDrop();
      }, closeDelay);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [closeBackDrop, closeDelay]);
};
