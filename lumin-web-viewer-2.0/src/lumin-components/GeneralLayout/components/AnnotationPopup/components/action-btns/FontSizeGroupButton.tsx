/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import React from 'react';
import { useTranslation } from 'react-i18next';

import Divider from '@new-ui/general-components/Divider';
import IconButton from '@new-ui/general-components/IconButton';

import useAnnotationPopupAction from '../../hooks/useAnnotationPopupAction';

const FontSizeGroupButton = () => {
  const { t } = useTranslation();
  const { updateFontSize } = useAnnotationPopupAction();
  return (
    <>
      <IconButton
        tooltipData={{ location: 'bottom', title: t('action.decreaseSize') }}
        icon="lg_tool_text_size_decrease"
        iconSize={24}
        onClick={() => updateFontSize({ isDecrease: true })}
      />
      <IconButton
        tooltipData={{ location: 'bottom', title: t('action.increaseSize') }}
        icon="lg_tool_text_size_increase"
        iconSize={24}
        onClick={() => updateFontSize({ isDecrease: false })}
      />
      <Divider orientation="vertical" style={{ height: 32, margin: 0 }} />
    </>
  );
};

export default FontSizeGroupButton;
