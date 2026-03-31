/* eslint-disable arrow-body-style */
import React from 'react';

import AppExtensionImage from 'assets/reskin/lumin-svgs/app-extension.svg';

import { ButtonSection, DialogSection } from '../BasePromoteChromeExtensionModal';

import styles from './PromoteChromeExtensionVariantA.module.scss';

type Props = {
  handleGoToExtensionPage: () => Promise<void>;
  handleCloseModal: () => void;
};
const PromoteChromeExtensionVariantA = ({ handleGoToExtensionPage, handleCloseModal }: Props) => {
  return (
    <DialogSection handleCloseModal={handleCloseModal}>
      <div className={styles.container}>
        <img src={AppExtensionImage} alt="AppExtensionImage" className={styles.img} />
        <p className={styles.title}>Boost your productivity with Lumin Extension!</p>
        <div className={styles.wrapContent}>
          <p className={styles.description}>Install our browser extension to:</p>
          <div className={styles.content}>
            <p className={styles.subTitle}>Seamless Workflow:</p>
            <p className={styles.subContent}>Easily sync files between your browser and the app.</p>
          </div>
          <div className={styles.content}>
            <p className={styles.subTitle}>Instant Access:</p>
            <p className={styles.subContent}>Quickly open and edit your documents without leaving your browser.</p>
          </div>
        </div>
      </div>
      <ButtonSection handleGoToExtensionPage={handleGoToExtensionPage} handleCloseModal={handleCloseModal} />
    </DialogSection>
  );
};
export default PromoteChromeExtensionVariantA;
