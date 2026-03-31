import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';

const useRefetchUserData = (): void => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.fetchCurrentUser());
  }, [dispatch]);
};

export default useRefetchUserData;
