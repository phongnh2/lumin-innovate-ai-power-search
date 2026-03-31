import CircularProgress from '@mui/material/CircularProgress';
import classNames from 'classnames';
import { CircularProgress as KiwiCircularProgress } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import LoadingLogo from 'lumin-components/LoadingLogo';

import { useViewerMatch } from 'hooks/useViewerMatch';

import { Colors } from 'constants/styles';

import styles from './Loading.module.scss';

const propTypes = {
  fullscreen: PropTypes.bool,
  normal: PropTypes.bool,
  className: PropTypes.string,
  size: PropTypes.number,
  color: PropTypes.string,
  reskinSize: PropTypes.string,
  useReskinCircularProgress: PropTypes.bool,
  containerStyle: PropTypes.object,
};

const defaultProps = {
  fullscreen: false,
  normal: false,
  className: '',
  size: 24,
  reskinSize: 'md',
  useReskinCircularProgress: false,
  color: Colors.PRIMARY_80,
  containerStyle: {},
};

const Loading = React.forwardRef((props, ref) => {
  const { fullscreen, normal, className, size, reskinSize, useReskinCircularProgress, color, containerStyle } = props;
  const { isViewer } = useViewerMatch();

  const circularProgressComponent =
    useReskinCircularProgress || isViewer ? (
      <KiwiCircularProgress tabIndex={-1} size={reskinSize} />
    ) : (
      <CircularProgress size={size} style={{ color }} />
    );

  return (
    <div
      className={classNames(
        styles.loadingContainer,
        {
          [styles.fullscreen]: fullscreen,
        },
        className
      )}
      style={containerStyle}
      ref={ref}
    >
      {normal ? circularProgressComponent : <LoadingLogo />}
    </div>
  );
});

Loading.propTypes = propTypes;
Loading.defaultProps = defaultProps;

export default Loading;
