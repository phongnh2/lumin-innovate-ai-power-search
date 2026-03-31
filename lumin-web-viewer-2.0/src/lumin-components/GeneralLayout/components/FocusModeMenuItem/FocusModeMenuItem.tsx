import { MenuItem } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setIsInFocusMode } from 'actions/generalLayoutActions';
import MenuItemShortcut from 'ui/components/MenuItemShortcut';

import selectors from 'selectors';

import Icomoon from 'luminComponents/Icomoon';

import { useTranslation } from 'hooks/useTranslation';

import { getShortcut } from '../LuminToolbar/utils';

const FocusModeMenuItem = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isInFocusMode = useSelector(selectors.isInFocusMode);
  const isLoadingDocument = useSelector(selectors.isLoadingDocument);

  const onClick = () => {
    dispatch(setIsInFocusMode(!isInFocusMode));
  };

  return (
    <MenuItem
      disabled={isLoadingDocument}
      leftSection={<Icomoon className="lg_collapse_right_panel" size={24} />}
      rightSection={<MenuItemShortcut shortcut={getShortcut('focusMode')} />}
      onClick={onClick}
    >
      {t('generalLayout.focusMode.tooltip')}
    </MenuItem>
  );
};

export default FocusModeMenuItem;
