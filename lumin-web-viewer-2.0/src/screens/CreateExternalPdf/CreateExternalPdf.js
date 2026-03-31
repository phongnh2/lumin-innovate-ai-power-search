import { isNil, omitBy } from 'lodash';
import queryString from 'query-string';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router';

import actions from 'actions';

import Loading from 'luminComponents/Loading';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import { useRestrictedUser } from 'hooks/useRestrictedUser';
import { useTranslation } from 'hooks/useTranslation';

import documentGraphServices from 'services/graphServices/documentGraphServices';

import logger from 'helpers/logger';

import { eventTracking } from 'utils/recordUtil';

import UserEventConstants from 'constants/eventConstants';
import { LOGGER, ModalTypes } from 'constants/lumin-common';
import { Routers } from 'constants/Routers';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import FailedToAccessDialog from './component/FailedToAccessDialog';

function CreateExternalPdf() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = new URLSearchParams(location.search);
  const action = params.get('action');
  const from = params.get('from');
  const encodeData = params.get('encodeData');
  const orgId = params.get('orgId');
  const { t } = useTranslation();
  const currentUser = useGetCurrentUser();
  const { isDriveOnlyUser } = useRestrictedUser();
  const isNonRestrictedUser = !isDriveOnlyUser;
  const searchParams = new URLSearchParams(location.search);
  const formStaticPath = searchParams.get(UrlSearchParam.FROM);

  const openErrorModal = () => {
    const modalSettings = {
      type: ModalTypes.ERROR,
      title: t('createExternalPdf.failedToOpenPdf'),
      message: t('common.somethingWentWrong'),
      onConfirm: () => navigate('/', { replace: true }),
    };
    dispatch(actions.openModal(modalSettings));
  };

  const buildSearchParams = ({ formStaticPath, encodeData }) => {
    const params = {
      from: formStaticPath,
      encodeData,
      action,
    };

    return new URLSearchParams(omitBy(params, (val) => !val));
  };

  const buildPdfExternalUrlTempEditMode = ({ searchParams }) => {
    const searchQuery = queryString.parse(searchParams.toString());

    return queryString.stringifyUrl({
      url: [Routers.VIEWER_TEMP_EDIT_EXTERNAL_PDF].join('/'),
      query: searchQuery,
    });
  };
  const createExternalPdfInTempEditMode = () => {
    const searchParams = buildSearchParams({ formStaticPath, encodeData });
    const pdfExternalUrl = buildPdfExternalUrlTempEditMode({
      searchParams,
    });
    navigate(pdfExternalUrl, {
      replace: true,
    });
  };

  useEffect(() => {
    async function createAndOpenExternalPdf() {
      try {
        const res = await documentGraphServices.createPdfFromStaticToolUpload({
          encodeData,
          ...(orgId && { orgId }),
        });

        if (res.documentId) {
          const { documentId, documentName, documentSize, documentMimeType } = res;
          const searchParam = new URLSearchParams(
            omitBy(
              {
                [UrlSearchParam.ACTION]: action,
                [UrlSearchParam.FROM]: from,
              },
              isNil
            )
          );
          eventTracking(UserEventConstants.EventType.UPLOAD_DOCUMENT_SUCCESS_APP, {
            file_remote_id: documentId,
            file_name: documentName,
            file_size: documentSize,
            file_type: documentMimeType,
          });
          navigate(`/viewer/${documentId}?${searchParam.toString()}`, { replace: true });
        } else {
          navigate('/');
        }
      } catch (err) {
        logger.logError({
          reason: LOGGER.Service.EXTERNAL_PDF,
          error: err,
        });
        openErrorModal();
      }
    }

    if (currentUser && isNonRestrictedUser) {
      createAndOpenExternalPdf();
      return;
    }

    createExternalPdfInTempEditMode();
  }, [currentUser?.email]);

  if (!currentUser || isNonRestrictedUser) {
    return <Loading fullscreen />;
  }

  return <FailedToAccessDialog />;
}

export default CreateExternalPdf;
