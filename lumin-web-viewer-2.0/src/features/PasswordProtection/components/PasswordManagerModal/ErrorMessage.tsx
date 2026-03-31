import React from 'react';

import styles from './PasswordManagerModal.module.scss';

interface ErrorMessageProps {
  children: React.ReactNode;
}

const ErrorMessage = (props: ErrorMessageProps) => <div className={styles.errorBox}>{props.children}</div>;

export default ErrorMessage;
