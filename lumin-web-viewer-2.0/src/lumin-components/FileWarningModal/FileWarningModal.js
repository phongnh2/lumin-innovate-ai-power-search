import { Dialog as KiwiDialog, Text, Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';
import { ThemeProvider } from 'styled-components';

import NotFoundImage from 'assets/images/file_404.svg';
import NoResultsFoundDark from 'assets/reskin/images/no-results-found-dark.png';
import NoResultsFound from 'assets/reskin/images/no-results-found.png';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import Dialog from 'lumin-components/Dialog';
import { DOCUMENT_DECORATOR_ACTION } from 'lumin-components/DocumentList/hooks/useAuthenticateService';
import DropboxFileChooser from 'luminComponents/DropboxFileChooser';
import GoogleFilePicker from 'luminComponents/GoogleFilePicker';
import OneDriveFilePicker from 'luminComponents/OneDriveFilePicker';

import { useEnableWebReskin, useThemeMode, useTranslation } from 'hooks';
import { useViewerMatch } from 'hooks/useViewerMatch';

import { documentServices } from 'services';

import { file as fileUtils } from 'utils';
import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { documentStorage } from 'constants/documentConstants';
import { ModalTypes, THEME_MODE } from 'constants/lumin-common';
import { STATIC_PAGE_URL } from 'constants/urls';

import * as Styled from './FileWarningModal.styled';

import styles from './FileWarningModal.module.scss';

const UploadLanguageKey = 'common.upload';

const propTypes = {
  documents: PropTypes.array.isRequired,
  folderId: PropTypes.string,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  openModal: PropTypes.func.isRequired,
  updateModalProperties: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  documentAction: PropTypes.string.isRequired,
};
const defaultProps = {
  folderId: '',
  onClose: () => {},
  onConfirm: () => {},
};

function FileWarningModal({
  onClose,
  documents,
  folderId,
  onConfirm,
  openModal,
  closeModal,
  updateModalProperties,
  documentAction,
}) {
  const { isViewer } = useViewerMatch();
  const themeMode = useThemeMode();
  const { t } = useTranslation();

  const { isEnableReskin } = useEnableWebReskin();

  const onConfirmPick = async (isChecked) => {
    updateModalProperties({
      isProcessing: true,
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
    });
    if (isChecked) {
      localStorage.setItem('pickerState', 'auto_delete');
    }
    await documentServices.onConfirmDelete({
      document: documents[0],
      notify: false,
      isSharedDocument: false,
      t,
    });
    closeModal();
    onClose();
  };

  const onCancelPick = (isChecked) => {
    if (isChecked) {
      localStorage.setItem('pickerState', 'keep_file');
    }
    closeModal();
    onClose();
  };

  const onCancelFilePicker = async () => {
    const pickerState = localStorage.getItem('pickerState');
    if (!pickerState) {
      const modalSetting = {
        type: ModalTypes.WARNING,
        title: t('viewer.fileWarningModal.cancelFilePicker'),
        message: t('viewer.fileWarningModal.messageCancelFilePicker'),
        confirmButtonTitle: t('common.delete'),
        cancelButtonTitle: t('viewer.fileWarningModal.noThanks'),
        closeOnConfirm: false,
        onConfirm: onConfirmPick,
        checkboxMessage: t('viewer.fileWarningModal.dontAskMeAgain'),
        onCancel: onCancelPick,
        useReskinModal: true,
      };
      openModal(modalSetting);
      return;
    }

    if (pickerState === 'auto_delete') {
      await documentServices.onConfirmDelete({
        document: documents[0],
        notify: false,
        isSharedDocument: false,
        t,
      });
    }

    closeModal();
    onClose();
  };

  const renderPickButton = () => {
    const documentService = documents[0].service;
    if (documentService === documentStorage.google) {
      return (
        <GoogleFilePicker
          isRequestAccess
          folderId={folderId}
          onClose={onCancelFilePicker}
          fileName={documents[0].name}
          mimeType={documents[0].mimeType}
        >
          {isEnableReskin ? (
            <Button size="lg" variant="filled" onClick={onClose}>
              {t(UploadLanguageKey)}
            </Button>
          ) : (
            <Styled.Button size={ButtonSize.XL} onClick={onClose}>
              {t(UploadLanguageKey)}
            </Styled.Button>
          )}
        </GoogleFilePicker>
      );
    }
    if (documentService === documentStorage.onedrive) {
      return (
        <OneDriveFilePicker folderId={folderId} onClose={onCancelFilePicker}>
          <Styled.Button size={ButtonSize.XL} onClick={onClose}>
            {t(UploadLanguageKey)}
          </Styled.Button>
        </OneDriveFilePicker>
      );
    }
    return (
      <DropboxFileChooser folderId={folderId} onClose={onCancelFilePicker}>
        {isEnableReskin ? (
          <Button size="lg" variant="filled" onClick={onClose}>
            {t('viewer.fileWarningModal.pickFile')}
          </Button>
        ) : (
          <Styled.Button size={ButtonSize.XL} onClick={onClose}>
            {t('viewer.fileWarningModal.pickFile')}
          </Styled.Button>
        )}
      </DropboxFileChooser>
    );
  };

  const mapServiceInfo = (service) =>
    ({
      [documentStorage.google]: {
        fullName: 'Google Drive',
        shortName: 'Google Drive',
      },
      [documentStorage.dropbox]: {
        fullName: 'Dropbox',
        shortName: 'Dropbox',
      },
      [documentStorage.onedrive]: {
        fullName: 'OneDrive',
        shortName: 'OneDrive',
      },
    }[service]);

  const getModalContent = () => {
    if (documentAction === DOCUMENT_DECORATOR_ACTION.MOVE_MULTIPLE) {
      return {
        header: t('viewer.fileWarningModal.couldNotFindSomeOfYourDocuments'),
        description: (
          <>
            {documents.map((item, index) => (
              <React.Fragment key={item._id}>
                {isEnableReskin ? (
                  <b className={styles.documentName}>{fileUtils.getShortFilename(item.name)}</b>
                ) : (
                  <Styled.DocumentName>{fileUtils.getShortFilename(item.name)}</Styled.DocumentName>
                )}
                {index !== documents.length - 1 && ', '}
              </React.Fragment>
            ))}{' '}
            {t('viewer.fileWarningModal.documentsCannotBeInteracted')}
          </>
        ),
        items: [
          {
            main: t('viewer.fileWarningModal.mayBeRemovedFromGoogleDriveDropbox'),
            sub: t('viewer.fileWarningModal.subMayBeRemovedFromGoogleDriveDropbox'),
          },
          {
            main: t('viewer.fileWarningModal.googleDriveDropboxMayBeUpdated'),
            sub: t('viewer.fileWarningModal.subGoogleDriveDropboxMayBeUpdated'),
          },
          {
            main: t('viewer.fileWarningModal.ourAccessPermissionsHaveChanged'),
            sub: t('viewer.fileWarningModal.uploadTheseDocumentsAgain'),
          },
        ],
      };
    }
    const { fullName, shortName } = mapServiceInfo(documents[0].service);
    return {
      header: t('viewer.fileWarningModal.couldNotFindYourDocument'),
      description: '',
      items: [
        {
          main: t('viewer.fileWarningModal.documentMayBeRemovedFromService', { service: fullName }),
          sub: t('viewer.fileWarningModal.subDocumentMayBeRemovedFromService'),
        },
        {
          main: t('viewer.fileWarningModal.yourAccessPermissionMayBeRemoved', { service: shortName }),
          sub: t('viewer.fileWarningModal.subYourAccessPermissionMayBeRemoved'),
        },
        {
          main: t('viewer.fileWarningModal.ourAccessPermissionsHaveChanged'),
          sub: t('viewer.fileWarningModal.subOurAccessPermissionsHaveChanged'),
        },
      ],
    };
  };

  const renderBottomButtons = () => {
    if (documentAction === DOCUMENT_DECORATOR_ACTION.OPEN_DOCUMENT) {
      if (isViewer) {
        return (
          <Button className={styles.okButton} size="lg" variant="filled" onClick={onConfirm}>
            {t('common.ok')}
          </Button>
        );
      }
      return (
        <>
          {isEnableReskin ? (
            <Button size="lg" variant="outlined" onClick={onClose}>
              {t('common.cancel')}
            </Button>
          ) : (
            <Styled.Button color={ButtonColor.TERTIARY} size={ButtonSize.XL} onClick={onClose}>
              {t('common.cancel')}
            </Styled.Button>
          )}
          {renderPickButton()}
        </>
      );
    }

    return isEnableReskin ? (
      <Button className={styles.okButton} size="lg" variant="filled" onClick={onClose}>
        {t('common.ok')}
      </Button>
    ) : (
      <Styled.Button size={ButtonSize.XL} onClick={onClose}>
        {t('common.ok')}
      </Styled.Button>
    );
  };

  const content = getModalContent();

  if (isEnableReskin) {
    return (
      <KiwiDialog centered opened onClose={onClose}>
        <div className={styles.bodyContainer}>
          <img src={themeMode === THEME_MODE.DARK ? NoResultsFoundDark : NoResultsFound} alt="Document not found" />
          <div>
            <Text
              className={content.description && styles.headerWithDesc}
              size="lg"
              type="headline"
              color="var(--kiwi-colors-surface-on-surface)"
            >
              {content.header}
            </Text>
            {content.description && (
              <Text size="md" type="body" color="var(--kiwi-colors-surface-on-surface-variant)">
                {content.description}
              </Text>
            )}
          </div>
          <div className={styles.textContainer}>
            {content.items.map((item) => (
              <div key={item.main} className={styles.textWrapper}>
                <Text size="sm" type="title" color="var(--kiwi-colors-surface-on-surface)">
                  {item.main}
                </Text>
                <Text size="sm" type="body" color="var(--kiwi-colors-surface-on-surface-variant)">
                  {item.sub}
                </Text>
              </div>
            ))}
          </div>
          <Text size="md" type="body" color="var(--kiwi-colors-surface-on-surface-variant)">
            <Trans i18nKey="viewer.fileWarningModal.contactUs">
              If you’re still having problems, please
              <a
                className={styles.contactLink}
                href={STATIC_PAGE_URL + getFullPathWithPresetLang(t('url.saleSupport.contactSupport'))}
                target="_blank"
                rel="noopener noreferrer"
              >
                contact us
              </a>
              .
            </Trans>
          </Text>
        </div>
        <div className={styles.bottomButtonsWrapper}>{renderBottomButtons()}</div>
      </KiwiDialog>
    );
  }

  return (
    <ThemeProvider theme={Styled.theme[themeMode]}>
      <Dialog open onClose={onClose}>
        <Styled.NotfoundImageContainer>
          <Styled.NotfoundImage src={NotFoundImage} />
        </Styled.NotfoundImageContainer>
        <Styled.MainTitle>{content.header}</Styled.MainTitle>
        <Styled.SubTitle>{content.description}</Styled.SubTitle>
        <Styled.ItemWrapper>
          {content.items.map((item) => (
            <Styled.ItemContainer key={item.main}>
              <Styled.ItemMainTitle>{item.main}</Styled.ItemMainTitle>
              <Styled.ItemSubTitle>{item.sub}</Styled.ItemSubTitle>
            </Styled.ItemContainer>
          ))}
        </Styled.ItemWrapper>
        <Styled.CustomDivider />
        <Styled.Contact>
          <Trans i18nKey="viewer.fileWarningModal.contactUs">
            If you’re still having problems, please
            <Styled.ContactLink
              href={STATIC_PAGE_URL + getFullPathWithPresetLang(t('url.saleSupport.contactSupport'))}
              target="_blank"
              rel="noopener noreferrer"
            >
              contact us
            </Styled.ContactLink>
            .
          </Trans>
        </Styled.Contact>
        <Styled.ButtonGroup>{renderBottomButtons()}</Styled.ButtonGroup>
      </Dialog>
    </ThemeProvider>
  );
}

FileWarningModal.propTypes = propTypes;
FileWarningModal.defaultProps = defaultProps;

export default FileWarningModal;
