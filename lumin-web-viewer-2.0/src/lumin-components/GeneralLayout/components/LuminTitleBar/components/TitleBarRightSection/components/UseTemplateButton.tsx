import { FilesDashedIcon } from '@luminpdf/icons/dist/csr/FilesDashed';
import { Button, enqueueSnackbar, CircularProgress } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import actions from 'actions';
import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';

import templateServices from 'services/templateServices';

import getOrgOfDoc from 'helpers/getOrgOfDoc';

import { TemplatePlatform, TemplateChannel } from 'utils/Factory/EventCollection/constants/TemplateEvent';
import { getRedirectOrgUrl } from 'utils/orgUrlUtils';
import { eventTracking } from 'utils/recordUtil';

import { useTemplateViewerMatch } from 'features/Document/hooks/useTemplateViewerMatch';

import UserEventConstants from 'constants/eventConstants';
import { ORG_ROUTES } from 'constants/Routers';

import styles from './UseTemplateButton.module.scss';

const UseTemplateButton = () => {
  const { t } = useTranslation();
  const { isTemplateViewer } = useTemplateViewerMatch();
  const dispatch = useDispatch();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const orgList = useShallowSelector(selectors.getOrganizationList);
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(false);

  if (!isTemplateViewer) {
    return null;
  }

  const handleUseTemplate = async () => {
    try {
      setLoading(true);
      const { _id: organizationId, url: organizationUrl } =
        getOrgOfDoc({
          organizations: orgList,
          currentDocument,
        }) || {};
      const createdDocument = await templateServices.createDocumentFromDocumentTemplate({
        documentId: currentDocument._id,
        destinationId: organizationId,
      });

      eventTracking(UserEventConstants.EventType.DOC_CREATE_FROM_TEMPLATE, {
        luminTemplateId: currentDocument._id,
        luminFileId: createdDocument._id,
        fileName: createdDocument.name,
        channel: TemplateChannel.TEMPLATE_EDITOR,
        platform: TemplatePlatform.PDF,
      }).catch(() => {});
      dispatch(actions.setIsLoadingDocument(true));
      dispatch(actions.resetCurrentDocument());
      navigate(`/viewer/${createdDocument._id}`);
      const documentsUrl = getRedirectOrgUrl({ orgUrl: organizationUrl, path: ORG_ROUTES.DOCUMENTS_PERSONAL });
      enqueueSnackbar({
        variant: 'success',
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
      });
    } catch (error) {
      enqueueSnackbar({
        message: t('common.somethingWentWrong'),
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      leftSection={loading ? <CircularProgress size="xs" /> : <FilesDashedIcon size={20} />}
      onClick={handleUseTemplate}
      disabled={loading}
    >
      {t('common.useThisTemplate')}
    </Button>
  );
};

export default UseTemplateButton;
