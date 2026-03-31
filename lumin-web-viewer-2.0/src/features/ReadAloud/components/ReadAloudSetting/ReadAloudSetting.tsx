import React, { ForwardedRef } from 'react';
import { useTranslation } from 'react-i18next';

import ToolbarPopover from '@new-ui/components/LuminToolbar/components/ToolbarPopover';

import SingleButton from 'luminComponents/ViewerCommonV2/ToolButton/SingleButton';

import ReadAloudSettingContent from './ReadAloudSettingContent';

const ReadAloudSetting = () => {
  const { t } = useTranslation();

  return (
    <ToolbarPopover
      renderChildren={({
        ref,
        handleShowPopper,
        visible,
      }: {
        ref: ForwardedRef<unknown>;
        handleShowPopper: () => void;
        visible: boolean;
      }) => (
        <SingleButton
          ref={ref}
          onClick={handleShowPopper}
          icon="settings-lg"
          showArrow
          label={t('viewer.readAloud.voiceSettings')}
          isUsingKiwiIcon
          isActive={visible}
        />
      )}
      renderPopperContent={(contentProps) => <ReadAloudSettingContent {...contentProps} />}
    />
  );
};

export default ReadAloudSetting;
