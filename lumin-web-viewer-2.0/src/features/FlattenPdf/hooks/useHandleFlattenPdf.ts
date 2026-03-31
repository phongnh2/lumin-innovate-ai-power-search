import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

const useHandleFlattenPdf = () => {
  const isFlattenPdf = useSelector(selectors.isFlattenPdf);
  const dispatch = useDispatch();

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { checked } = event.target;
      dispatch(actions.setFlattenPdf(checked));
    },
    [dispatch]
  );

  return {
    isFlattenPdf,
    onChange,
  };
};

export default useHandleFlattenPdf;
