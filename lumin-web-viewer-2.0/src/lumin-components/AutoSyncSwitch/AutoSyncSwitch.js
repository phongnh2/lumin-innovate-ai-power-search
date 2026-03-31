import get from 'lodash/get';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from 'react';

import MenuItem from 'luminComponents/Shared/MenuItem';
import Switch from 'luminComponents/Shared/Switch';
import Tooltip from 'luminComponents/Shared/Tooltip';
import StatusPopper from 'luminComponents/StatusPopper';
import SvgElement from 'luminComponents/SvgElement';

import { useTranslation } from 'hooks';

import { userServices } from 'services';

import { isAutoSync, toggleAutoSync as toggleAutoSyncHelper, isFormerUserHasDefaultAutoSync } from 'helpers/autoSync';
import { isSmallDesktop } from 'helpers/device';

import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { HUBSPOT_CONTACT_PROPERTIES } from 'constants/hubspotContactProperties';
import { LocalStorageKey } from 'constants/localStorageKey';
import { USER_METADATA_KEY } from 'constants/userConstants';
import './AutoSyncSwitch.scss';

const TOGGLE_TIME_OUT = 5000;

const AutoSyncSwitch = (props) => {
  const { t } = useTranslation();
  const { currentDocument, setCurrentDocument, isPreventUserAction, currentUser } = props;
  const [isHidden, setIsHidden] = useState(true);
  const [isToggleDisabled, setToggleDisabled] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [anchorRef, setRef] = useState(null);
  const { enableGoogleSync, _id: documentId } = currentDocument;
  const hasShownAutoSyncDefault = get(currentUser, 'metadata.hasShownAutoSyncDefault', true);
  const toggleTimeout = useRef();

  const getLuminDataAttributes = () => {
    const autoSyncStatusKey = enableGoogleSync
      ? LocalStorageKey.ENABLED_AUTO_SYNC_DOCUMENTS
      : LocalStorageKey.DISABLED_AUTO_SYNC_DOCUMENTS;
    const autoSyncDocuments = JSON.parse(localStorage.getItem(autoSyncStatusKey)) || {};
    if (!autoSyncDocuments[documentId]) {
      const btnName = !enableGoogleSync ? ButtonName.TURN_ON_AUTO_SYNC : ButtonName.TURN_OFF_AUTO_SYNC;
      return {
        'data-lumin-btn-name': btnName,
        'data-lumin-btn-purpose': ButtonPurpose[btnName],
      };
    }
    return {};
  };

  useEffect(() => {
    if (isAutoSync(currentDocument)) {
      setIsHidden(false);
    }
    return () => {
      clearTimeout(toggleTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (isPreventUserAction) {
      return;
    }
    setToggleDisabled(true);
    toggleTimeout.current = setTimeout(() => {
      setToggleDisabled(false);
      setShowPopover(!hasShownAutoSyncDefault);
    }, TOGGLE_TIME_OUT);
  }, [isPreventUserAction]);

  const toggleAutoSync = (enableGoogleSync) => {
    toggleAutoSyncHelper(documentId, enableGoogleSync);
    setCurrentDocument({ ...currentDocument, enableGoogleSync });
    const autoSyncStatusKey = enableGoogleSync
      ? LocalStorageKey.ENABLED_AUTO_SYNC_DOCUMENTS
      : LocalStorageKey.DISABLED_AUTO_SYNC_DOCUMENTS;
    const autoSyncDocuments = JSON.parse(localStorage.getItem(autoSyncStatusKey)) || {};
    if (!autoSyncDocuments[documentId]) {
      autoSyncDocuments[documentId] = true;
      localStorage.setItem(autoSyncStatusKey, JSON.stringify(autoSyncDocuments));
      if (enableGoogleSync) {
        userServices.saveHubspotProperties({ key: HUBSPOT_CONTACT_PROPERTIES.SYNC_DOCUMENT, value: 'true' });
      }
    }
  };

  const renderSwitch = () => (
    <Tooltip title={t('viewer.autoSyncToolTip')} tooltipStyle={{ maxWidth: 500 }}>
      <div className="HeaderLumin__auto-sync--wrapper">
        <span className="HeaderLumin__auto-sync--label">
          <SvgElement content="google" width={22} height={20} className="GoogleLogo" />
          Auto Sync
        </span>
        <Switch
          className="AutoSyncSwitch"
          checked={enableGoogleSync}
          disabled={isToggleDisabled}
          onChange={(e) => toggleAutoSync(e.target.checked)}
          {...getLuminDataAttributes()}
          ref={setRef}
        />
      </div>
    </Tooltip>
  );

  const closePopover = () => {
    setShowPopover(false);
    userServices.updateUserMetadata({ key: USER_METADATA_KEY.HAS_SHOWN_AUTO_SYNC_DEFAULT, value: true });
  };

  const renderDefaultSwitch = () => {
    if (!hasShownAutoSyncDefault && isFormerUserHasDefaultAutoSync(currentUser)) {
      return (
        <>
          {renderSwitch()}
          <StatusPopper
            showPopover={showPopover}
            anchorRef={anchorRef}
            onClose={closePopover}
            content={{
              title: t('viewer.defaultAutoSyncTitle'),
              desc: t('viewer.defaultAutoSyncDesc'),
            }}
            placement="bottom-end"
          />
        </>
      );
    }
    return renderSwitch();
  };

  const renderSwitchInDesktop = () => (
    <>
      <div className="divider" />
      {renderDefaultSwitch()}
      <div className="divider" />
    </>
  );

  const renderSwitchInTablet = () => (
    <MenuItem
      className="view-more__popper view-more__popper--menu-item"
      onClick={() => toggleAutoSync(!enableGoogleSync)}
    >
      {renderDefaultSwitch()}
    </MenuItem>
  );

  const renderAutoSyncSwitch = () => {
    if (!isHidden) {
      return isSmallDesktop() ? renderSwitchInDesktop() : renderSwitchInTablet();
    }
    return null;
  };

  return renderAutoSyncSwitch();
};

AutoSyncSwitch.propTypes = {
  currentUser: PropTypes.object.isRequired,
  currentDocument: PropTypes.object.isRequired,
  setCurrentDocument: PropTypes.func.isRequired,
  isPreventUserAction: PropTypes.bool,
};

AutoSyncSwitch.defaultProps = {
  isPreventUserAction: true,
};

export default AutoSyncSwitch;
