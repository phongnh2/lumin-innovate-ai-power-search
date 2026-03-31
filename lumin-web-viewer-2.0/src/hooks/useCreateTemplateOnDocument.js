import { capitalize } from 'lodash';
import React, { useCallback } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import selectors from 'selectors';

import { useTranslation } from 'hooks';

import { templateServices, uploadServices } from 'services';

import logger from 'helpers/logger';

import { toastUtils, getFile, errorUtils, documentUtil } from 'utils';
import templateEvent from 'utils/Factory/EventCollection/TemplateEventCollection';

import { documentStorage, DOCUMENT_TYPE } from 'constants/documentConstants';
import { ErrorCode } from 'constants/errorCode';
import { LocationType } from 'constants/locationConstant';
import { ERROR_MESSAGE_TEMPLATE } from 'constants/messages';
import { ORGANIZATION_TEXT, ORG_TEXT } from 'constants/organizationConstants';
import { TEAM_TEXT } from 'constants/teamConstant';
import { mappingDocumentTypeToTemplateTab } from 'constants/templateConstant';
import { MAX_NAME_LENGTH as MAX_ORGANIZATION_NAME_LENGTH } from 'constants/userConstants';

const useCreateTemplateOnDocument = () => {
  const { _id: userId } = useSelector(selectors.getCurrentUser, shallowEqual);
  const { t } = useTranslation();

  const getDocumentNotLuminService = async ({ document }) => {
    let documentIns = null;
    let file = await getFile(document);
    if (file && file.type === 'application/pdf') {
      const { linearizedFile, documentInstance } = await uploadServices.linearPdfFromFiles(file);
      file = linearizedFile;
      documentIns = documentInstance;
    }

    return {
      file,
      documentIns,
    };
  };

  const truncateName = (text) => {
    const lastWord = text.slice(text.lastIndexOf(' ') + 1);
    return text.length > MAX_ORGANIZATION_NAME_LENGTH ? `${text.slice(0, MAX_ORGANIZATION_NAME_LENGTH / 2)}... ${lastWord}` : text;
  };

  const getMessageToast = ({
    type, name, parentName, orgUrl, destinationId,
  }) => {
    switch (type) {
      case LocationType.PERSONAL:
        return (
          <span>
            <Trans i18nKey="createBaseOnForm.toastPersonal">
              Template has been created to <Link to="/templates/personal">Personal Templates</Link>
            </Trans>
          </span>
        );
      case LocationType.ORGANIZATION:
        return (
          <span>
            <Trans i18nKey="createBaseOnForm.toastOrg">
              Template has been created in
              <Link to={`/${ORG_TEXT}/${orgUrl}/templates/${ORG_TEXT}`}>
                <b>{{ name: truncateName(name) }}</b>
              </Link>
              {{ orgText: capitalize(ORGANIZATION_TEXT) }}
            </Trans>
          </span>
        );
      case LocationType.ORGANIZATION_TEAM:
        return (
          <span>
            <Trans i18nKey="createBaseOnForm.toastTeam">
              Template has been created in
              <Link to={`/${ORG_TEXT}/${orgUrl}/templates/${TEAM_TEXT}/${destinationId}`}>
                <b>{{ name: truncateName(name) }}</b>
              </Link>
              team in <b>{{ parentName: truncateName(parentName) }}</b> {{ orgText: capitalize(ORGANIZATION_TEXT) }}
            </Trans>
          </span>
        );
      default:
        return null;
    }
  };

  const preCheckCreatedFile = useCallback(async (document) => {
    const { size, clientId, documentType } = document;
    const { allowedUpload } = uploadServices.checkUploadBySize(size, true);
    if (!allowedUpload) {
      return new Error(ERROR_MESSAGE_TEMPLATE.OVER_TEMPLATE_FILE_SIZE);
    }

    if (documentType === DOCUMENT_TYPE.PERSONAL) {
      return null;
    }

    /**
     * Validate daily template upload limit
     * before creating template in team & organization
     *  */
    const templateType = mappingDocumentTypeToTemplateTab[documentType];
    const hasReachedDailyLimit = await templateServices.from(templateType).checkReachDailyTemplateUploadLimit({
      uploaderId: userId,
      refId: clientId,
    });

    if (hasReachedDailyLimit) {
      return new Error(t(ERROR_MESSAGE_TEMPLATE.DAILY_UPLOAD_TEMPLATE_LIMIT));
    }

    return null;
  }, []);

  const onSubmit = async ({
    destination, document, templateData, thumbnailFile, isNotify, handleSubmitError, isRemoveThumbnail,
  }) => {
    const { _id: documentId, service: documentService } = document;
    const {
      id: destinationId, source: destinationType, content: destinationName, parentName, orgUrl,
    } = destination;
    let includeFormFields = false;
    let file = null;
    if (documentService !== documentStorage.s3) {
      const {
        file: linearizedFile,
        documentIns,
      } = await getDocumentNotLuminService({ document });
      file = linearizedFile;
      includeFormFields = await documentUtil.includeFormFields(documentIns);
    }

    const files = [
      file && {
        type: 'template',
        file,
      },
      thumbnailFile && {
        type: 'thumbnail',
        file: thumbnailFile,
      },
    ].filter(Boolean);

    try {
      const template = await templateServices.createTemplateBaseOnDocument({
        destinationId, destinationType, documentId, templateData, files, isNotify, isRemoveThumbnail,
      });
      templateEvent.createdSuccess({
        fileId: template._id,
        fileName: templateData.name,
        containFillableFields: includeFormFields,
        destination: destinationType.toLowerCase(),
      });

      const message = getMessageToast({
        type: destinationType, name: destinationName, parentName, orgUrl, destinationId,
      });
      toastUtils.success({ message });
      return { template };
    } catch (err) {
      const { code: errorCode } = errorUtils.extractGqlError(err);
      if (errorCode === ErrorCode.Template.DAILY_UPLOAD_TEMPLATE_LIMIT) {
        handleSubmitError(err.message);
      }

      logger.logError({ message: err.message });
      return { error: err };
    }
  };

  return { onSubmit, preCheckCreatedFile };
};

export default useCreateTemplateOnDocument;
