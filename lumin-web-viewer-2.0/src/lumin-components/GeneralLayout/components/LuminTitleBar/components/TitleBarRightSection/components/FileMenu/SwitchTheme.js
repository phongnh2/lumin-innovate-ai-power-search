import { MenuItem, Badge } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import Icomoon from 'luminComponents/Icomoon';

import { useTranslation } from 'hooks/useTranslation';

import { eventTracking } from 'utils/recordUtil';

import UserEventConstants from 'constants/eventConstants';
import { THEME_MODE } from 'constants/lumin-common';

import { SwitchThemeWrapper } from './FileMenu.styled';

const SwitchTheme = ({ setThemeMode, themeMode }) => {
  const isLightMode = useMemo(() => themeMode === THEME_MODE.LIGHT, [themeMode]);
  const { t } = useTranslation();

  const _handleThemeButtonClick = () => {
    setThemeMode(isLightMode ? THEME_MODE.DARK : THEME_MODE.LIGHT);
    eventTracking(UserEventConstants.EventType.CLICK, {
      elementName: UserEventConstants.Events.HeaderButtonsEvent.DARK_MODE,
    });
  };

  return (
    <MenuItem
      leftSection={<Icomoon className={isLightMode ? 'md_darkmode' : 'md_lightmode'} size={24} />}
      onClick={_handleThemeButtonClick}
    >
      <SwitchThemeWrapper>
        {t(isLightMode ? 'common.darkMode' : 'common.lightMode')}
        {isLightMode && (
          <Badge size="sm" variant="blue">
            BETA
          </Badge>
        )}
      </SwitchThemeWrapper>
    </MenuItem>
  );
};

SwitchTheme.propTypes = {
  setThemeMode: PropTypes.func.isRequired,
  themeMode: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  themeMode: selectors.getThemeMode(state),
});

const mapDispatchToProps = (dispatch) => ({
  setThemeMode: (themeMode) => dispatch(actions.setThemeMode(themeMode)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SwitchTheme);
