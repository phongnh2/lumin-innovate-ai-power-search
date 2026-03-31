import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Menu, { MenuItem } from '@new-ui/general-components/Menu';
import Paper from '@new-ui/general-components/Paper';

import { readAloudActions, readAloudSelectors } from 'features/ReadAloud/slices';

const SPEAKING_RATE = [0.25, 0.5, 1, 2, 3, 4];

const SpeakingRateContent = () => {
  const { rate } = useSelector(readAloudSelectors.speakingSettings);
  const dispatch = useDispatch();
  const handleSelectRate = (value: number) => {
    dispatch(readAloudActions.setSpeakingRate(value));
  };

  return (
    <Paper style={{ width: 214 }}>
      <Menu>
        {SPEAKING_RATE.map((item) => (
          <MenuItem
            key={item}
            blankPrefix={item !== rate}
            activated={item === rate}
            displayCheckIcon={item === rate}
            onClick={() => handleSelectRate(item)}
          >
            {item}x
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
};

export default SpeakingRateContent;
