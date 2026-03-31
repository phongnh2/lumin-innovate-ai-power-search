import MaterialRadio from '@mui/material/Radio';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import SvgElement from 'lumin-components/SvgElement';

import { useViewerMatch } from 'hooks/useViewerMatch';

import * as Styled from './Radio.styled';

const Radio = ({
  className,
  themeMode,
  size,
  ...otherProps
}) => {
  const classes = Styled.useStyles();
  const { isViewer } = useViewerMatch();
  const { ...validProps } = otherProps;

  const getSvgIcon = (svgName) => {
    const isLightMode = themeMode === 'light';
    if (otherProps.disabled && !otherProps.checked) {
      return `${svgName}-Disabled`;
    }
    if (!isViewer) {
      return `${svgName}-Light`;
    }
    return `${svgName}${isLightMode ? '-Light' : ''}`;
  };

  return (
    <MaterialRadio
      className={classNames(classes.root, className)}
      icon={
        <SvgElement content={getSvgIcon('Radio-NotSelected')} width={size} />
      }
      checkedIcon={
        <SvgElement content={getSvgIcon('Radio-Selected')} width={size} />
      }
      {...validProps}
    />
  );
};

Radio.propTypes = {
  className: PropTypes.string,
  themeMode: PropTypes.oneOf(['light', 'dark']).isRequired,
  size: PropTypes.number,
};
Radio.defaultProps = {
  className: '',
  size: 16,
};

const mapStateToProps = (state) => ({
  themeMode: selectors.getThemeMode(state),
});

export default connect(mapStateToProps)(Radio);
