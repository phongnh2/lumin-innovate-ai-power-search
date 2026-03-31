import PropTypes from 'prop-types';
import React from 'react';

import Icomoon from 'lumin-components/Icomoon';

import { useThemeMode, useTranslation } from 'hooks';
import { useViewerMatch } from 'hooks/useViewerMatch';

import { THEME_MODE } from 'constants/lumin-common';
import { Colors } from 'constants/styles';

import HelpCenterPopper from './HelpCenterPopper';
import * as Styled from '../NavigationBar.styled';

const ButtonHelpCenter = ({ disabled, isViewer }) => {
  const { t } = useTranslation();
  const themeMode = useThemeMode();
  const { isViewer: isNewLayout } = useViewerMatch();
  const renderPopperContent = ({ closePopper }) => <HelpCenterPopper closePopper={closePopper} />;

  return (
    <Styled.HelpCenterButton
      $isNewLayoutButton={isNewLayout}
      renderPopperContent={renderPopperContent}
      popperProps={{ placement: 'bottom', scrollWillClosePopper: true }}
      disabled={disabled}
      tooltip={{
        title: t('common.helpCenter'),
        closeOnFocus: true,
      }}
      $isViewer={isViewer}
    >
      <Icomoon
        className="question"
        size={20}
        color={themeMode === THEME_MODE.LIGHT ? Colors.NEUTRAL_60 : Colors.NEUTRAL_40}
      />
    </Styled.HelpCenterButton>
  );
};

ButtonHelpCenter.propTypes = {
  disabled: PropTypes.bool,
  isViewer: PropTypes.bool,
};
ButtonHelpCenter.defaultProps = {
  disabled: false,
  isViewer: false,
};

export default ButtonHelpCenter;
