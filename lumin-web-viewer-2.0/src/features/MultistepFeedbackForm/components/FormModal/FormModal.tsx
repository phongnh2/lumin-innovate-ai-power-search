import { Paper } from 'lumin-ui/kiwi-ui';
import React from 'react';

import styles from './FormModal.module.scss';

interface FormModalProps {
  children: React.ReactNode;
}

interface FormTitleProps {
  title: string;
}

const FormModal = (props: FormModalProps) => {
  const { children } = props;
  return (
    <Paper radius="lg" shadow="lg" className={styles.container}>
      {children}
    </Paper>
  );
};

const FormTitle = ({ title }: FormTitleProps) => <h2 className={styles.title}>{title}</h2>;

FormModal.Title = FormTitle;
export default FormModal;
