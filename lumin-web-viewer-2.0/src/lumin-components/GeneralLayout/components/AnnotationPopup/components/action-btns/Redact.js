import React from 'react';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import { useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import useAnnotationPopupAction from '../../hooks/useAnnotationPopupAction';
import useAnnotationPopupBtnCondition from '../../hooks/useAnnotationPopupBtnCondition';

const Redact = () => {
  const { applyRedaction } = useAnnotationPopupAction();
  const { t } = useTranslation();
  const { showRedactButton } = useAnnotationPopupBtnCondition();

  return showRedactButton ? (
    <IconButton
      dataElement="annotationRedactButton"
      icon="md_tick"
      iconSize={24}
      data-lumin-btn-name={ButtonName.APPLY_REDACTION}
      onClick={applyRedaction}
      tooltipData={{ location: 'bottom', title: t('action.apply') }}
    />
  ) : null;
};

export default Redact;
