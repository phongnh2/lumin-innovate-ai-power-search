import { Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, { useState, useEffect } from 'react';
import { Trans } from 'react-i18next';
import { useMatch } from 'react-router';

import { BadRequestPage } from '@new-ui/components/BadRequestPage';

import CannotOpenDocumentDarkNew from 'assets/images/dark-request-access-document.svg';
import CannotOpenDocumentNew from 'assets/images/request-access-document-new.svg';

import { LayoutSecondary } from 'lumin-components/Layout';
import { RequestPermissionText } from 'lumin-components/RequestAccessDocumentList/constants';

import { useGetImageByTheme } from 'hooks/useGetImageByTheme';
import { useTranslation } from 'hooks/useTranslation';

import authServices from 'services/authServices';
import documentServices from 'services/documentServices';
import { kratosService } from 'services/oryServices';

import logger from 'helpers/logger';

import errorExtract from 'utils/error';
import { eventTracking } from 'utils/recordUtil';
import toastUtils from 'utils/toastUtils';

import { ButtonBadRequestPage, BadRequestPageType } from 'constants/badRequestPage';
import { DocumentRole } from 'constants/documentConstants';
import { ErrorCode as errorCode } from 'constants/errorCode';
import UserEventConstants from 'constants/eventConstants';
import { ModalTypes, STATUS_CODE, ErrorCode, LOGGER } from 'constants/lumin-common';
import { Routers } from 'constants/Routers';
import { BASEURL } from 'constants/urls';

const propTypes = {
  currentUser: PropTypes.object,
  location: PropTypes.object,
  navigate: PropTypes.func,
  openModal: PropTypes.func,
};

const defaultProps = {
  currentUser: {},
  location: {},
  navigate: () => {},
  openModal: () => {},
};

const LoadingAction = {
  SIGN_OUT: 'signOut',
  REQUEST_ACCESS: 'requestAccess',
};

function RequestAccess({ currentUser, location, navigate, openModal }) {
  const { t } = useTranslation();
  const requestAccessImage = useGetImageByTheme(CannotOpenDocumentNew, CannotOpenDocumentDarkNew);
  const params = new URLSearchParams(location.search);
  const documentId = params.get('docId');
  const from = params.get('from') || '';
  const isTemplateRequestAccess = Boolean(useMatch(Routers.REQUEST_ACCESS_TEMPLATE));
  useEffect(() => {
    async function checkDocId() {
      if (!documentId) {
        navigate('/');
        return;
      }
      try {
        await documentServices.getDocument({ documentId });
        navigate(`${Routers.VIEWER}/${documentId}`);
      } catch (error) {
        const { statusCode } = errorExtract.extractGqlError(error);
        switch (statusCode) {
          case STATUS_CODE.BAD_REQUEST:
          case STATUS_CODE.UNPROCESSABLE_ENTITY:
            navigate(Routers.NOT_FOUND, { replace: true });
            break;
          case STATUS_CODE.FORBIDDEN:
            break;
          default:
            toastUtils.openToastMulti({
              type: ModalTypes.ERROR,
              message: t('common.somethingWentWrong'),
            });
            break;
        }
      }
    }
    checkDocId();
  }, []);

  const [loadingAction, setLoadingAction] = useState(null);

  const signInWithAnotherAccount = async () => {
    try {
      setLoadingAction(LoadingAction.SIGN_OUT);
      await kratosService.signOut(() => {
        logger.logInfo({
          message: LOGGER.EVENT.SIGN_OUT,
          reason: LOGGER.Service.KRATOS_INFO,
        });
        authServices.afterSignOut({
          returnTo: {
            url: `${BASEURL}/${isTemplateRequestAccess ? 'template' : 'viewer'}/${documentId}${
              queryString.stringify({ from }) ? `?${queryString.stringify({ from })}` : ''
            }`,
          },
        });
      });
    } catch (error) {
      setLoadingAction(null);
      logger.logError({
        reason: LOGGER.Service.KRATOS_ERROR,
        error,
      });
    }
  };
  const requestAccessDocument = async () => {
    eventTracking(UserEventConstants.EventType.REQUEST_DOCUMENT_PERMISSION, {
      permission: RequestPermissionText[DocumentRole.SPECTATOR],
      LuminFileId: documentId,
    });
    try {
      setLoadingAction(LoadingAction.REQUEST_ACCESS);
      await documentServices.requestAccessDocument({ documentId, documentRole: DocumentRole.SPECTATOR.toUpperCase() });
      navigate('/request-submitted');
    } catch (error) {
      const graphError = errorExtract.extractGqlError(error);
      const { code } = graphError;
      if (code === errorCode.Common.RESTRICTED_ACTION) {
        toastUtils.error({
          message: 'This action is restricted to the target domain.',
        });
        return;
      }
      if (code === ErrorCode.Document.ALREADY_HAVE_PERMISSION) {
        const modalSettings = {
          type: ModalTypes.WARNING,
          title: t('requestAccess.permissionUpdated'),
          message: t('requestAccess.reloadToHaveNewPermission'),
          disableBackdropClick: true,
          disableEscapeKeyDown: true,
          isFullWidthButton: true,
          confirmButtonTitle: t('requestAccess.reload'),
          onConfirm: () => window.location.reload(),
        };
        openModal(modalSettings);
      } else {
        toastUtils.openToastMulti({
          type: ModalTypes.ERROR,
          message: error.message,
          error,
        });
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const renderMessage = () => (
    <Trans
      i18nKey="requestAccess.description"
      values={{ email: currentUser.email }}
      components={{ bold: <b /> }}
      {...(isTemplateRequestAccess && { context: 'template' })}
    />
  );

  const renderFooterButtons = () =>
    isTemplateRequestAccess ? (
      <>
        <div />
        <Button
          {...ButtonBadRequestPage.FilledLargeSystem}
          onClick={signInWithAnotherAccount}
          loading={loadingAction === LoadingAction.SIGN_OUT}
        >
          {t('requestAccess.useAnotherAccount')}
        </Button>
      </>
    ) : (
      <>
        <Button
          {...ButtonBadRequestPage.TextLargeSystem}
          onClick={signInWithAnotherAccount}
          className="flex-start"
          loading={loadingAction === LoadingAction.SIGN_OUT}
        >
          {t('requestAccess.useAnotherAccount')}
        </Button>
        <Button
          {...ButtonBadRequestPage.FilledLargeSystem}
          loading={loadingAction === LoadingAction.REQUEST_ACCESS}
          onClick={requestAccessDocument}
        >
          {t('requestAccess.requestAccess')}
        </Button>
      </>
    );

  return (
    <LayoutSecondary footer={false} staticPage badRequestLayout>
      <BadRequestPage
        id={BadRequestPageType.RequestAccess}
        title={t('requestAccess.title', { context: isTemplateRequestAccess ? 'template' : null })}
        image={requestAccessImage}
        description={renderMessage()}
        buttons={renderFooterButtons()}
        flexEnd={false}
        isTitleWrap
      />
    </LayoutSecondary>
  );
}

RequestAccess.propTypes = propTypes;
RequestAccess.defaultProps = defaultProps;

export default RequestAccess;
