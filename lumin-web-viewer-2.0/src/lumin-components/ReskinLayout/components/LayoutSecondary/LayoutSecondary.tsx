import { Logo as KiwiLogo, Paper } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import action from 'actions';

import styles from './LayoutSecondary.module.scss';

interface LayoutSecondaryProps {
  children: React.ReactNode;
}

const LayoutSecondary = (props: LayoutSecondaryProps) => {
  const { children } = props;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onClickLogo = () => {
    dispatch(action.setWrongIpStatus({ email: null, open: false }));
    dispatch(action.setMembershipOfOrg({ require: false, email: '' }));
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div onClick={onClickLogo} className={styles.onClickLogo} role="presentation">
          <KiwiLogo type="WebLogomarkHorizontal" />
        </div>
      </header>
      <main>
        <div className={styles.contentContainer}>
          <Paper w="var(--kiwi-sizing-dialogs-md)" className={styles.wrapper}>
            {children}
          </Paper>
        </div>
      </main>
    </div>
  );
};

export default LayoutSecondary;
