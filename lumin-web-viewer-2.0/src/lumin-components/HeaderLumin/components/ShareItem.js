import { enqueueSnackbar, Icomoon, MenuItem, PlainTooltip } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import { executeCopyText } from 'luminComponents/RightSideBarContent/utils';

import { useIntegrate } from 'hooks/useIntegrate';
import { useTranslation } from 'hooks/useTranslation';

import { eventTracking } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import getShareLink from 'utils/getShareLink';

import UserEventConstants from 'constants/eventConstants';
import { INTEGRATE_BUTTON_NAME } from 'constants/luminSign';

const propTypes = {
  currentUser: PropTypes.object,
  isOffline: PropTypes.bool,
  document: PropTypes.object,
  withSharePermission: PropTypes.func,
  open: PropTypes.bool,
};

const ShareItem = (props) => {
  const { currentUser = {}, document = {}, open } = props;
  const { capabilities } = document;
  const { canSendForSignatures } = capabilities || {};
  const { t } = useTranslation();
  const { onClickedIntegrate, handleEvent } = useIntegrate();

  useEffect(() => {
    if (open) {
      handleEvent(INTEGRATE_BUTTON_NAME.VIEW_SEND_FOR_SIGNATURES);
    }
  }, [open]);

  const onClickIntegrate = (event) => {
    handleEvent(INTEGRATE_BUTTON_NAME.SEND_FOR_SIGNATURES);
    onClickedIntegrate({
      currentUser,
      currentDocument: document,
    })(event);
  };

  const onCopyShareLink = () => {
    eventTracking(UserEventConstants.EventType.CLICK, {
      elementName: ButtonName.COPY_LINK,
    }).catch(() => {});
    executeCopyText(getShareLink(document._id));
    enqueueSnackbar({
      message: t('modalShare.hasBeenCopied'),
      variant: 'success',
    });
  };

  const items = [
    {
      title: 'modalShare.copyLink',
      type: 'link-lg',
      action: onCopyShareLink,
    },
    {
      title: 'viewer.bananaSign.sendForSignatures',
      type: 'send-lg',
      action: onClickIntegrate,
      disabled: !canSendForSignatures,
      ...(!canSendForSignatures && { tooltipContent: t('shareSettings.permissionDenied') }),
    },
  ];

  const getMenuItemProps = (item) => ({ type: item.type });

  const renderMenuItemComponent = (item) => (
    <PlainTooltip content={item.tooltipContent}>
      <MenuItem
        leftSection={<Icomoon size="lg" {...getMenuItemProps(item)} />}
        onClick={item.action}
        key={item.title}
        disabled={item.disabled}
      >
        {t(item.title)}
      </MenuItem>
    </PlainTooltip>
  );

  return <>{items.map(renderMenuItemComponent)}</>;
};

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  isOffline: selectors.isOffline(state),
  document: selectors.getCurrentDocument(state),
});

ShareItem.propTypes = propTypes;

export default connect(mapStateToProps)(ShareItem);
