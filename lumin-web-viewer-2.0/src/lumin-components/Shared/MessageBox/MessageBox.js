import React from 'react';
import PropTypes from 'prop-types';

import Icomoon from 'luminComponents/Icomoon';
import { Colors } from 'constants/styles';
import { StyledContainer } from './MessageBox.styled';

function MessageBox({
  children, icon, iconSize, iconColor, expanded, isShowIcon, textSize, img, className,
}) {
  return (
    <StyledContainer isShowIcon={isShowIcon} expanded={expanded} textSize={textSize} className={className}>
      {isShowIcon && (img ? <img src={img} /> : <Icomoon className={icon} size={iconSize} color={iconColor} />) }
      <span>{children}</span>
    </StyledContainer>
  );
}

MessageBox.propTypes = {
  children: PropTypes.node.isRequired,
  icon: PropTypes.string,
  img: PropTypes.string,
  iconSize: PropTypes.number,
  expanded: PropTypes.bool,
  isShowIcon: PropTypes.bool,
  textSize: PropTypes.number,
  className: PropTypes.string,
  iconColor: PropTypes.string,
};

MessageBox.defaultProps = {
  icon: 'info',
  img: null,
  iconSize: 18,
  expanded: false,
  isShowIcon: true,
  textSize: 14,
  className: '',
  iconColor: Colors.PRIMARY_80,
};

export default MessageBox;
