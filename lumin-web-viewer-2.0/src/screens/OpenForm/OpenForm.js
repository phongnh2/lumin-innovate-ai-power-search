import { omitBy } from 'lodash';
import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import actions from 'actions';
import selectors from 'selectors';

import Loading from 'luminComponents/Loading';

import { useRestrictedUser } from 'hooks/useRestrictedUser';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import documentServices from 'services/documentServices';
import { kratosService } from 'services/oryServices';

import { cookieManager } from 'helpers/cookieManager';
import logger from 'helpers/logger';

import { TemplatePlatform, TemplateChannel } from 'utils/Factory/EventCollection/constants/TemplateEvent';
import { eventTracking } from 'utils/recordUtil';

import { useEnabledFormInGuestMode } from 'features/OpenForm';

import { CookieStorageKey } from 'constants/cookieName';
import UserEventConstants from 'constants/eventConstants';
import { ModalTypes } from 'constants/lumin-common';
import { Routers } from 'constants/Routers';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import FailedToAccessDialog from '../CreateExternalPdf/component/FailedToAccessDialog';

import './OpenForm.scss';

function OpenForm() {
  const [isError, setIsError] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const remoteId = searchParams.get(UrlSearchParam.FORM_REMOTE_ID);
  const source = searchParams.get(UrlSearchParam.SOURCE);
  const formStaticPath = searchParams.get(UrlSearchParam.FROM);
  const formName = searchParams.get(UrlSearchParam.FORM_NAME);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isCompletedGettingUserData = useSelector(selectors.getIsCompletedGettingUserData);
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const isLoggedIn = !!currentUser;
  const { isDriveOnlyUser } = useRestrictedUser();
  const isNonRestrictedUser = !isDriveOnlyUser;
  const { enabledFormInGuestMode, loading: calculatingOpenFormGuestModeVariant } = useEnabledFormInGuestMode();

  const openErrorModal = () => {
    dispatch(
      actions.openModal({
        type: ModalTypes.ERROR,
        title: t('openForm.failedToOpenForm'),
        message: t('common.somethingWentWrong'),
        onConfirm: () => navigate('/'),
      })
    );
  };

  const openFormFail = (err) => {
    setIsError(true);
    logger.logError({
      error: err,
      reason: 'Failed to open form from https://luminpdf.com/form-templates',
    });
    openErrorModal();
  };

  const buildSearchParams = () => {
    const params = {
      from: formStaticPath,
      source,
      remoteId,
    };

    return new URLSearchParams(omitBy(params, (val) => !val));
  };

  const createAndOpenForm = async () => {
    try {
      if (!isNonRestrictedUser) {
        return;
      }
      const inOpenFormFlow = cookieManager.get(CookieStorageKey.OPEN_FORM);
      if (!inOpenFormFlow) {
        navigate('/');
        return;
      }
      cookieManager.delete(CookieStorageKey.OPEN_FORM);
      const createPDFFormResult = await documentServices.createPDFForm({
        remoteId,
        formStaticPath,
        source,
      });
      if (!createPDFFormResult) {
        throw new Error('createPDFForm returned null or undefined');
      }
      const { documentId } = createPDFFormResult;
      eventTracking(UserEventConstants.EventType.DOC_CREATE_FROM_TEMPLATE, {
        luminTemplateId: remoteId,
        luminFileId: documentId,
        fileName: formName,
        channel: TemplateChannel.TEMPLATE_LIBRARY,
        platform: TemplatePlatform.PDF,
      });
      const searchQuery = queryString.parse(buildSearchParams().toString());
      navigate(
        queryString.stringifyUrl({
          url: [Routers.VIEWER, documentId].join('/'),
          query: searchQuery,
        }),
        { replace: true }
      );
    } catch (err) {
      openFormFail(err);
    }
  };

  const buildFormUrlTempEditMode = ({ remoteId, formName, searchParams }) => {
    const encodedFormName = encodeURIComponent(formName);
    const searchQuery = queryString.parse(searchParams.toString());

    return queryString.stringifyUrl({
      url: [Routers.VIEWER_TEMP_EDIT, remoteId, encodedFormName].join('/'),
      query: searchQuery,
    });
  };

  const createFormInTempEditMode = () => {
    const searchParams = buildSearchParams();
    const formUrl = buildFormUrlTempEditMode({ remoteId, formName, searchParams });
    navigate(formUrl, {
      replace: true,
    });
  };

  useEffect(() => {
    if (!isCompletedGettingUserData || calculatingOpenFormGuestModeVariant) {
      return;
    }

    if (!enabledFormInGuestMode) {
      if (isLoggedIn) {
        createAndOpenForm();
        return;
      }
      kratosService.signIn(true);
      return;
    }

    createFormInTempEditMode();
  }, [
    isCompletedGettingUserData,
    isLoggedIn,
    enabledFormInGuestMode,
    calculatingOpenFormGuestModeVariant,
    isNonRestrictedUser,
  ]);

  if (isError) {
    return null;
  }

  if (!isLoggedIn || isNonRestrictedUser) {
    return <Loading fullscreen />;
  }

  return <FailedToAccessDialog />;
}

export default OpenForm;
