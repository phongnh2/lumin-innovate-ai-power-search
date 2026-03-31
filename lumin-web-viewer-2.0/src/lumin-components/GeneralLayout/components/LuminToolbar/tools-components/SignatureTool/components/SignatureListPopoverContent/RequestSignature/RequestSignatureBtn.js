/* eslint-disable unused-imports/no-unused-vars */
import { PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import Icomoon from 'lumin-components/Icomoon';

import { useTranslation } from 'hooks';
import { useIntegrate } from 'hooks/useIntegrate';
import { useShallowSelector } from 'hooks/useShallowSelector';

import useCreateCertifiedVersion from 'features/DigitalSignature/hooks/useCreateCertifiedVersion';
import { digitalSignatureSelectors } from 'features/DigitalSignature/slices';
import { useTemplateViewerMatch } from 'features/Document/hooks/useTemplateViewerMatch';
import { useIsTempEditMode } from 'features/OpenForm/hooks/useIsTempEditMode';

import { INTEGRATE_BUTTON_NAME } from 'constants/luminSign';

import { useSignatureListPopoverContentContext } from '../SignatureListPopoverContentContext';

import * as Styled from './RequestSignature.styled';

const RequestSignatureBtn = () => {
  const { t } = useTranslation();
  const { handleEvent } = useIntegrate();
  const { createCertifiedVersion } = useCreateCertifiedVersion();
  const { closePopper } = useSignatureListPopoverContentContext();
  const isProcessingDigitalSignature = useSelector(digitalSignatureSelectors.isDigitalSignatureProcessing);
  const isAnnotationLoaded = useSelector(selectors.getAnnotationsLoaded);
  const isOffline = useSelector(selectors.isOffline);
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { capabilities } = currentDocument || {};
  const { canSaveACertifiedVersion } = capabilities || {};
  const { isTempEditMode } = useIsTempEditMode();
  const { isTemplateViewer } = useTemplateViewerMatch();

  const isLocalFile = currentDocument?.isSystemFile;

  const disabled =
    isProcessingDigitalSignature ||
    !currentUser ||
    !isAnnotationLoaded ||
    isOffline ||
    isTempEditMode ||
    isLocalFile ||
    !canSaveACertifiedVersion ||
    isTemplateViewer;

  const onClickIntegrate = () => {
    if (disabled) {
      return;
    }
    handleEvent(INTEGRATE_BUTTON_NAME.REQUEST_SIGNATURES);
    createCertifiedVersion();
    closePopper();
  };

  useEffect(() => {
    handleEvent(INTEGRATE_BUTTON_NAME.VIEW_REQUEST_SIGNATURES);
  }, []);

  return (
    <PlainTooltip content={!canSaveACertifiedVersion ? t('shareSettings.permissionDenied') : undefined}>
      <Styled.RequestSignatureBtn onClick={onClickIntegrate} $disabled={disabled}>
        <Styled.IconWrapper>
          <Icomoon className="icon-sign" size={40} />
        </Styled.IconWrapper>

        <Styled.Content>
          <Styled.Title>{t('viewer.bananaSign.createCertifiedVersion')}</Styled.Title>
          <Styled.Desc>{t('viewer.bananaSign.createCertifiedVersionDescription')}</Styled.Desc>
        </Styled.Content>
      </Styled.RequestSignatureBtn>
    </PlainTooltip>
  );
};

export default RequestSignatureBtn;
