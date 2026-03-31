import { Icomoon, MenuItem } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';

import actions from 'actions';

import { useTranslation } from 'hooks/useTranslation';

import { selectors as editorChatBotSelectors } from 'features/EditorChatBot/slices';

import { DataElements } from 'constants/dataElement';

const ViewControlMenuItem = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const viewControlButtonRef = useRef<HTMLButtonElement>(null);
  const isAiProcessing = useSelector(editorChatBotSelectors.getIsAiProcessing);

  const onClickMenuItem = () => {
    if (!viewControlButtonRef.current) {
      dispatch(actions.setToolbarValue(LEFT_SIDE_BAR_VALUES.POPULAR.value));
      return;
    }
    viewControlButtonRef.current.click();
  };

  useEffect(() => {
    const viewControlButton = document.querySelector<HTMLButtonElement>(
      `[data-element=${DataElements.VIEW_CONTROL_BUTTON}]`
    );
    if (viewControlButton) {
      viewControlButtonRef.current = viewControlButton;
    }
  }, []);

  return (
    <MenuItem disabled={isAiProcessing} leftSection={<Icomoon size="lg" type="ph-file" />} onClick={onClickMenuItem}>
      {t('component.viewControlsOverlay')}
    </MenuItem>
  );
};

export default ViewControlMenuItem;
