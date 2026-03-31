import classNames from 'classnames';
import { Button, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useDispatch } from 'react-redux';

import WrongIpImageReskin from 'assets/reskin/images/wrong-ip.png';

import action from 'actions';

import { LayoutSecondary, styles } from 'luminComponents/ReskinLayout/components/LayoutSecondary';

import authService from 'services/authServices';
import { kratosService } from 'services/oryServices';

// Don't need to implement Multilingual for Restrict Lumin access by user information and IP whitelist feature.
export default function WrongIP({ email }: { email: string }): JSX.Element {
  const dispatch = useDispatch();

  const handleSwitchAccount = async (): Promise<void> => {
    try {
      await kratosService.signOut(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        authService.afterSignOut();
        dispatch(action.setWrongIpStatus({ email: null, open: false }));
      });
    } catch (error) {
      return kratosService.signIn(true);
    }
  };
  return (
    <LayoutSecondary>
      <img src={WrongIpImageReskin} alt="wrong-ip" className={classNames(styles.image, styles.wrongIPImage)} />
      <div>
        <Text type="headline" size="xl" className={styles.title}>Only verified IPs can access Lumin</Text>
        <Text type="body" size="lg">
          Before using Lumin as{' '}
          <Text component="span" color="var(--kiwi-colors-core-primary)">
            {email}
          </Text>
          , please ensure that you join a verified Farmers & Merchants Bank network or switch your account to utilize Lumin.
        </Text>
      </div>
      <div className={styles.buttonWrapper}>
        <Button onClick={handleSwitchAccount} size="lg">
          Switch account
        </Button>
      </div>
    </LayoutSecondary>
  );
}
