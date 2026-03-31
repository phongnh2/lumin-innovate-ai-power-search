import Image from 'next/image';
import { useEffect } from 'react';

import LoadingImage from '@/public/assets/loading.gif';

import useProgress from './useProgress';

import { containerCss, progressBarCss, progressBarTrackCss, wrapperCss, loadingImageCss, whiteBackgroundCss } from './LoadingLogo.styled';

function LoadingLogo({ whiteBackground }: { whiteBackground?: boolean }) {
  const { progress, start } = useProgress();
  useEffect(() => {
    start();
  }, [start]);

  return (
    <div css={[wrapperCss, whiteBackground && whiteBackgroundCss]}>
      <div css={containerCss}>
        <Image css={loadingImageCss} priority src={LoadingImage} alt='Lumin' />

        <div css={progressBarCss}>
          <div css={progressBarTrackCss} style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

export default LoadingLogo;
