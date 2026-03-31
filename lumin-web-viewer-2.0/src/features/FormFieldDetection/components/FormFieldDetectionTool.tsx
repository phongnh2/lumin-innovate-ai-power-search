import { Icomoon } from 'lumin-ui/kiwi-ui';
import React from 'react';

import AIToolSection from '@new-ui/components/LuminToolbar/tools-components/AITool/AIToolSection';
import { ToolPopperRenderParams } from '@new-ui/HOCs/withValidUserCheck';

import { RequestType } from 'luminComponents/RequestPermissionModal/requestType.enum';

import { useRequestPermissionChecker } from 'hooks/useRequestPermissionChecker';
import { useTranslation } from 'hooks/useTranslation';

import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';

import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import DetectFormFieldButton from './DetectFormFieldButton';

const FormFieldDetectionTool = () => {
  const { t } = useTranslation();
  const { withEditPermission, requestAccessModalElement } = useRequestPermissionChecker({
    permissionRequest: RequestType.EDITOR,
  });
  const handleCheckPermission = (
    { toggleCheckPopper, shouldShowPremiumIcon }: ToolPopperRenderParams,
    openToolCallback: () => void
  ) => {
    if (shouldShowPremiumIcon) {
      toggleCheckPopper();
      return;
    }

    withEditPermission(openToolCallback)();
  };

  const handleClickMenuItem = (renderParams: ToolPopperRenderParams, openToolCallback: () => void) => {
    ToolSwitchableChecker.createToolSwitchableHandler(() => {
      handleCheckPermission(renderParams, openToolCallback);
    })();
  };

  return (
    <AIToolSection sectionTitle={t('generalLayout.toolProperties.formBuilder')}>
      <DetectFormFieldButton
        dataLuminBtnName={ButtonName.FORM_FIELD_DETECTION}
        dataLuminBtnPurpose={ButtonPurpose[ButtonName.FORM_FIELD_DETECTION_IN_AI_TAB]}
        dataCy="ai_auto_detect_in_ai_tab"
        onClick={handleClickMenuItem}
        leftSection={<Icomoon size="lg" py="var(--kiwi-spacing-0-5)" type="lm-form-detection" />}
      >
        {t('viewer.formFieldDetection.toolMenu.autoDetectFields')}
      </DetectFormFieldButton>
      {requestAccessModalElement}
    </AIToolSection>
  );
};

export default FormFieldDetectionTool;
