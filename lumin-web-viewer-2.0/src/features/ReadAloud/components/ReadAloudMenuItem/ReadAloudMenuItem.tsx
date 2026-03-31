import { SpeakerHighIcon } from '@luminpdf/icons/dist/csr/SpeakerHigh';
import { MenuItem } from 'lumin-ui/kiwi-ui';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';

import actions from 'actions';

import { useTranslation } from 'hooks/useTranslation';

import fireEvent from 'helpers/fireEvent';
import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';
import { withExitFormBuildChecking } from 'helpers/toggleFormFieldCreationMode';

import { readAloudActions } from 'features/ReadAloud/slices';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { DataElements } from 'constants/dataElement';

const ReadAloudMenuItem = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isReadAloudButtonVisible, setIsReadAloudButtonVisible] = useState(false);

  const onClickMenuItem = useCallback(() => {
    if (isReadAloudButtonVisible) {
      fireEvent(CUSTOM_EVENT.TOGGLE_READ_ALOUD_BUTTON);
      return;
    }
    dispatch(actions.setToolbarValue(LEFT_SIDE_BAR_VALUES.POPULAR.value));
    dispatch(readAloudActions.setIsInReadAloudMode(true));
  }, [dispatch, isReadAloudButtonVisible]);

  useEffect(() => {
    const readAloudButton = document.querySelector<HTMLButtonElement>(
      `[data-element=${DataElements.READ_ALOUD_BUTTON}]`
    );
    if (readAloudButton) {
      setIsReadAloudButtonVisible(true);
    }
  }, []);

  return (
    <MenuItem
      leftSection={<SpeakerHighIcon size={24} />}
      onClick={withExitFormBuildChecking(handlePromptCallback({ callback: onClickMenuItem }))}
    >
      {t('viewer.readAloud.readAloud')}
    </MenuItem>
  );
};

export default ReadAloudMenuItem;
