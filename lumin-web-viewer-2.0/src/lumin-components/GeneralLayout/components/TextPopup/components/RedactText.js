import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import { useTranslation } from 'hooks';
import { useNetworkStatus } from 'hooks/useNetworkStatus';

import createTextAnnotationAndSelect from 'helpers/createTextAnnotationAndSelect';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { documentSyncSelectors } from 'features/Document/slices';

import { DataElements } from 'constants/dataElement';

import useTextPopupConditions from '../hooks/useTextPopupConditions';

const RedactText = () => {
  const { isDisabledRedaction, canUseRedact, isPdfDocument } = useTextPopupConditions();
  const { isOffline } = useNetworkStatus();
  const isDocumentSyncing = useSelector(documentSyncSelectors.isSyncing);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  return !isDisabledRedaction && canUseRedact && isPdfDocument ? (
    <IconButton
      data-element={DataElements.TEXT_REDACT_TOOL_BUTTON}
      data-lumin-btn-name={ButtonName.REDACTION_BY_TEXT}
      data-cy="redact_text_icon_button"
      icon="md_redaction"
      iconSize={24}
      onClick={() => {
        createTextAnnotationAndSelect(dispatch, window.Core.Annotations.RedactionAnnotation);
      }}
      tooltipData={{ location: 'bottom', title: t('option.redaction.markForRedaction') }}
      disabled={isOffline || isDocumentSyncing}
    />
  ) : null;
};

export default RedactText;
