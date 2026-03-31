import React from 'react';

import logo from 'assets/favicon/apple-icon.png';

import styles from './LoadingScreen.module.scss';

interface LoadingScreenProps {
  fileId: string;
}

const LoadingScreen = ({ fileId }: LoadingScreenProps) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '16px',
    }}
  >
    <img className={styles.logo} src={logo} alt="Loading" />
    <h1 className={styles.title}>Opening file...</h1>
    {fileId && <h2 className={styles.message}>Processing document...</h2>}
  </div>
);

export default LoadingScreen;
