import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { useProgress } from 'hooks';
import * as Styled from './DownloadProgress.styled';

function DownloadProgress({ size }) {
  const { progress, start } = useProgress({ speedFactor: 2 });

  useEffect(() => {
    start();
  }, []);

  return (
    <Styled.Container $size={size}>
      <Styled.Progress
        variant="determinate"
        value={progress}
        size={size}
        thickness={22}
      />
    </Styled.Container>
  );
}

DownloadProgress.propTypes = {
  size: PropTypes.number,
};
DownloadProgress.defaultProps = {
  size: 12,
};

export default DownloadProgress;
