import Avatar from '@mui/material/Avatar';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import CircularLoading from 'luminComponents/CircularLoading';
import Icomoon from 'luminComponents/Icomoon';
import SvgElement from 'luminComponents/SvgElement';

import { hashColorFromUserName } from 'utils';

import { Colors } from 'constants/styles';

import './MaterialAvatar.scss';

const propTypes = {
  src: PropTypes.string,
  size: PropTypes.number,
  containerClasses: PropTypes.string,
  children: PropTypes.node,
  team: PropTypes.bool,
  isIdled: PropTypes.bool,
  secondary: PropTypes.bool,
  hasBorder: PropTypes.bool,
  variant: PropTypes.oneOf(['circular', 'rounded', 'square']),
  loading: PropTypes.bool,
  icon: PropTypes.string,
  fontSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  backgroundColor: PropTypes.string,
  style: PropTypes.object,
};

const defaultProps = {
  src: '',
  size: 0,
  containerClasses: '',
  children: null,
  team: false,
  isIdled: false,
  secondary: false,
  hasBorder: false,
  variant: 'circular',
  loading: false,
  icon: '',
  fontSize: undefined,
  backgroundColor: '',
  style: {},
};

function MaterialAvatar(props) {
  const {
    src,
    size,
    containerClasses,
    children,
    team,
    isIdled,
    secondary,
    hasBorder,
    variant,
    loading,
    icon,
    fontSize,
    backgroundColor,
    style,
  } = props;
  const getBackgroundColor = () => (typeof children === 'string' ? hashColorFromUserName(children) : Colors.NEUTRAL_20);

  const avatarStyle = {
    backgroundColor: backgroundColor || getBackgroundColor(),
    ...style,
  };
  const avatarFontSize = fontSize || Math.floor(size / 2.25);
  if (size > 0) {
    Object.assign(avatarStyle, {
      width: size,
      height: size,
      fontSize: avatarFontSize,
    });
  }
  let classExtends = '';
  if (isIdled) {
    classExtends = src ? 'idleWithAvatar' : 'secondary';
  }

  return (
    <div
      className={classNames({
        [containerClasses]: !!containerClasses,
        MaterialAvatar: true,
        MaterialAvatar__border: hasBorder,
        'MaterialAvatar__border--circle': hasBorder && variant === 'circular',
        'MaterialAvatar__border--rounded': hasBorder && variant === 'rounded',
      })}
    >
      {
        loading && (
          <div
            className={classNames(
              'MaterialAvatar__loading',
              { 'MaterialAvatar__loading--circle': variant === 'circular' },
            )}
          >
            <CircularLoading color="inherit" size={20} />
          </div>
        )
      }
      <Avatar
        className={classNames(`MaterialAvatar__container ${classExtends}`, { secondary })}
        src={src}
        alt="Avatar"
        style={avatarStyle}
        variant={variant}
      >
        {children || <SvgElement content={team ? 'team-dummy' : 'anonymous-avatar'} width={size} />}
      </Avatar>
      {icon &&
        <div className="OwnerIcon__Container">
          <Icomoon className={icon} size={16} color={Colors.WHITE} />
        </div>}

    </div>
  );
}

MaterialAvatar.propTypes = propTypes;
MaterialAvatar.defaultProps = defaultProps;

export default MaterialAvatar;
