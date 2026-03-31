import classNames from 'classnames';
import { Button, Text } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import OnlyMemberImage from 'assets/reskin/images/members-only.png';

import action from 'actions';

import { LayoutSecondary, styles } from 'luminComponents/ReskinLayout/components/LayoutSecondary';

import authService from 'services/authServices';
import { kratosService } from 'services/oryServices';

import { commonUtils } from 'utils';
import { getDomainInfos } from 'utils/restrictedUserUtil';

// Don't need to implement Multilingual for Restrict Lumin access by user information and IP whitelist feature.
export default function OrganizationRestriction({ email }: { email: string }): JSX.Element {
  const dispatch = useDispatch();
  const domain = commonUtils.getDomainFromEmail(email);
  const { name } = getDomainInfos(domain);
  const [loading, setLoading] = useState(false);

  const handleSwitchAccount = async (): Promise<void> => {
    try {
      setLoading(true);
      await kratosService.signOut(() => {
        dispatch(action.setMembershipOfOrg({ email: null, require: false }));
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        authService.afterSignOut();
      });
    } catch (error) {
      return kratosService.signIn(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutSecondary>
      <img src={OnlyMemberImage} alt="members-only" className={classNames(styles.image, styles.wrongIPImage)} />
      <div>
        <Text type="headline" size="xl" className={styles.title}>
          Exclusive Access to Lumin for {name}’s Workspace Members
        </Text>
        <Text type="body" size="lg">
          To use Lumin as{' '}
          <Text component="span" color="var(--kiwi-colors-core-primary)">
            {email}
          </Text>
          , you need to be a member of the {name}’s Workspace. Request your admin to add you or switch{' '}
          account to utilize Lumin.
        </Text>
      </div>
      <div className={styles.buttonWrapper}>
        <Button onClick={handleSwitchAccount} size="lg" loading={loading}>
          Switch account
        </Button>
      </div>
    </LayoutSecondary>
  );
}
