/* eslint-disable arrow-body-style */
import React from 'react';

import AppExtensionImage from 'assets/reskin/lumin-svgs/app-extension.svg';

import Icomoon from 'luminComponents/Icomoon';

import { ButtonSection, DialogSection } from '../BasePromoteChromeExtensionModal';

import styles from './PromoteChromeExtensionVariantB.module.scss';

type Props = {
  handleGoToExtensionPage: () => Promise<void>;
  handleCloseModal: () => void;
};
const PromoteChromeExtensionVariantB = ({ handleGoToExtensionPage, handleCloseModal }: Props) => {
  return (
    <DialogSection handleCloseModal={handleCloseModal}>
      <div className={styles.container}>
        <img src={AppExtensionImage} alt="AppExtensionImage" className={styles.img} />
        <p className={styles.title}>Boost your productivity with Lumin Extension!</p>
        <div className={styles.wrapContent}>
          <p className={styles.description}>Lumin's free chrome extension is here:</p>

          <div className={styles.content}>
            <Icomoon className="checkbox" color="var(--kiwi-colors-semantic-success)" size={24} />
            <p className={styles.subContent}>Easily sync files between your browser and the app.</p>
          </div>
          <div className={styles.content}>
            <Icomoon className="checkbox" color="var(--kiwi-colors-semantic-success)" size={24} />
            <p className={styles.subContent}>Quickly open and edit your documents without leaving your browser.</p>
          </div>
        </div>
      </div>

      <ButtonSection handleGoToExtensionPage={handleGoToExtensionPage} handleCloseModal={handleCloseModal} />
    </DialogSection>
  );
};
export default PromoteChromeExtensionVariantB;
