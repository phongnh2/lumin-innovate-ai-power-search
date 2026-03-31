import Lottie from 'lottie-react';
import React from 'react';

import animationLoadingBanana from './loading_banana.json';

import styles from './SignLoading.module.scss';

const DEFAULT_SIZE = 209;
const DEFAULT_OPTIONS = {
  loop: true,
  autoplay: true,
  animationData: animationLoadingBanana,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
};

type SignLoadingProps = {
  loading: boolean;
  size?: string | number;
};

const SignLoading = ({ size = DEFAULT_SIZE, loading }: SignLoadingProps) => {
  if (!loading) {
    return null;
  }
  return (
    <div className={styles.container}>
      <Lottie style={{ width: size, height: size }} {...DEFAULT_OPTIONS} animationData={animationLoadingBanana} />
    </div>
  );
};

export default SignLoading;
