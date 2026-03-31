import { Modal, PasswordInput, Button, PlainTooltip as KiwiTooltip } from 'lumin-ui/kiwi-ui';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { ThemeProvider } from 'styled-components';

import { closeElement } from 'actions/exposedActions';

import PasswordImageDark from 'assets/images/new-layout/password-img-dark.png';
import PasswordImage from 'assets/images/new-layout/password-img.png';
import IconWarning from 'assets/lumin-svgs/icon-warning.svg';

import actions from 'actions';
import selectors from 'selectors';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import Tooltip from 'lumin-components/Shared/Tooltip';
import ButtonV1 from 'luminComponents/ButtonMaterial';
import DialogV1 from 'luminComponents/Dialog';
import Input from 'luminComponents/Shared/Input';

import { useEnableWebReskin, useUrlSearchParams } from 'hooks';
import { useTabletMatch } from 'hooks/useTabletMatch';
import { useThemeMode } from 'hooks/useThemeMode';
import { useTranslation } from 'hooks/useTranslation';
import { useViewerMatch } from 'hooks/useViewerMatch';

import { passwordHandlers } from 'helpers/passwordHandlers';

import modalEvent, { ModalName } from 'utils/Factory/EventCollection/ModalEventCollection';

import { PdfAction } from 'features/EnableToolFromQueryParams/constants';

import { DataElements } from 'constants/dataElement';
import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import { PasswordModalSource } from './constants/PasswordModal.enum';
import { PASSWORD_MODAL_WORDINGS } from './constants/PasswordModalWordings';
import { useRemovePasswordFromFLP } from './hooks/useRemovePasswordFromFLP';

import * as Styled from './PasswordModal.styled';

import styles from './PasswordModal.module.scss';

const PasswordModal = () => {
  const { isViewer } = useViewerMatch();
  const { isEnableReskin } = useEnableWebReskin();
  const searchParams = useUrlSearchParams();
  const actionQuery = searchParams.get(UrlSearchParam.ACTION);
  const isUnlockQuery = isViewer && actionQuery === PdfAction.UNLOCK;
  const { submitRemovePassword } = useRemovePasswordFromFLP();

  const [isOpen = false, attempt, passwordMessage, passwordProtectedDocumentName, passwordModalSource] = useSelector(
    (state) => [
      selectors.isElementOpen(state, DataElements.PASSWORD_MODAL) ?? false,
      selectors.getPasswordAttempts(state),
      selectors.getPasswordMessage(state),
      selectors.getPasswordProtectedDocumentName(state),
      selectors.getPasswordModalSource(state),
    ],
    shallowEqual
  );
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [wrongPassword, setWrongPassword] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const isTablet = useTabletMatch();
  const passwordRef = useRef(null);
  const theme = useThemeMode();

  const modalIcon = useMemo(
    () =>
      ({
        light: PasswordImage,
        dark: PasswordImageDark,
      }[theme]),
    [theme]
  );

  const themeModeProvider = Styled.theme[theme];
  const getPasswordModalWording = () => {
    const modalSource = isUnlockQuery ? PasswordModalSource.UNLOCK_QUERY : passwordModalSource;
    return PASSWORD_MODAL_WORDINGS[modalSource] ?? PASSWORD_MODAL_WORDINGS[PasswordModalSource.UNLOCK];
  };
  const { titleKey, descriptionKey, placeholderKey, submitButtonKey } = getPasswordModalWording();

  useEffect(() => {
    if (isOpen) {
      dispatch(closeElement('progressModal'));
      modalEvent.modalViewed({
        modalName: ModalName.PASSWORD_REQUIRED,
      });
    }

    return () => {
      setPassword('');
      setWrongPassword(false);
      dispatch(actions.setPasswordAttempts(0));
    };
  }, [dispatch, isOpen]);

  useEffect(() => {
    setWrongPassword(Boolean(attempt));
    setCanSubmit(Boolean(attempt));
  }, [attempt]);

  useEffect(() => {
    setCanSubmit(Boolean(password));
    setWrongPassword(false);
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (e.currentTarget.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    modalEvent.modalConfirmation({
      modalName: ModalName.PASSWORD_REQUIRED,
    });
    setWrongPassword(false);
    setCanSubmit(false);
    passwordHandlers.check(password);
    sessionStorage.setItem(SESSION_STORAGE_KEY.PDF_PASSWORD, password);
    if (passwordRef && passwordRef.current) {
      passwordRef.current.blur();
    }
    if (isUnlockQuery) {
      await submitRemovePassword(password);
    }
  };

  const modalIconImage = useMemo(
    () => (
      <img
        src={modalIcon}
        style={{
          height: 80,
          width: 'fit-content',
        }}
        alt="password required icon"
      />
    ),
    [modalIcon]
  );

  const cancelCheckPasswordWithCloseModal = () => {
    modalEvent.modalDismiss({
      modalName: ModalName.PASSWORD_REQUIRED,
    });
    passwordHandlers.cancel();
    dispatch(closeElement('passwordModal'));
    dispatch(actions.setPasswordProtectedDocumentName(''));
  };

  const TooltipComponent = useMemo(
    () => (isViewer || isEnableReskin ? KiwiTooltip : Tooltip),
    [isViewer, isEnableReskin]
  );

  const renderPasswordProtectedDocumentName = () => (
    <>
      <span className={styles.messageContainer}>
        <TooltipComponent
          maw={224}
          content={passwordProtectedDocumentName}
          title={passwordProtectedDocumentName}
          placement="top"
          position="top"
        >
          <span className={styles.documentName}>{passwordProtectedDocumentName}</span>
        </TooltipComponent>
        <span className={styles.postfix}>&nbsp;{t('message.isPasswordProtected')}</span>
      </span>
      <span>{t('message.pleaseEnterThePassword')}</span>
    </>
  );

  if (isViewer || isEnableReskin) {
    return (
      <Modal
        centered
        titleCentered
        opened={isOpen}
        data-element="passwordModal"
        onClose={cancelCheckPasswordWithCloseModal}
        size="sm"
        hideDefaultButtons
        title={t(titleKey)}
        Image={modalIconImage}
        closeOnEscape={false}
        closeOnClickOutside={false}
        zIndex="var(--zindex-kiwi-modal-highest)"
      >
        <h3 className={styles.content}>
          {passwordProtectedDocumentName ? (
            renderPasswordProtectedDocumentName()
          ) : (
            <Trans
              i18nKey={descriptionKey}
              components={{
                br: <br />,
              }}
            />
          )}
        </h3>
        <form className={styles.formContainer} onSubmit={handleSubmit}>
          <PasswordInput
            autoFocus
            value={password}
            error={wrongPassword ? t('message.incorrectPassword') : ''}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder={t(placeholderKey)}
          />
          <div className={styles.buttonContainer}>
            {passwordHandlers.canCancel() && (
              <Button
                onClick={cancelCheckPasswordWithCloseModal}
                size="lg"
                data-element="passwordCancelButton"
                variant="text"
                type="button"
                style={{ minWidth: 80 }}
              >
                {t('common.cancel')}
              </Button>
            )}
            <Button
              disabled={!canSubmit || !password}
              size="lg"
              data-element="passwordSubmitButton"
              type="submit"
              style={{ minWidth: 80 }}
              variant="tonal"
            >
              {t(submitButtonKey)}
            </Button>
          </div>
        </form>
      </Modal>
    );
  }

  const MODAL_WIDTH = isTablet ? 420 : 328;
  return (
    <ThemeProvider theme={themeModeProvider}>
      <DialogV1 open={isOpen} data-element="passwordModal" width={MODAL_WIDTH} className={`theme-${theme}`}>
        <Styled.Container>
          <Styled.IconWrapper>
            <Styled.Icon src={IconWarning} alt="warning" />
          </Styled.IconWrapper>
          <Styled.Title>{t('message.passwordRequired')}</Styled.Title>
          <Styled.Text>
            {renderPasswordProtectedDocumentName
              ? renderPasswordProtectedDocumentName()
              : passwordMessage || (
                  <Trans
                    i18nKey="message.enterPassword"
                    components={{
                      br: <br />,
                    }}
                  />
                )}
          </Styled.Text>
          <form onSubmit={handleSubmit}>
            <Input
              icon="lock"
              type="password"
              errorMessage={wrongPassword ? t('message.incorrectPassword') : ''}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              ref={passwordRef}
              autoComplete="new-password"
              placeholder="Your password"
              showPassword
              autoFocus
            />
            <Styled.ButtonGroup cancelable={passwordHandlers.canCancel()}>
              {passwordHandlers.canCancel() && (
                <ButtonV1
                  type="button"
                  size={ButtonSize.XL}
                  color={ButtonColor.TERTIARY}
                  data-element="passwordSubmitButton"
                  onClick={cancelCheckPasswordWithCloseModal}
                >
                  {t('action.cancel')}
                </ButtonV1>
              )}
              <ButtonV1 type="submit" size={ButtonSize.XL} data-element="passwordSubmitButton" disabled={!canSubmit}>
                {t('action.submit')}
              </ButtonV1>
            </Styled.ButtonGroup>
          </form>
        </Styled.Container>
      </DialogV1>
    </ThemeProvider>
  );
};

export default PasswordModal;
