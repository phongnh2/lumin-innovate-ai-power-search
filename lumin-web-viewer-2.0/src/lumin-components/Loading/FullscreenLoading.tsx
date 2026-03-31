import React from 'react';

import LogoLuminPdf from 'assets/images/logo_luminpdf.svg';

import styles from './Loading.module.scss';

const FullscreenLoading = () => (
  <div className={styles.fullScreenContainer}>
    <img src={LogoLuminPdf} alt="Lumin PDF logo" className={styles.logoCenter} />
    <span className={styles.spinner} />
    <p className={styles.text}>Loading Lumin App</p>
  </div>
);

export default FullscreenLoading;
