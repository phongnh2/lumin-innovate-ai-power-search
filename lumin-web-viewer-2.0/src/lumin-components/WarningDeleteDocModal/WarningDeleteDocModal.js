import { Modal, Checkbox as KiwiCheckbox } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useState, useContext, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { batch, connect } from 'react-redux';
import { compose } from 'redux';

import selectors from 'selectors';

import { DocumentContext } from 'lumin-components/Document/context';
import ModalFooter from 'lumin-components/ModalFooter';
import Dialog from 'luminComponents/Dialog';
import SvgElement from 'luminComponents/SvgElement';

import { systemFileHandler } from 'HOC/OfflineStorageHOC';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { documentServices } from 'services';

import logger from 'helpers/logger';

import { string, toastUtils } from 'utils';

import { DOCUMENT_TYPE } from 'constants/documentConstants';
import { CHECKBOX_TYPE, STORAGE_TYPE, THIRD_PARTY_DOCUMENT_SERVICES } from 'constants/lumin-common';
import { MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION } from 'constants/organizationConstants';
import { ModalSize } from 'constants/styles/Modal';

import {
  StyledFormControlLabel,
  StyledDialogContent,
  StyledTitle,
  StyledDesc,
  StyledMainIcon,
  StyledCheckbox,
  StyledFooter,
} from './WarningDeleteDocModal.styled';

const propTypes = {
  currentUser: PropTypes.object.isRequired,
  document: PropTypes.object,
  organizationList: PropTypes.object.isRequired,
  teams: PropTypes.array,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
};
const defaultProps = {
  onCancel: () => {},
  onConfirm: () => {},
  teams: [],
  document: {},
};

const KEY_CANCEL = 'common.cancel';

const BoldStyle = { color: 'var(--kiwi-colors-surface-on-surface)', fontWeight: 700 };

const KEY_REMOVE = 'common.remove';

const getSharedDocument = (t) => ({
  title: t('modalDeleteDoc.removeDocument'),
  getDesc: (name, isEnableReskin) => (
    <Trans
      i18nKey="modalDeleteDoc.removeDocumentDesc"
      values={{ name: string.getShortStringWithLimit(name, 25) }}
      components={{ b: <b style={isEnableReskin ? BoldStyle : {}} /> }}
    />
  ),
  cancel: t(KEY_CANCEL),
  confirm: t(KEY_REMOVE),
});

const getNonSharedDocument = (t, isThirdPartyDocument = false) => ({
  title: isThirdPartyDocument ? t('modalDeleteDoc.removeDocument') : t('modalDeleteDoc.deleteDocument'),
  getDesc: (name, isEnableReskin) => (
    <Trans
      i18nKey={
        isThirdPartyDocument ? 'modalDeleteDoc.removeThirdPartyDocumentDesc' : 'modalDeleteDoc.deleteDocumentDesc'
      }
      values={{ name: string.getShortStringWithLimit(name, 38) }}
      components={{ b: <b style={isEnableReskin ? BoldStyle : {}} /> }}
    />
  ),
  cancel: t(KEY_CANCEL),
  confirm: isThirdPartyDocument ? t(KEY_REMOVE) : t('common.delete'),
});

const getSystemDocument = (t) => ({
  title: t('modalDeleteDoc.removeFile'),
  getDesc: (name, isEnableReskin) => (
    <Trans i18nKey="modalDeleteDoc.removeSystemDocumentDesc">
      <b style={isEnableReskin ? BoldStyle : {}}>{{ name: string.getShortStringWithLimit(name, 38) }}</b>
      file will be removed from your Lumin view. This action cannot be undone.
    </Trans>
  ),
  cancel: t(KEY_CANCEL),
  confirm: t(KEY_REMOVE),
});

const WarningDeleteDocModal = ({
  currentUser,
  document,
  teams,
  organizationList,
  onConfirm,
  onCancel,
}) => {
  const { isEnableReskin } = useEnableWebReskin();
  const { t } = useTranslation();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSharedDocument, setIsSharedDocument] = useState(false);
  const sharedDocument = getSharedDocument(t);
  const nonSharedDocument = getNonSharedDocument(t, THIRD_PARTY_DOCUMENT_SERVICES.includes(document.service));
  const systemDocument = getSystemDocument(t);

  const {
    setRemoveDocList,
    setIsDeleting = () => { },
  } = useContext(DocumentContext);

  const onChange = (e) => {
    const { checked: isChecked } = e.target;
    setChecked(isChecked);
  };

  const onConfirmClick = async () => {
    setLoading(true);
    setIsDeleting(true);
    if (document.service === STORAGE_TYPE.SYSTEM) {
      await systemFileHandler.delete(document);
      batch(() => {
        onConfirm();
        setRemoveDocList({ type: CHECKBOX_TYPE.DELETE });
        setIsDeleting(false);
      });
      toastUtils.success({
        message: t('modalDeleteDoc.removeDocumentSuccessfully'),
      });
    } else {
      const notify = checked;
      try {
        await documentServices.onConfirmDelete({ document, notify, isSharedDocument, t });
        batch(() => {
          onConfirm(notify);
          setRemoveDocList({ type: CHECKBOX_TYPE.DELETE });
          setIsDeleting(false);
        });
      } catch (err) {
        logger.logError({ error: err });
      }
    }
  };
  const getModalContent = () => {
    if (document.service === STORAGE_TYPE.SYSTEM) {
      return systemDocument;
    }
    switch (document.documentType) {
      case DOCUMENT_TYPE.PERSONAL: {
        const isDocumentOwner = document.ownerId === currentUser._id;
        !isDocumentOwner && setIsSharedDocument(true);
        return isDocumentOwner ? nonSharedDocument : sharedDocument;
      }
      case DOCUMENT_TYPE.ORGANIZATION_TEAM: {
        const foundTeam = teams.find((team) => team._id === document.clientId);
        !foundTeam && setIsSharedDocument(true);
        return foundTeam ? nonSharedDocument : sharedDocument;
      }
      case DOCUMENT_TYPE.ORGANIZATION: {
        const foundOrg = (organizationList?.data || []).find((org) => org?.organization?._id === document.clientId);
        if (foundOrg) {
          const { organization } = foundOrg;
          const isOverSizeLimitForNoti = organization.totalActiveMember > MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION;

          return {
            ...nonSharedDocument,
            checkbox: isOverSizeLimitForNoti
              ? t('modalDeleteDoc.notifyAdminThisAction')
              : t('modalDeleteDoc.notifyEveryoneThisAction'),
          };
        }
        !foundOrg && setIsSharedDocument(true);
        return sharedDocument;
      }
      default:
        throw new Error(`Document type "${document.documentType}" is invalid`);
    }
  };

  const modalContent = useMemo(getModalContent, [document, organizationList, teams, currentUser]);

  if (!document) {
    return null;
  }

  if (isEnableReskin) {
    return (
      <Modal
        centered
        opened
        onCancel={onCancel}
        onConfirm={onConfirmClick}
        onClose={onCancel}
        confirmButtonProps={{ title: modalContent.confirm, loading }}
        cancelButtonProps={{ title: t('common.cancel'), disabled: loading }}
        title={modalContent.title}
        isProcessing={loading}
        type="warning"
        message={modalContent.getDesc(document.name, true)}
        closeOnClickOutside={!loading}
        closeOnEscape={!loading}
      >
        {modalContent.checkbox && <KiwiCheckbox label={modalContent.checkbox} checked={checked} onChange={onChange} />}
      </Modal>
    );
  }

  return (
    <Dialog
      open
      onClose={onCancel}
      disableBackdropClick={loading}
      disableEscapeKeyDown={loading}
      width={ModalSize.SM}
    >
      <StyledDialogContent>
        <StyledMainIcon>
          <SvgElement
            content="icon-warning"
            alt="Warning"
            width={48}
            height={48}
          />
        </StyledMainIcon>

        <StyledTitle>{modalContent.title}</StyledTitle>
        <StyledDesc>{modalContent.getDesc(document.name, false)}</StyledDesc>

        {modalContent.checkbox && (
          <StyledFormControlLabel
            checked={checked}
            control={<StyledCheckbox
              type="checkbox"
            />}
            onChange={onChange}
            label={modalContent.checkbox}
          />
        )}

        <StyledFooter $hasMargin={!modalContent.checkbox}>
          <ModalFooter
            disabledCancel={loading}
            onCancel={onCancel}
            label={modalContent.confirm}
            loading={loading}
            onSubmit={onConfirmClick}
            smallGap
          />
        </StyledFooter>
      </StyledDialogContent>
    </Dialog>
  );
};

WarningDeleteDocModal.propTypes = propTypes;
WarningDeleteDocModal.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  organizationList: selectors.getOrganizationList(state),
  teams: selectors.getTeams(state),
});

export default compose(connect(mapStateToProps))(WarningDeleteDocModal);
