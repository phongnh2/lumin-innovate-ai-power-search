import React, { useEffect, useState } from 'react';

import LoadingImage from 'assets/images/loading.gif';

import useProgress from 'hooks/useProgress';

import * as Styled from './LoadingLogo.styled';

function LoadingLogo() {
  const [src, setSrc] = useState(LoadingImage);
  const { progress, start } = useProgress();
  useEffect(() => {
    start();
    setSrc(LoadingImage);
    return () => {
      setSrc(null);
    };
  }, []);
  return (
    <Styled.Container>
      <img tabIndex={-1} src={src} height={200} alt="Lumin" />
      <Styled.ProgressBar>
        <Styled.ProgressBarTrack style={{ width: `${progress}%` }} />
      </Styled.ProgressBar>
    </Styled.Container>
  );
}

export default LoadingLogo;
