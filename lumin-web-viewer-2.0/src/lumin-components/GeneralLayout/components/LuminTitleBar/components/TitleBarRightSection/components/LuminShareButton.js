import get from 'lodash/get';
import { Button, PlainTooltip } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import Icomoon from 'luminComponents/Icomoon';
import { RequestType } from 'luminComponents/RequestPermissionModal/requestType.enum';

import { useDocumentPermission } from 'hooks/useDocumentPermission';
import useDocumentTools from 'hooks/useDocumentTools';
import { useRequestPermissionChecker } from 'hooks/useRequestPermissionChecker';
import { useTranslation } from 'hooks/useTranslation';

import { isValidDocumentToSign } from 'helpers/validDocument';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { useTemplateViewerMatch } from 'features/Document/hooks/useTemplateViewerMatch';

import { SHARE_TYPE } from 'constants/customConstant';

import ShareButton from './ShareButton';
import { getCurrentShareSetting } from './utils';
import * as Styled from '../TitleBarRightSection.styled';

const LuminShareButton = (props) => {
  const { isOffline, currentDocument, currentUser } = props;
  const { t } = useTranslation();
  const { canShare } = useDocumentPermission(currentDocument);
  const { handleShareDocument } = useDocumentTools();
  const { requestAccessModalElement, openRequestAccessModal } = useRequestPermissionChecker({
    permissionRequest: RequestType.SHARER,
  });
  const { isTemplateViewer } = useTemplateViewerMatch();

  const shareTitle = t('common.share');

  const getShareInfo = () => {
    const sharedCount = get(currentDocument, 'sharedPermissionInfo.total', 0);

    switch (getCurrentShareSetting(currentDocument, sharedCount)) {
      case SHARE_TYPE.PUBLIC:
        return {
          icon: 'md_global',
          tooltip: <Trans i18nKey="viewer.shareButton.public" components={{ br: <br /> }} />,
        };
      case SHARE_TYPE.ORGANIZATION:
        return {
          icon: 'md_circle-1',
          tooltip: (
            <Trans
              i18nKey="viewer.shareButton.shareToCircle"
              values={{ circleName: currentDocument.sharedPermissionInfo?.organizationName }}
              components={{ br: <br /> }}
            />
          ),
        };
      case SHARE_TYPE.ORGANIZATION_TEAM:
        return {
          icon: 'md_circle-1',
          tooltip: (
            <Trans
              i18nKey="viewer.shareButton.shareToTeam"
              values={{ teamName: currentDocument.sharedPermissionInfo?.teamName }}
              components={{ br: <br /> }}
            />
          ),
        };
      case SHARE_TYPE.SPECIFIC_USER:
        return {
          icon: 'md_users',
          tooltip: (
            <Trans
              i18nKey="viewer.shareButton.shareToUser"
              values={{
                number: sharedCount,
                individual: `${sharedCount > 1 ? t('viewer.shareButton.people') : t('viewer.shareButton.person')}`,
              }}
              components={{ br: <br /> }}
            />
          ),
        };
      default:
        return { icon: 'md_not_shared', tooltip: t('viewer.shareButton.private') };
    }
  };

  if (currentDocument.isSystemFile || isTemplateViewer || !currentUser) {
    return null;
  }

  if (isValidDocumentToSign(currentUser, currentDocument)) {
    return (
      <ShareButton
        tooltip={{
          title: getShareInfo().tooltip,
        }}
        icon={getShareInfo().icon}
        shareTitle={shareTitle}
        isOffline={isOffline}
      />
    );
  }

  if (canShare) {
    return (
      <PlainTooltip content={getShareInfo().tooltip}>
        <Button
          onClick={handleShareDocument}
          data-lumin-btn-name={ButtonName.MODAL_SHARE_DOCUMENT_OPEN}
          disabled={isOffline}
          startIcon={<Icomoon className={getShareInfo().icon} />}
          size="lg"
          variant="tonal"
        >
          {shareTitle}
        </Button>
      </PlainTooltip>
    );
  }

  return (
    <>
      <Styled.ShareToolTip content={getShareInfo().tooltip}>
        <Button
          data-lumin-btn-name={ButtonName.MODAL_SHARE_DOCUMENT_OPEN}
          disabled={isOffline}
          startIcon={<Icomoon className={getShareInfo().icon} />}
          size="lg"
          variant="tonal"
          onClick={openRequestAccessModal}
        >
          {shareTitle}
        </Button>
      </Styled.ShareToolTip>
      {requestAccessModalElement}
    </>
  );
};

const mapStateToProps = (state) => ({
  isOffline: selectors.isOffline(state),
  currentDocument: selectors.getCurrentDocument(state),
  currentUser: selectors.getCurrentUser(state),
});

const mapDispatchToProps = (dispatch) => ({
  setUploadDocVisible: (data) => dispatch(actions.setUploadDocVisible(data)),
});

LuminShareButton.propTypes = {
  isOffline: PropTypes.bool,
  currentDocument: PropTypes.object,
  currentUser: PropTypes.object,
};

LuminShareButton.defaultProps = {
  isOffline: false,
  currentDocument: {},
  currentUser: {},
};

export default connect(mapStateToProps, mapDispatchToProps)(LuminShareButton);
