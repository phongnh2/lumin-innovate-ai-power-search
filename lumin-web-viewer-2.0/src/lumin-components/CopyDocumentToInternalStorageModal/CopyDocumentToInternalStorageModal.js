import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ThemeProvider } from 'styled-components';

import actions from 'actions';

import Dialog from 'lumin-components/Dialog';
import GoogleDriveFolder from 'lumin-components/GoogleDriveFolder';
import GoogleFolderPicker from 'lumin-components/GoogleFolderPicker';
import Input from 'lumin-components/Shared/Input';
import SvgElement from 'lumin-components/SvgElement';

import { useThemeMode, useTranslation } from 'hooks';

import googleServices from 'services/googleServices';

import logger from 'helpers/logger';

import { yupUtils as Yup, toastUtils, getErrorMessageTranslated } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { yupValidator } from 'utils/yup';

import dataElements from 'constants/dataElement';
import { DocumentStorage } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import { ModalTypes, LOGGER } from 'constants/lumin-common';
import { ModalSize } from 'constants/styles/Modal';

import * as Styled from './CopyDocumentToInternalStorageModal.styled';

const defaultProps = {
  errorMessage: '',
  requestGooglePermission: null,
  action: UserEventConstants.Events.HeaderButtonsEvent.MAKE_COPY,
  downloadType: 'pdf',
};

const propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  currentDocumentName: PropTypes.string.isRequired,
  destinationStorage: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  requestGooglePermission: PropTypes.func,
  action: PropTypes.string,
  downloadType: PropTypes.oneOf(['pdf', 'docx']),
};

const googleDrive = {
  MINE: 'My Drive',
  SHARED: 'Shared drives',
  HOMEPAGE: '',
};
const PERSONAL_DRIVE_ICON = 'icon-personal-drive';

const CopyDocumentToDriveModal = ({
  isOpen,
  currentDocumentName,
  destinationStorage,
  onClose,
  onConfirm,
  errorMessage,
  requestGooglePermission,
  action,
  downloadType,
}) => {
  const inputRef = useRef(null);
  const folderPicker = useRef(null);
  const themeMode = useThemeMode();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const validationSchema = useMemo(() => Yup.object().shape({ documentName: yupValidator(t).storageNameValidate }), []);
  const openSaveAsModal = () => dispatch(actions.openElement(dataElements.SAVE_AS_MODAL));

  const {
    handleSubmit,
    getValues,
    setError,
    formState: { isSubmitting, errors },
    control,
    clearErrors,
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      documentName: currentDocumentName,
    },
    resolver: yupResolver(validationSchema),
  });

  const [isOpeningSelectFolder, setIsOpeningSelectFolder] = useState(false);
  const [folderProperties, setFolderProperties] = useState({
    location: googleDrive.MINE,
    id: '',
    URL: googleDrive.HOMEPAGE,
    icon: PERSONAL_DRIVE_ICON,
    userAvatar: '',
    userName: '',
  });
  const isDownloadDoc = action === UserEventConstants.Events.HeaderButtonsEvent.DOWNLOAD;

  useEffect(() => {
    const setBasicProfile = async () => {
      if (destinationStorage === DocumentStorage.GOOGLE) {
        const basicProfile = await googleServices.getBasicProfile();
        if (basicProfile.name) {
          setFolderProperties((preProfile) => ({
            ...preProfile,
            userAvatar: basicProfile.picture,
            userName: basicProfile.name,
          }));
        }
      }
    };
    setBasicProfile();
  }, []);

  useEffect(() => {
    if (errorMessage) {
      setError('documentName', { type: 'custom', message: errorMessage });
    }
  }, [errorMessage]);

  const onCreate = async ({ documentName }) => {
    onClose();
    await onConfirm(documentName, folderProperties.id);
  };

  const onClosePickerModal = () => {
    setIsOpeningSelectFolder(false);
  };

  const selectedDriveFolder = ({ folderId, folderName, folderURL, isShared = false }) => {
    clearErrors();
    onClosePickerModal();
    setFolderProperties((preProfile) => ({
      ...preProfile,
      location: folderName,
      id: folderId,
      URL: folderURL,
      icon: isShared ? 'icon-shared-drive' : PERSONAL_DRIVE_ICON,
    }));
  };

  const openGooleFolderpicker = () => {
    if (destinationStorage === DocumentStorage.GOOGLE) {
      setIsOpeningSelectFolder(true);
      folderPicker.current.openPicker();
    }
  };

  const updateAccount = () => {
    googleServices.signOut();
    googleServices.implicitSignIn({
      callback: async () => {
        const userInfomation = await googleServices.getBasicProfile();
        setFolderProperties((preProfile) => ({
          ...preProfile,
          location: googleDrive.MINE,
          id: null,
          URL: '',
          userAvatar: userInfomation.picture,
          userName: userInfomation.name,
        }));
        logger.logInfo({
          message: LOGGER.EVENT.REQUEST_PERMISSION,
          reason: LOGGER.Service.GOOGLE_API_INFO,
        });
        toastUtils.success({
          message: t('viewer.requestPermissionSuccessfully'),
        });
      },
      onError: (error) => {
        logger.logError({
          reason: LOGGER.Service.GOOGLE_API_ERROR,
          error,
        });
        toastUtils.error({
          message: t('viewer.requestPermissionFailed'),
        });
      }
    });
  };

  const closeDownloadModal = () => {
    onClose();
    openSaveAsModal();
  };

  return (
    <ThemeProvider theme={Styled.theme[themeMode]}>
      <Dialog
        open={isOpen && !isOpeningSelectFolder}
        className={`theme-${themeMode}`}
        width={ModalSize.SM}
        onClose={onClose}
      >
        <GoogleFolderPicker
          fileName={getValues('documentName')?.trim()}
          isRequestAccess
          ref={folderPicker}
          selectedFolder={(data) =>
            selectedDriveFolder({
              folderId: data.docs[0].id,
              folderName: data.docs[0].name,
              folderURL: data.docs[0].url,
              isShared: data.docs[0]?.isShared,
            })
          }
          closeModal={onClosePickerModal}
          onClose={onClosePickerModal}
          requestGooglePermission={requestGooglePermission}
        />
        <form onSubmit={handleSubmit(onCreate)}>
          <Styled.Container>
            <Styled.TitleContainer>
              <SvgElement content={`icon-${ModalTypes.INFO}`} width={48} height={48} />
              <Styled.Title>
                {t(isDownloadDoc ? 'viewer.downloadModal.saveToDrive' : 'modalMakeACopy.copyDocuments')}
              </Styled.Title>
            </Styled.TitleContainer>

            <Styled.LabelContainer>
              <Styled.Label>
                <Trans
                  i18nKey={
                    isDownloadDoc
                      ? 'viewer.downloadModal.beingDownloadDocumentTo'
                      : 'modalMakeACopy.beingCopyDocumentTo'
                  }
                  values={{ documentName: currentDocumentName, destinationStorage, downloadType }}
                  components={{ b: <Styled.Bold /> }}
                />
              </Styled.Label>
            </Styled.LabelContainer>

            <Styled.ContentContainer>
              <Styled.FormFieldLabel>{t('common.name')}</Styled.FormFieldLabel>
              <Styled.InputContainer>
                <Controller
                  control={control}
                  name="documentName"
                  defaultValue={currentDocumentName}
                  render={({ field }) => (
                    <Input
                      {...field}
                      ref={inputRef}
                      placeholder={t('modalMakeACopy.chooseCopyName')}
                      errorMessage={getErrorMessageTranslated(errors?.documentName?.message)}
                      showClearButton
                      hideValidationIcon
                      disabled={isSubmitting}
                      autoComplete="off"
                    />
                  )}
                />
              </Styled.InputContainer>

              {destinationStorage === DocumentStorage.GOOGLE && (
                <GoogleDriveFolder
                  isSubmitting={isSubmitting}
                  folderIcon={folderProperties.icon}
                  userName={folderProperties.userName}
                  userAvatar={folderProperties.userAvatar}
                  folderLocation={folderProperties.location}
                  updateAccount={updateAccount}
                  openGooleFolderpicker={openGooleFolderpicker}
                />)}
            </Styled.ContentContainer>

            <Styled.FooterContainer>
              <Button
                variant="outlined"
                data-cy="cancel_button"
                data-lumin-btn-name={isDownloadDoc ? ButtonName.CANCEL_SAVE_TO_DRIVE : null}
                onClick={isDownloadDoc ? closeDownloadModal : onClose}
              >
                {t('common.cancel')}
              </Button>

              <Button
                type="submit"
                data-cy="confirm_button"
                loading={isSubmitting}
                data-lumin-btn-name={isDownloadDoc ? ButtonName.CONFIRM_SAVE_TO_DRIVE : null}
              >
                {t(isDownloadDoc ? 'action.save' : 'action.copy')}
              </Button>
            </Styled.FooterContainer>
          </Styled.Container>
        </form>
      </Dialog>
    </ThemeProvider>
  );
};

CopyDocumentToDriveModal.defaultProps = defaultProps;
CopyDocumentToDriveModal.propTypes = propTypes;

export default CopyDocumentToDriveModal;
