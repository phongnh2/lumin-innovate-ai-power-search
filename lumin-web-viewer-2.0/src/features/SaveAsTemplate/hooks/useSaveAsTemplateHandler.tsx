import { CancelTokenSource } from 'axios';
import { Link, ModalTypes } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useNavigate } from 'react-router';

import { enqueueSnackbar } from '@libs/snackbar';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { DestinationLocation } from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';

import { useTranslation } from 'hooks';
import { useGetPresignedUrlForUploadDoc } from 'hooks/useGetPresignedUrl';
import useRestrictedFileSizeModal from 'hooks/useRestrictedFileSizeModal';

import { documentServices, uploadServices } from 'services';
import templateServices from 'services/templateServices';

import { TemplateChannel, TemplateCreateMethod, TemplatePlatform, TemplateScope } from 'utils/Factory/EventCollection/constants/TemplateEvent';
import getFileService from 'utils/getFileService';
import { getRedirectOrgUrl } from 'utils/orgUrlUtils';
import { eventTracking } from 'utils/recordUtil';
import validator from 'utils/validator';

import UserEventConstants from 'constants/eventConstants';
import { ERROR_MESSAGE_TYPE } from 'constants/messages';
import { ORG_TEXT } from 'constants/organizationConstants';
import { TEAM_TEXT } from 'constants/teamConstant';
import { MAX_TEMPLATE_COUNT } from 'constants/templateConstant';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';

import { setIsOpenSaveAsTemplate } from '../slices';

interface SaveAsTemplateParams {
  templateName: string;
  selectedDestination: {
    type: DestinationLocation;
    id: string;
    label: string;
  };
  isNotify?: boolean;
}

const useSaveAsTemplateHandler = (org: IOrganization) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { openRestrictedFileSizeModal } = useRestrictedFileSizeModal();
  const currentDocument = useSelector<unknown, IDocumentBase>(selectors.getCurrentDocument, shallowEqual);
  const [getPresignedUrl] = useGetPresignedUrlForUploadDoc();
  const navigate = useNavigate();

  const uploadFilesToS3 = async (
    { file, thumbnail }: { file: File; thumbnail?: File },
    requestConfig: { cancelToken?: CancelTokenSource; onUploadProgress?: (progressEvent: ProgressEvent) => void } = {}
  ) => {
    const { cancelToken, onUploadProgress } = requestConfig;
    const {
      document: documentPresignedData,
      thumbnail: thumbnailPresignedData,
      encodedUploadData,
    } = await getPresignedUrl({ documentMimeType: file.type, thumbnailMimeType: thumbnail?.type });
    await Promise.all([
      documentServices.uploadFileToS3(
        {
          file,
          presignedUrl: documentPresignedData.url,
        },
        { cancelToken, onUploadProgress }
      ),
      documentServices.uploadFileToS3(
        {
          file: thumbnail,
          presignedUrl: thumbnailPresignedData.url,
        },
        { cancelToken, onUploadProgress }
      ),
    ]);
    return encodedUploadData;
  };

  const getNavigateToTemplates = (destination: { type: DestinationLocation; id: string }): string => {
    switch (destination.type) {
      case DestinationLocation.ORGANIZATION:
        return getRedirectOrgUrl({ orgUrl: org.url, path: `/templates/${ORG_TEXT}` });
      case DestinationLocation.ORGANIZATION_TEAM:
        return getRedirectOrgUrl({ orgUrl: org.url, path: `/templates/${TEAM_TEXT}/${destination.id}` });
      case DestinationLocation.PERSONAL:
      default:
        return getRedirectOrgUrl({ orgUrl: org.url, path: '/templates/personal' });
    }
  };

  const getSuccessMessage = (destination: { type: DestinationLocation; id: string }): JSX.Element => {
    const href = getNavigateToTemplates(destination);
    switch (destination.type) {
      case DestinationLocation.ORGANIZATION:
        return (
          <Trans
            i18nKey="viewer.saveAsTemplate.successToast"
            context="workspace"
            components={{ Link: <Link target="_blank" href={href} size="md" /> }}
          />
        );
      case DestinationLocation.ORGANIZATION_TEAM:
        return (
          <Trans
            i18nKey="viewer.saveAsTemplate.successToast"
            context="space"
            components={{
              Link: <Link target="_blank" href={href} size="md" />,
            }}
          />
        );
      case DestinationLocation.PERSONAL:
      default:
        return (
          <Trans
            i18nKey="viewer.saveAsTemplate.successToast"
            components={{ Link: <Link target="_blank" href={href} size="md" /> }}
          />
        );
    }
  };

  const checkDestinationIsPremium = (): { isPremium: boolean } => {
    if (!org) {
      return { isPremium: true };
    }

    return { isPremium: validator.validatePremiumOrganization(org) };
  };

  const duplicateDocumentAsTemplate = async (params: SaveAsTemplateParams): Promise<void> => {
    const { templateName, selectedDestination } = params;
    const { type: destinationType, id: destinationId } = selectedDestination;

    try {
      const file = await getFileService.getLinearizedDocumentFile(`${templateName}.pdf`);
      const thumbnail = await uploadServices.getThumbnailDocument(core.getDocument());
      const encodedUploadData = await uploadFilesToS3({ file, thumbnail });
      const args = {
        fileName: file.name,
        encodedUploadData,
      };

      let result;

      switch (destinationType) {
        case DestinationLocation.PERSONAL:
          result = await templateServices.uploadDocumentTemplateToPersonal({
            ...args,
            orgId: destinationId,
          });
          break;
        case DestinationLocation.ORGANIZATION:
          result = await templateServices.uploadDocumentTemplateToOrganization({
            ...args,
            orgId: destinationId,
          });
          break;
        case DestinationLocation.ORGANIZATION_TEAM:
          result = await templateServices.uploadDocumentTemplateToOrgTeam({
            ...args,
            teamId: destinationId,
          });
          break;
        default:
          break;
      }

      const scopeMapper = {
        [DestinationLocation.PERSONAL]: TemplateScope.PERSONAL,
        [DestinationLocation.ORGANIZATION]: TemplateScope.WORKSPACE,
        [DestinationLocation.ORGANIZATION_TEAM]: TemplateScope.SPACE,
      };

      eventTracking(UserEventConstants.EventType.TEMPLATE_CREATED, {
        method: TemplateCreateMethod.SAVE_FROM_DOCUMENT,
        templateName: file.name,
        luminTemplateId: result._id,
        platform: TemplatePlatform.PDF,
        channel: TemplateChannel.DOCUMENT_EDITOR,
        scope: scopeMapper[destinationType as keyof typeof scopeMapper],
      }).catch(() => {});

      enqueueSnackbar({
        message: getSuccessMessage(selectedDestination),
        variant: 'success',
      });

      dispatch(setIsOpenSaveAsTemplate(false));
    } catch (err: unknown) {
      const { code, message }: { code?: string; message?: string } =
        (err as { response?: { data?: { code: string; message: string } } })?.response?.data || {};
      if (code === ERROR_MESSAGE_TYPE.DOCUMENT_TEMPLATE_QUOTA_EXCEEDED) {
        dispatch(
          actions.openModal({
            type: ModalTypes.error,
            title: t('viewer.saveAsTemplate.templateQuotaExceeded'),
            confirmButtonTitle: t('common.remove'),
            cancelButtonTitle: t('action.cancel'),
            message: t('errorMessage.documentTemplateQuotaExceeded', {
              maxTemplateCount: MAX_TEMPLATE_COUNT.toLocaleString('en-US'),
            }),
            useReskinModal: true,
            onConfirm: () => {
              const href = getNavigateToTemplates(selectedDestination);
              navigate(href);
            },
            onCancel: () => {},
          })
        );
        return;
      }
      const errorMessage = message || t('errorMessage.unknownError');

      enqueueSnackbar({
        message: errorMessage,
        variant: 'error',
      });
    }
  };

  const checkFileSizeAndDuplicate = (): boolean => {
    const { isPremium } = checkDestinationIsPremium();

    const { allowedUpload, maxSizeAllow } = uploadServices.checkUploadBySize(currentDocument.size, isPremium);

    if (!allowedUpload) {
      openRestrictedFileSizeModal({ maxSizeAllow, organization: org });
      return false;
    }

    return true;
  };

  const handler = async (params: SaveAsTemplateParams) => {
    const isAllowedUpload = checkFileSizeAndDuplicate();
    if (isAllowedUpload) {
      await duplicateDocumentAsTemplate(params);
    }
  };

  const closeModal = () => {
    dispatch(setIsOpenSaveAsTemplate(false));
  };

  return {
    handler,
    closeModal,
  };
};

export default useSaveAsTemplateHandler;
