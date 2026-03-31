import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';

import actions from 'actions';

export const useSyncDocumentTabType = () => {
  const dispatch = useDispatch();
  const { type } = useParams();

  useEffect(() => {
    dispatch(actions.setDocumentTabType({ type }));
  }, [dispatch, type]);
};

export default useSyncDocumentTabType;
