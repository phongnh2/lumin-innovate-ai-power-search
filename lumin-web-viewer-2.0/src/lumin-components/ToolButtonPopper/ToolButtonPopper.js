/* eslint-disable react/require-default-props */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { css } from 'styled-components';

import { QUICK_SEARCH_POPOVER_OFFSET } from '@new-ui/components/LuminToolbar/components/ToolbarPopover';
import Popper from '@new-ui/general-components/Popper';

import DarkUnsupportedFyleTypeImage from 'assets/images/dark-unsupported-file-type.png';
import PermissionRequiredImage from 'assets/images/permission_required.svg';
import UnsupportedFileTypeImage from 'assets/images/unsupported-file-type.png';
import PremiumRequiredImage from 'assets/lumin-svgs/icon-three-stars.svg';

import { RequestPermissionText } from 'lumin-components/RequestAccessDocumentList/constants';
import RequestPermissionModal from 'lumin-components/RequestPermissionModal';

import { useTranslation } from 'hooks';
import { useGetRemoveButtonProStartTrial } from 'hooks/growthBook/useGetRemoveButtonProStartTrial';
import { useTrackingModalEvent } from 'hooks/useTrackingModalEvent';

import getToolPopper from 'helpers/getToolPopper';

import { eventTracking } from 'utils';

import { AppFeatures } from 'features/FeatureConfigs';
import { quickSearchSelectors } from 'features/QuickSearch/slices';

import UserEventConstants from 'constants/eventConstants';
import { FEATURE_VALIDATION, THEME_MODE } from 'constants/lumin-common';
import { Routers } from 'constants/Routers';
import { spacings } from 'constants/styles/editor';

import ToolPopperContent from './V2/ToolPopperContent';

const propTypes = {
  openPopper: PropTypes.bool,
  closePopper: PropTypes.func,
  children: PropTypes.node,
  toolName: PropTypes.string,
  currentUser: PropTypes.object,
  currentDocument: PropTypes.object,
  themeMode: PropTypes.oneOf(Object.values(THEME_MODE)),
  placement: PropTypes.string,
  renderContentOnly: PropTypes.bool,
  /**
   * fallback for empty string due to the old logic on `validator.validateFeature`
   */
  validateType: PropTypes.oneOf([...Object.values(FEATURE_VALIDATION), '']),
  eventName: PropTypes.string,
  featureName: PropTypes.oneOf([...Object.values(AppFeatures), '']),
  popperContainerWidth: PropTypes.number,
  customOffset: PropTypes.object,
};

const iconMapping = {
  [FEATURE_VALIDATION.PERMISSION_REQUIRED]: PermissionRequiredImage,
  [FEATURE_VALIDATION.LIMIT_FEATURE]: PermissionRequiredImage,
  [FEATURE_VALIDATION.SIGNIN_REQUIRED]: PermissionRequiredImage,
  [FEATURE_VALIDATION.PREMIUM_FEATURE]: PremiumRequiredImage,
  [FEATURE_VALIDATION.UNSUPPORTED_FILE_TYPE]: {
    light: UnsupportedFileTypeImage,
    dark: DarkUnsupportedFyleTypeImage,
  },
};

function ToolButtonPopper(props) {
  const {
    openPopper = false,
    children = null,
    closePopper = () => {},
    currentUser = null,
    toolName = '',
    currentDocument = {},
    placement = 'bottom',
    renderContentOnly = false,
    validateType = '',
    eventName = '',
    featureName = '',
    popperContainerWidth = undefined,
    customOffset = {},
  } = props;
  const [isOpen, setOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const buttonRef = React.useRef(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isRemoveButtonProStartTrial } = useGetRemoveButtonProStartTrial();
  const isOpenQuickSearch = useSelector(quickSearchSelectors.isOpenQuickSearch);

  const handleOnOpenModal = (type) => {
    setOpen(true);
    setModalType(type);
    eventTracking(UserEventConstants.EventType.REQUEST_DOCUMENT_PERMISSION, {
      permission: RequestPermissionText[type?.toLowerCase()],
    });
  };

  const { trackModalViewed, trackModalConfirmation, trackModalDismiss } = useTrackingModalEvent({
    modalName: eventName ? `${eventName}PopOver` : '',
    modalPurpose: 'Premium tool pop-over',
  });

  const handleButtonClick = (trackEventCallback, button) => () => {
    trackEventCallback();
    if (button.url) {
      return navigate(button.url);
    }
    if (button.callback) {
      closePopper();
      return button.callback();
    }
    closePopper();
  };

  useEffect(() => {
    openPopper && trackModalViewed();
  }, [openPopper]);

  const renderPopperContent = (document) => {
    if (!document) {
      return null;
    }

    const toolPopper = getToolPopper({
      toolName,
      currentUser,
      currentDocument: document,
      translator: t,
      featureName,
      isRemoveButtonProStartTrial,
    });
    if (!toolPopper.message || !toolPopper.title || isOpen) {
      return null;
    }

    const isModalFreeTrial = toolPopper.buttons[0]?.url?.includes(Routers.PAYMENT_FREE_TRIAL);
    let trackingFunction = trackModalConfirmation;
    if (isRemoveButtonProStartTrial) {
      trackingFunction = trackModalDismiss;
      if (!isModalFreeTrial) {
        trackingFunction = trackModalConfirmation;
      }
    }

    return (
      <div
        css={css(
          !renderContentOnly && {
            padding: spacings.le_gap_2,
            maxWidth: 'var(--sizing-dialogs-xs)',
            width: 'var(--sizing-dialogs-xs)',
          }
        )}
      >
        <ToolPopperContent
          toolPopper={toolPopper}
          onPrimaryClick={handleButtonClick(trackingFunction, toolPopper.buttons[0])}
          onSecondaryClick={handleButtonClick(trackModalDismiss, toolPopper.buttons[1])}
          handleOnOpenModal={handleOnOpenModal}
          icon={iconMapping[validateType]}
          closePopper={closePopper}
          largeTitle={renderContentOnly}
        />
      </div>
    );
  };

  const handleClose = (e) => {
    if (buttonRef.current.contains(e.target)) return;
    closePopper();
  };

  const childrenWithProps = () =>
    React.Children.map(children, (child) =>
      React.cloneElement(child, {
        open: openPopper,
        className: classNames(child.props.className, { active: openPopper }),
      })
    );

  const getPopperOffset = ({ enabled, offset }) => ({ enabled, options: { offset } });

  const otherProps = {
    disablePortal: true,
    onClose: handleClose,
    paperProps: { rounded: 'large' },
    placement,
    modifiers: [
      {
        name: 'preventOverflow',
        enabled: !isOpenQuickSearch,
        options: {
          altAxis: true,
          altBoundary: true,
          tether: true,
          rootBoundary: 'document',
          padding: 8,
        },
      },
      {
        name: 'eventListeners',
        enabled: isOpenQuickSearch,
        options: {
          scroll: false,
        },
      },
      {
        name: 'offset',
        ...getPopperOffset({ enabled: customOffset, offset: [customOffset?.x, customOffset?.y] }),
        ...getPopperOffset({ enabled: isOpenQuickSearch, offset: [0, QUICK_SEARCH_POPOVER_OFFSET] }),
      },
    ],
  };

  // NOTE: for Modal in nav bar
  if (renderContentOnly && currentDocument) {
    return (
      <>
        {renderPopperContent(currentDocument)}
        {isOpen && (
          <RequestPermissionModal
            onClose={() => setOpen(false)}
            modalType={modalType}
            documentId={currentDocument._id}
          />
        )}
      </>
    );
  }
  return (
    <>
      <span ref={buttonRef}>{childrenWithProps()}</span>
      <Popper
        open={openPopper}
        anchorEl={buttonRef.current}
        style={{ ...(popperContainerWidth && { width: popperContainerWidth }) }}
        {...otherProps}
      >
        {currentDocument && renderPopperContent(currentDocument)}
      </Popper>
      {isOpen && (
        <RequestPermissionModal onClose={() => setOpen(false)} modalType={modalType} documentId={currentDocument._id} />
      )}
    </>
  );
}

ToolButtonPopper.propTypes = propTypes;

export default ToolButtonPopper;
