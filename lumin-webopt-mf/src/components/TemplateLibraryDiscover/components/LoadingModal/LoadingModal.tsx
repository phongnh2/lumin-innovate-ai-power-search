import { useMemo } from "react";

import loadingSpinner from "@/assets/images/svg/icon-loading.svg";

import { LOADING_MESSAGES } from "../../constants";

import styles from "./LoadingModal.module.scss";

const LoadingModal = () => {
  const message = useMemo(
    () => LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)],
    [],
  );

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingContent}>
        <h2 className={styles.loadingTitle}>{message}</h2>
        <div className={styles.loadingSpinner}>
          <img
            src={loadingSpinner}
            alt="loading spinner"
            className={styles.loadingSpinnerImg}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
