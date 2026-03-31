/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { get } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { Trans } from 'react-i18next';
import { useSelector, shallowEqual } from 'react-redux';

import { enqueueSnackbar } from '@libs/snackbar';

import selectors from 'selectors';

import { LazyContentDialog } from 'luminComponents/Dialog';
import Loading from 'luminComponents/Loading';
import ModalSkeleton from 'luminComponents/ModalFolder/components/ModalSkeleton';
import {
  Destination,
  DestinationLocation,
  ModalContext,
} from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';
import { CustomLink } from 'luminComponents/TransferDocument/TransferDocument.styled';
import { LoadingIcon } from 'luminComponents/TransferDocument/TransferDocumentStyled';

import { useEnableWebReskin, usePaymentUrlDestination, useStrictDownloadGooglePerms, useTranslation } from 'hooks';

import { documentServices, uploadServices } from 'services';

import { getFile, file as fileUtil, validator } from 'utils';
import errorExtract from 'utils/error';
import errorInterceptor from 'utils/errorInterceptor';
import documentEvent from 'utils/Factory/EventCollection/DocumentEventCollection';
import { lazyWithRetry } from 'utils/lazyWithRetry';

import { documentStorage, DOCUMENT_TYPE } from 'constants/documentConstants';
import { ErrorCode, GoogleErrorCode } from 'constants/errorCode';
import {
  ERROR_MESSAGE_DOCUMENT,
  ERROR_MESSAGE_RESTRICTED_ACTION,
  ERROR_MESSAGE_TYPE,
  ERROR_MESSAGE_UNKNOWN_ERROR,
  getUploadOverFileSizeError,
} from 'constants/messages';
import { ModalSize } from 'constants/styles';
import { supportedPDFExtensions } from 'constants/supportedFiles';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';
import { OrganizationList } from 'interfaces/redux/organization.redux.interface';
import { IUser } from 'interfaces/user/user.interface';

type CopyDocumentProps = {
  document: IDocumentBase;
  onClose: () => void;
};

const TransferDocument = lazyWithRetry(() => import('lumin-components/TransferDocument'));

function CopyDocumentModal({ document, onClose }: CopyDocumentProps): JSX.Element {
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);
  const { data: organizationList, loading } = useSelector<unknown, OrganizationList>(
    selectors.getOrganizationList,
    shallowEqual
  );
  const getDefaultLocation = (): { defaultTarget: IOrganization | IUser; defaultDestination: Destination } => {
    if (loading) {
      return {
        defaultTarget: null,
        defaultDestination: null,
      };
    }
    const organizations = organizationList.map(({ organization }) => organization);
    const { belongsTo, isShared } = document;
    if (isShared) {
      return {
        defaultTarget: null,
        defaultDestination: null,
      };
    }
    const isFolderLocation = Boolean(document.folderId);
    switch (belongsTo.type) {
      case DOCUMENT_TYPE.PERSONAL: {
        const isPersonalInOrg = Boolean(belongsTo.workspaceId);
        const defaultTarget = isPersonalInOrg
          ? organizations.find((org) => org._id === belongsTo.workspaceId)
          : currentUser;
        return {
          defaultTarget,
          defaultDestination: {
            _id: document.folderId || defaultTarget._id,
            name: '',
            type: isFolderLocation ? DestinationLocation.FOLDER : DestinationLocation.PERSONAL,
            belongsTo: {
              _id: isFolderLocation ? currentUser._id : defaultTarget._id,
              name: isFolderLocation ? currentUser.name : defaultTarget.name,
              type:
                isPersonalInOrg && !isFolderLocation ? DestinationLocation.ORGANIZATION : DestinationLocation.PERSONAL,
              data: isFolderLocation ? currentUser : defaultTarget,
            },
          },
        };
      }
      case DOCUMENT_TYPE.ORGANIZATION: {
        const organization = organizations.find((org) => org._id === document.clientId);
        return {
          defaultTarget: organization,
          defaultDestination: {
            _id: document.folderId || organization._id,
            name: organization.name,
            type: isFolderLocation ? DestinationLocation.FOLDER : DestinationLocation.ORGANIZATION,
            belongsTo: {
              _id: organization._id,
              name: organization.name,
              type: DestinationLocation.ORGANIZATION,
              data: organization,
            },
          },
        };
      }
      case DOCUMENT_TYPE.ORGANIZATION_TEAM: {
        const organization = organizations.find((org) => org.url === belongsTo.location.url);
        const team = organization.teams.find((t) => t._id === document.clientId);
        const belongsToData = isFolderLocation
          ? {
              _id: team._id,
              name: team.name,
              type: DestinationLocation.ORGANIZATION_TEAM,
              data: team,
            }
          : {
              _id: organization._id,
              name: organization.name,
              type: DestinationLocation.ORGANIZATION,
              data: organization,
            };
        return {
          defaultTarget: organization,
          defaultDestination: {
            _id: document.folderId || document.clientId,
            name: team.name,
            type: isFolderLocation ? DestinationLocation.FOLDER : DestinationLocation.ORGANIZATION_TEAM,
            belongsTo: belongsToData,
          },
        };
      }

      default:
        break;
    }

    return {
      defaultTarget: null,
      defaultDestination: null,
    };
  };

  const { t } = useTranslation();
  const { showModal } = useStrictDownloadGooglePerms();

  const [defaultLocation, setDefaultLocation] = useState(getDefaultLocation());

  const [destination, setDestination] = useState<Destination>(
    defaultLocation.defaultDestination || ({} as Destination)
  );
  const [isCopying, setIsCopying] = useState(false);
  const [error, setError] = useState<string | JSX.Element>('');
  const [newDocumentName, setNewDocumentName] = useState(
    `Copy of ${fileUtil.getFilenameWithoutExtension(document.name)}`
  );
  const [errorName, setErrorName] = useState('');
  const [isNotify, setIsNotify] = useState(false);

  const organizations = useMemo(() => organizationList.map(({ organization }) => organization), [organizationList]);

  const [selectedTarget, setSelectedTarget] = useState<IOrganization | IUser>(
    defaultLocation.defaultTarget || organizations[0] || currentUser
  );

  const { paymentUrl, isManager, contentUrl, orgDestination } = usePaymentUrlDestination({
    selectedTarget: organizations.find((org) => org._id === selectedTarget._id),
  });

  const { isEnableReskin } = useEnableWebReskin();

  const getSuccessMessage = ({ target }: { target: IOrganization | IUser }): JSX.Element => {
    const { type: destinationType, name } = destination;
    const boldComponent = <b style={{ fontWeight: 700 }} />;
    switch (destinationType) {
      case DOCUMENT_TYPE.PERSONAL:
        if ('clientId' in target) {
          return (
            <Trans
              i18nKey="modalMakeACopy.docCopiedToPersonal"
              components={{ b: boldComponent }}
              values={{ userName: currentUser.name }}
            />
          );
        }
        return (
          <p>
            <Trans
              i18nKey="modalMakeACopy.docCopiedToPersonalInOrg"
              components={{ b: boldComponent }}
              values={{ orgName: target.name }}
            />
          </p>
        );
      case DOCUMENT_TYPE.FOLDER:
        return (
          <p>
            <Trans
              i18nKey="modalMakeACopy.docCopiedToFolder"
              components={{ b: boldComponent }}
              values={{ folderName: name }}
            />
          </p>
        );
      case DOCUMENT_TYPE.ORGANIZATION:
        return (
          <p>
            <Trans
              i18nKey="modalMakeACopy.docCopiedToOrg"
              components={{ b: boldComponent }}
              values={{ orgName: name }}
            />
          </p>
        );
      case DOCUMENT_TYPE.ORGANIZATION_TEAM:
        return (
          <p>
            <Trans
              i18nKey="modalMakeACopy.docCopiedToTeam"
              components={{ b: boldComponent }}
              values={{ teamName: name, orgName: target.name }}
            />
          </p>
        );
      default:
        break;
    }
  };

  const handlerError = (err: any): void => {
    const { code } = errorExtract.extractGqlError(err);
    const message = errorInterceptor.getDocumentErrorMessage(err);
    if (code === ErrorCode.Document.ORG_REACHED_DOC_STACK_LIMIT) {
      setError(
        <>
          {t('errorMessage.hitDocStack')}{' '}
          {isManager ? (
            <CustomLink to={paymentUrl} data-reskin={isEnableReskin}>
              {contentUrl}.
            </CustomLink>
          ) : (
            contentUrl
          )}
        </>
      );
      return;
    }

    if (code === ErrorCode.Common.RESTRICTED_ACTION) {
      setError(ERROR_MESSAGE_RESTRICTED_ACTION);
      return;
    }

    if (message === ERROR_MESSAGE_UNKNOWN_ERROR) {
      enqueueSnackbar({
        message: t(ERROR_MESSAGE_DOCUMENT.MOVE_DOCUMENT_FAILED),
        variant: 'error',
      });
      return;
    }
    setError(message);
  };

  const onSubmit = async ({ target }: { target: IOrganization | IUser }): Promise<void> => {
    setIsCopying(true);
    const { _id: destinationId, type: destinationType, belongsTo } = destination;
    const formatDocName = (newDocumentName as unknown as string).trim();
    try {
      const file = await getFile(document);
      if (document.service !== documentStorage.s3 && !file) {
        return;
      }
      let linearizedFile = null;
      if (file) {
        const fileData = await uploadServices.linearPdfFromFiles(file);
        linearizedFile = fileData.linearizedFile;
      }

      if (destinationType === DOCUMENT_TYPE.FOLDER) {
        await documentServices.duplicateDocumentToFolder({
          documentId: document._id,
          documentName: formatDocName,
          folderId: destinationId,
          notifyUpload: isNotify,
          file: linearizedFile,
        });
      } else {
        await documentServices.duplicateDocument({
          documentId: document._id,
          documentName: formatDocName,
          destinationId: destinationType === DOCUMENT_TYPE.PERSONAL ? belongsTo?._id || destinationId : destinationId,
          destinationType,
          notifyUpload: isNotify,
          file: linearizedFile,
        });
      }

      const documentType = fileUtil.getExtension(document.name);
      let fileType = documentType;
      if (supportedPDFExtensions.includes(documentType)) {
        fileType = 'pdf';
      }
      documentEvent.downloadDocumentSuccess({ fileType, savedLocation: 'lumin' }).catch(() => {});

      enqueueSnackbar({
        message: getSuccessMessage({ target }),
        variant: 'success',
      });
      onClose();
    } catch (err) {
      if (errorExtract.isGraphError(err)) {
        handlerError(err);
      } else {
        if (get(err, 'result.error.errors[0].reason') === GoogleErrorCode.CANNOT_DOWNLOAD_FILE) {
          showModal(
            () => onSubmit({ target }),
            () => {}
          );
          return;
        }
        setError(
          (err.message === ERROR_MESSAGE_TYPE.PDF_CANCEL_PASSWORD
            ? t('modalMakeACopy.cancelPassword', { fileName: formatDocName })
            : err.message) as string
        );
      }
    } finally {
      setIsCopying(false);
    }
  };

  const checkDestinationIsPremium = (): { isPremium: boolean } => {
    // if orgDestination is empty then moving to professional user
    if (!orgDestination) {
      return { isPremium: true };
    }

    return { isPremium: validator.validatePremiumOrganization(orgDestination) };
  };

  const checkFileSizeBeforeSubmit = async ({ target }: { target: IOrganization | IUser }): Promise<void> => {
    const { isPremium } = checkDestinationIsPremium();

    const { allowedUpload, maxSizeAllow } = uploadServices.checkUploadBySize(document.size, isPremium);

    if (!allowedUpload) {
      setError(getUploadOverFileSizeError(maxSizeAllow));
      return;
    }

    await onSubmit({ target });
  };

  useEffect(() => {
    if (!loading) {
      setDefaultLocation(getDefaultLocation());
    }
  }, [loading]);

  if (loading) {
    return (
      <LazyContentDialog open width={ModalSize.MDX} noPadding fallback={<ModalSkeleton />} title="">
        <div style={{ height: '400px' }}>
          <LoadingIcon>
            <Loading normal />
          </LoadingIcon>
        </div>
      </LazyContentDialog>
    );
  }
  return (
    <TransferDocument
      documents={[document]}
      organizations={organizations}
      onClose={onClose}
      context={ModalContext.COPY}
      destination={destination}
      setDestination={setDestination}
      isProcessing={isCopying}
      error={error}
      onSubmit={checkFileSizeBeforeSubmit}
      selectedTarget={selectedTarget}
      setSelectedTarget={setSelectedTarget}
      newNameState={{
        isOpen: true,
        value: newDocumentName,
        dispatch: setNewDocumentName,
        error: errorName,
        setError: setErrorName,
      }}
      notify={{
        value: isNotify,
        set: setIsNotify,
      }}
    />
  );
}

export default CopyDocumentModal;
