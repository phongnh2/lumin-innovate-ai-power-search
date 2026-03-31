import React from 'react';
import { useSelector } from 'react-redux';

import BottomToastBase from 'ui/components/BottomToast';

import { bottomToastSelectors } from './slice';

const BottomToast = () => {
  const bottomToastMessage = useSelector(bottomToastSelectors.bottomToastMessage);
  const bottomToastOpen = useSelector(bottomToastSelectors.isBottomToastOpen);

  if (!bottomToastOpen) {
    return null;
  }
  return <BottomToastBase message={bottomToastMessage} />;
};

export default BottomToast;
