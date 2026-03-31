import { ClickAwayListener } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { ThemeProvider } from 'styled-components';

import ButtonICon from 'lumin-components/Shared/ButtonIcon';
import MaterialPopper from 'luminComponents/MaterialPopper';

import { useThemeMode } from 'hooks';

import * as Styled from './StatusPopper.styled';

function StatusPopper({
  anchorRef,
  content,
  showPopover,
  onClose,
  placement,
  styleContentClasses
}) {
  const themeMode = useThemeMode();

  return (
    <ThemeProvider theme={Styled.theme[themeMode]}>
      <MaterialPopper
        open={showPopover}
        anchorEl={anchorRef}
        placement={placement}
        disablePortal={false}
        backgroundColor={Styled.theme[themeMode].background}
        classes={`theme-${themeMode}`}
        showArrow
        arrowClasses={themeMode}
        styleContentClasses={styleContentClasses}
      >
        <ClickAwayListener onClickAway={onClose}>
          <Styled.PopperWrapper>
            <Styled.Wrapper>
              {content.img && (
                <Styled.ImgWrapper>
                  <Styled.Img src={content.img} />
                </Styled.ImgWrapper>
              )}
              <Styled.ContentWrapper>
                <Styled.Title>{content.title}</Styled.Title>
                <Styled.Desc>{content.desc}</Styled.Desc>
                {/* <Styled.LearnMore>Learn more</Styled.LearnMore> */}
              </Styled.ContentWrapper>
            </Styled.Wrapper>
            <Styled.CloseWrapper onClick={onClose}>
              <ButtonICon icon="cancel" size={28} iconColor={Styled.theme[themeMode].closeColor} />
              {/* <Icomoon className="cancel" size={14} color={Styled.theme[themeMode].closeColor} /> */}
            </Styled.CloseWrapper>
          </Styled.PopperWrapper>
        </ClickAwayListener>
      </MaterialPopper>
    </ThemeProvider>
  );
}

StatusPopper.propTypes = {
  content: PropTypes.object,
  anchorRef: PropTypes.object,
  showPopover: PropTypes.bool,
  onClose: PropTypes.func,
  placement: PropTypes.string,
  styleContentClasses: PropTypes.string,
};
StatusPopper.defaultProps = {
  anchorRef: {},
  content: {},
  showPopover: false,
  onClose: () => {},
  placement: 'bottom-end',
  styleContentClasses: '',
};

export default StatusPopper;
