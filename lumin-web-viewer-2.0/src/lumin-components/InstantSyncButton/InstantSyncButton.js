import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import LuminButton from 'luminComponents/LuminButton';
import SvgElement from 'luminComponents/SvgElement';
import CircularLoading from 'luminComponents/CircularLoading';
import { STORAGE_TYPE, THEME_MODE } from 'constants/lumin-common';
import { eventTracking } from 'utils';
import UserEventConstants from 'constants/eventConstants';
import { HUBSPOT_CONTACT_PROPERTIES } from 'constants/hubspotContactProperties';
import { userServices } from 'services';
import { useTranslation } from 'hooks';
import './InstantSyncButton.scss';

const propTypes = {
  syncToStorage: PropTypes.func,
  typeOfStorage: PropTypes.string,
  themeMode: PropTypes.oneOf(Object.values(THEME_MODE)),
};
const defaultProps = {
  syncToStorage: () => {},
  typeOfStorage: '',
  themeMode: 'light',
};

const LOGO_INSTANT_SYNC_DROPBOX_LIGHT = 'dropbox-instantSync-small-light';
const LOGO_INSTANT_SYNC_DROPBOX_DARK = 'dropbox-instantSync-small-dark';

function InstantSyncButton(props) {
  const { syncToStorage, typeOfStorage, themeMode } = props;
  const [isLoading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleInstantSync = async () => {
    setLoading(true);
    await syncToStorage();
    setLoading(false);
    eventTracking(UserEventConstants.EventType.INSTANT_SYNC_CLICK, { source: typeOfStorage });
    userServices.saveHubspotProperties({ key: HUBSPOT_CONTACT_PROPERTIES.SYNC_DOCUMENT, value: 'true' });
  };

  const renderStorageDropboxLogo = () => ({
    [THEME_MODE.LIGHT]: LOGO_INSTANT_SYNC_DROPBOX_LIGHT,
    [THEME_MODE.DARK]: LOGO_INSTANT_SYNC_DROPBOX_DARK,
  }[themeMode]);

  const svgContent = typeOfStorage === STORAGE_TYPE.GOOGLE ? 'google-instantSync' : renderStorageDropboxLogo();

  const buttonContentMarkup = isLoading ? (
    <div className="InstantSyncButton__btn-content">
      {t('viewer.header.syncing')}
      <CircularLoading color="inherit" size={14} />
    </div>
  ) : (
    <div className="InstantSyncButton__btn-content">
      <SvgElement
        content={svgContent}
        width={16}
        height={16}
      />
      {t('viewer.header.sync')}
    </div>
  );

  return (
    <LuminButton
      aria-label="Sync"
      small
      fontSecondary
      className={`InstantSyncButton ${
        isLoading
          ? 'InstantSyncButton__sync-btn-loading'
          : 'InstantSyncButton__sync-btn'
      }`}
      disabled={isLoading}
      onClick={handleInstantSync}
    >
      {buttonContentMarkup}
    </LuminButton>
  );
}

InstantSyncButton.propTypes = propTypes;
InstantSyncButton.defaultProps = defaultProps;

export default memo(InstantSyncButton);
