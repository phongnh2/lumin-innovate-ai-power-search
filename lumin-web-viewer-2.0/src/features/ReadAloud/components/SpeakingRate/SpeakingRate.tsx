import React, { Ref } from 'react';
import { useSelector } from 'react-redux';

import ToolbarPopover from '@new-ui/components/LuminToolbar/components/ToolbarPopover';
import ButtonSuffixInput from '@new-ui/general-components/ButtonSuffixInput';

import { readAloudSelectors } from 'features/ReadAloud/slices';

import SpeakingRateContent from './SpeakingRateContent';

const SpeakingRate = () => {
  const { rate } = useSelector(readAloudSelectors.speakingSettings);
  return (
    <ToolbarPopover
      renderChildren={({ ref, handleShowPopper }: { ref: Ref<HTMLInputElement>; handleShowPopper: () => void }) => (
        <ButtonSuffixInput onClick={handleShowPopper} ref={ref} value={`${rate}x`} />
      )}
      renderPopperContent={(contentProps) => <SpeakingRateContent {...contentProps} />}
    />
  );
};

export default SpeakingRate;
