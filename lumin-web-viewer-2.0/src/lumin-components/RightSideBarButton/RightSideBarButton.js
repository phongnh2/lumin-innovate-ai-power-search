import PropTypes from 'prop-types';
import React from 'react';
import { ThemeProvider } from 'styled-components';

import Tooltip from 'lumin-components/Shared/Tooltip';

import { useTranslation } from 'hooks';
import { useThemeMode } from 'hooks/useThemeMode';

import * as Styled from './RightSideBarButton.styled';

RightSideBarButton.propTypes = {
  isOpen: PropTypes.bool,
  showingAnimation: PropTypes.string,
  handleVisibility: PropTypes.func,
};

RightSideBarButton.defaultProps = {
  isOpen: false,
  showingAnimation: '',
  handleVisibility: () => {},
};

function RightSideBarButton({ isOpen, showingAnimation, handleVisibility }) {
  const themeMode = useThemeMode();
  const { t } = useTranslation();

  const renderRightBar = () => {
    if (!isOpen) {
      return (
        <Tooltip placement="top-start" title={t('viewer.showSidePanel')}>
          <Styled.OutSideWrapper showingAnimation={showingAnimation} onClick={handleVisibility}>
            <Styled.ControlButton>
              <Styled.ArrowIcon className="icon-arrow-left-alt" size={12} />
            </Styled.ControlButton>
          </Styled.OutSideWrapper>
        </Tooltip>
      );
    }
    return (
      <Tooltip placement="top-start" title={t('viewer.hideSidePanel')}>
        <Styled.InSideWrapper $isOpen showingAnimation={showingAnimation} onClick={handleVisibility}>
          <Styled.ControlButton $isOpen>
            <Styled.ArrowIcon className="icon-arrow-right-alt" size={12} />
          </Styled.ControlButton>
        </Styled.InSideWrapper>
      </Tooltip>
    );
  };

  return <ThemeProvider theme={Styled.theme[themeMode]}>{renderRightBar()}</ThemeProvider>;
}

export default RightSideBarButton;
