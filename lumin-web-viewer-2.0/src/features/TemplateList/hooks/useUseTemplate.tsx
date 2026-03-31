import React, { useCallback, useState } from 'react';
import { Trans } from 'react-i18next';
import { useNavigate } from 'react-router';

import useGetCurrentOrganization from 'hooks/useGetCurrentOrganization';
import { useTranslation } from 'hooks/useTranslation';

import { templateServices } from 'services';

import { eventTracking } from 'utils';
import { TemplateChannel, TemplatePlatform } from 'utils/Factory/EventCollection/constants/TemplateEvent';
import { getRedirectOrgUrl } from 'utils/orgUrlUtils';
import toastUtils from 'utils/toastUtils';

import UserEventConstants from 'constants/eventConstants';
import { ORG_ROUTES } from 'constants/Routers';

import styles from './styles.module.scss';

type UseUseTemplateProps = {
  documentId: string;
};

export function useUseTemplate({ documentId }: UseUseTemplateProps) {
  const currentOrganization = useGetCurrentOrganization();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const useTemplate = useCallback(async () => {
    try {
      setIsLoading(true);
      const { _id: organizationId, url: organizationUrl } = currentOrganization || {};
      const createdDocument = await templateServices.createDocumentFromDocumentTemplate({
        documentId,
        destinationId: organizationId,
      });
      const documentsUrl = getRedirectOrgUrl({ orgUrl: organizationUrl, path: ORG_ROUTES.DOCUMENTS_PERSONAL });
      eventTracking(UserEventConstants.EventType.DOC_CREATE_FROM_TEMPLATE, {
        luminFileId: createdDocument._id,
        luminTemplateId: documentId,
        fileName: createdDocument.name,
        platform: TemplatePlatform.PDF,
        channel: TemplateChannel.TEMPLATE_LIST,
      }).catch(() => {});
      toastUtils
        .success({
          message: (
            <Trans
              i18nKey="templatePage.documentCreatedSuccessfully"
              components={{
                Link: (
                  // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
                  <a
                    data-cy="document_location_link"
                    className={styles.link}
                    href={documentsUrl}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(documentsUrl, {
                        state: { documentId: createdDocument._id, documentName: createdDocument.name },
                      });
                    }}
                  />
                ),
              }}
            />
          ),
        })
        .catch(() => {});
      navigate(`/viewer/${createdDocument._id}`);
    } catch {
      toastUtils
        .error({
          message: t('common.somethingWentWrong'),
        })
        .catch(() => {});
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization, documentId, navigate, t]);

  return {
    handleUseTemplate: useTemplate,
    isLoading,
  };
}
