import { CaretDownIcon } from '@luminpdf/icons/dist/csr/CaretDown';
import { CertificateIcon } from '@luminpdf/icons/dist/csr/Certificate';
import { EnvelopeSimpleIcon } from '@luminpdf/icons/dist/csr/EnvelopeSimple';
import { SignatureIcon } from '@luminpdf/icons/dist/csr/Signature';
import { Button, Divider, PlainTooltip, Text, MenuItem, Icomoon, Menu } from 'lumin-ui/kiwi-ui';
import React, { useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useIntegrate } from 'hooks/useIntegrate';
import { useTranslation } from 'hooks/useTranslation';

import { withExitFormBuildChecking } from 'helpers/toggleFormFieldCreationMode';
import { isValidDocumentToSign } from 'helpers/validDocument';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import useCreateCertifiedVersion from 'features/DigitalSignature/hooks/useCreateCertifiedVersion';
import { digitalSignatureSelectors } from 'features/DigitalSignature/slices';
import { useTemplateViewerMatch } from 'features/Document/hooks/useTemplateViewerMatch';

import { INTEGRATE_BUTTON_NAME } from 'constants/luminSign';

import { ToolbarItemContext } from '../../components/ToolbarItem';

import styles from './SignAndSendBtn.module.scss';

interface SignAndSendBtnProps {
  shouldShowAsMenuItem?: boolean;
}

const SignAndSendBtn = ({ shouldShowAsMenuItem = false }: SignAndSendBtnProps) => {
  const { t } = useTranslation();
  const { onClickedIntegrate, handleEvent } = useIntegrate();
  const { isTemplateViewer } = useTemplateViewerMatch();
  const { renderAsMenuItem: shouldShowAsToolbarPopoverItem } = useContext(ToolbarItemContext);

  const isAnnotationLoaded = useSelector(selectors.getAnnotationsLoaded);
  const isOffline = useSelector(selectors.isOffline);
  const currentUser = useSelector(selectors.getCurrentUser);
  const currentDocument = useSelector(selectors.getCurrentDocument);
  const { capabilities } = currentDocument || {};
  const { canSaveACertifiedVersion, canRequestSignatures } = capabilities || {};
  const isValidDocument = useMemo(
    () => isValidDocumentToSign(currentUser, currentDocument),
    [currentDocument, currentUser]
  );

  const { createCertifiedVersion } = useCreateCertifiedVersion();
  const isProcessingDigitalSignature = useSelector(digitalSignatureSelectors.isDigitalSignatureProcessing);

  const shouldNotRenderBtn = useMemo(
    () => !isAnnotationLoaded || isOffline || !isValidDocument || !currentDocument || !currentUser || isTemplateViewer,
    [currentDocument, currentUser, isAnnotationLoaded, isOffline, isValidDocument, isTemplateViewer]
  );

  const onClickIntegrate = (event: React.MouseEvent<HTMLButtonElement>) => {
    handleEvent(INTEGRATE_BUTTON_NAME.SIGN_SEND);
    onClickedIntegrate({
      currentUser,
      currentDocument,
    })(event);
  };

  const enhancedOnClickIntegrate = withExitFormBuildChecking(onClickIntegrate);

  const renderRequestSignatureButton = (text: string) => (
    <PlainTooltip
      content={
        !canRequestSignatures ? t('shareSettings.permissionDenied') : t('viewer.bananaSign.inviteOthersViaLuminSign')
      }
    >
      <Button
        disabled={shouldNotRenderBtn || !canRequestSignatures}
        onClick={enhancedOnClickIntegrate}
        startIcon={<SignatureIcon size={20} />}
        variant="filled"
        colorType="lumin_sign"
        className={styles.signAndSendBtn}
        data-cy="lumin_request_signature_btn"
      >
        {text}
      </Button>
    </PlainTooltip>
  );

  if (shouldShowAsMenuItem) {
    return (
      <MenuItem
        disabled={shouldNotRenderBtn}
        leftSection={<Icomoon type="logo-sign-lg" size="lg" />}
        onClick={enhancedOnClickIntegrate}
      >
        {t('viewer.bananaSign.requestSignatures')}
      </MenuItem>
    );
  }

  if (shouldShowAsToolbarPopoverItem) {
    return (
      <div className={styles.menuItemWrapper}>
        <Divider />
        <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface)">
          {t('viewer.bananaSign.inviteOthersViaLuminSign')}
        </Text>
        {renderRequestSignatureButton(t('viewer.bananaSign.requestSignatures'))}
      </div>
    );
  }
  return (
    <Menu
      ComponentTarget={
        <PlainTooltip openDelay={1000} content={t('viewer.bananaSign.inviteOthersViaLuminSign')}>
          <Button
            disabled={shouldNotRenderBtn || isProcessingDigitalSignature}
            startIcon={<SignatureIcon size={20} />}
            endIcon={<CaretDownIcon size={20} />}
            variant="filled"
            colorType="lumin_sign"
            className={styles.signAndSendBtn}
            data-cy="lumin_sign_and_send_btn"
          >
            {t('viewer.bananaSign.secureSigning')}
          </Button>
        </PlainTooltip>
      }
    >
      <PlainTooltip content={!canSaveACertifiedVersion ? t('shareSettings.permissionDenied') : undefined}>
        <MenuItem
          disabled={
            shouldNotRenderBtn || currentDocument?.isSystemFile || !canSaveACertifiedVersion || isTemplateViewer
          }
          onClick={createCertifiedVersion}
          data-lumin-btn-name={ButtonName.CREATE_CERTIFIED_VERSION}
          leftSection={<CertificateIcon size={20} />}
        >
          {t('viewer.bananaSign.createCertifiedVersion')}
        </MenuItem>
      </PlainTooltip>
      <PlainTooltip content={!canRequestSignatures ? t('shareSettings.permissionDenied') : undefined}>
        <MenuItem
          disabled={shouldNotRenderBtn || !canRequestSignatures}
          onClick={enhancedOnClickIntegrate}
          leftSection={<EnvelopeSimpleIcon size={20} />}
        >
          {t('viewer.bananaSign.requestSignatures')}
        </MenuItem>
      </PlainTooltip>
    </Menu>
  );
};

export default SignAndSendBtn;
