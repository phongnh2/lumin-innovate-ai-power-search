import Dialog from '@mui/material/Dialog';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import Axios from '@libs/axios';

import selectors from 'selectors';

import SignLoading from 'luminComponents/SignLoading';

import useGetOwnCurrentDoc from 'hooks/useGetOwnCurrentDoc';

import { documentServices } from 'services';

import logger from 'helpers/logger';

import { makeCancelable } from 'utils/makeCancelable';

import { documentStorage } from 'constants/documentConstants';
import { LOGGER } from 'constants/lumin-common';
import { ORG_TEXT } from 'constants/organizationConstants';
import { Colors } from 'constants/styles';
import { BANANA_SIGN_WEB_URL } from 'constants/urls';

import { inputContractType } from './constant';
import RedirectSignModal from './RedirectSignModal';

import './SignerViewerModal.scss';

const propTypes = {
  handleClose: PropTypes.func,
  open: PropTypes.bool,
};

const defaultProps = {
  handleClose: () => {},
  open: false,
};

const CLOSE_TASK_BANANA_SIGN_MSG = 'close_task';

const DOCUMENT_TYPES = {
  [documentStorage.s3]: 'LOCAL',
  [documentStorage.google]: 'GOOGLE',
  [documentStorage.dropbox]: 'DROPBOX',
  [documentStorage.onedrive]: 'ONEDRIVE',
};

const SignerViewerModal = ({ open, handleClose }) => {
  const [currentUser, currentDocument] = useSelector(
    (state) => [selectors.getCurrentUser(state), selectors.getCurrentDocument(state)],
    shallowEqual
  );
  const { organization: orgOwnCurrentDocument } = useGetOwnCurrentDoc();
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [isBananasignLoading, setBananasignLoading] = useState(false);
  const [identify, setIdentify] = useState('');

  const sendData = async ({ integrateRemoteId }) => {
    try {
      const data = {
        contractInfo: {
          signerList: [],
          viewerList: [],
          inputContract: {
            name: currentDocument.name,
            dueTimeExpired: 0,
            type: inputContractType.MEANDOTHERS,
            formBuilderType: 'KEEP_DATA',
          },
          type: DOCUMENT_TYPES[currentDocument.service],
          remoteId: integrateRemoteId,
          thumbnail: currentDocument.thumbnailRemoteId,
          userId: currentUser._id,
        },
      };
      const res = await Axios.axiosInstance.post('/auth/contract-temporary', data);
      if (res?.data.identify) {
        setIdentify(res.data.identify);
        setBananasignLoading(true);
      }
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.NETWORK_ERROR,
        error,
      });
    }
  };

  const listenToBananaSign = (e) => {
    const fromLuminSignOrigin = e.origin === BANANA_SIGN_WEB_URL;
    const isCloseTask = e.data.type === CLOSE_TASK_BANANA_SIGN_MSG;
    if (fromLuminSignOrigin && isCloseTask) {
      handleClose();
    }
  };

  useEffect(() => {
    const { promise, cancel } = makeCancelable(() => documentServices.uploadFileToBananaSign(currentDocument));

    const submitDataToSign = async () => {
      try {
        const integrateRemoteId = await promise();
        if (integrateRemoteId) {
          await sendData({ integrateRemoteId });
          setIsRedirecting(false);
        }
      } catch (err) {
        logger.logError({
          reason: LOGGER.Service.NETWORK_ERROR,
          error: err,
        });
        handleClose();
      }
    };

    submitDataToSign();

    window.addEventListener('message', listenToBananaSign, false);

    return () => {
      window.removeEventListener('message', listenToBananaSign);
      cancel();
    };
  }, []);

  const renderIframe = () => {
    if (isRedirecting || !identify) {
      return null;
    }

    let src = orgOwnCurrentDocument
      ? `${BANANA_SIGN_WEB_URL}/${ORG_TEXT}/${orgOwnCurrentDocument.url}/embed/${identify}`
      : `${BANANA_SIGN_WEB_URL}/embed/${identify}`;

    // add params to src for detecting the place where the agreement is from
    const params = window.location.search;
    if (params) {
      src += params;
    }

    return (
      <iframe
        width="100%"
        height="100%"
        src={src}
        title="Iframe Upload"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        id="bananaSignIframe"
        onLoad={() => {
          document.getElementById('bananaSignIframe').style.visibility = 'visible';
          setBananasignLoading(false);
        }}
        style={{ visibility: 'hidden' }}
        allowFullScreen
      />
    );
  };

  return (
    <Dialog
      className={classNames({ SignerViewerModal: isRedirecting }, 'sign-modal')}
      fullScreen={!isRedirecting}
      open={open}
      disableEscapeKeyDown
      BackdropProps={{ style: { backgroundColor: Colors.DOCUMENT_OVERLAY } }}
      maxWidth={false}
      disableEnforceFocus
    >
      <SignLoading loading={isBananasignLoading} />
      {isRedirecting && <RedirectSignModal />}
      {renderIframe()}
    </Dialog>
  );
};

SignerViewerModal.propTypes = propTypes;
SignerViewerModal.defaultProps = defaultProps;
export default SignerViewerModal;
