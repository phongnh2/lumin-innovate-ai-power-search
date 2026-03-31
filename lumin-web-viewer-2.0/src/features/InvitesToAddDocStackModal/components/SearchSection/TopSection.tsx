import { useDidUpdate } from '@mantine/hooks';
import { Button } from 'lumin-ui/kiwi-ui';
import React from 'react';

import IconGoogle from 'assets/lumin-svgs/icon-google.svg';

import { useTranslation, useImportGoogleContacts } from 'hooks';
import useGetOrganizationData from 'hooks/useGetOrganizationData';

import { ORGANIZATION_ROLES } from 'constants/organizationConstants';

import { User, UserPayload } from '../../InvitesToAddDocStackModal.types';

import styles from './SearchSection.module.scss';

type TopSectionProps = {
  isSubmitting: boolean;
  setUserList: React.Dispatch<React.SetStateAction<User[]>>;
  setSelectedUsers: React.Dispatch<React.SetStateAction<UserPayload[]>>;
};

const TopSection = ({ isSubmitting, setUserList, setSelectedUsers }: TopSectionProps) => {
  const { t } = useTranslation();

  const org = useGetOrganizationData();

  const { handleImportGoogleContacts, contacts, isFetching } = useImportGoogleContacts(org?._id);

  useDidUpdate(() => {
    if (!contacts.length) {
      return;
    }
    setUserList(contacts as User[]);
    setSelectedUsers(
      (contacts as User[]).map((user) => ({
        email: user.email,
        role: ORGANIZATION_ROLES.MEMBER,
      }))
    );
  }, [contacts]);

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>{t('memberPage.inviteByEmail')}</label>
      <Button
        size="lg"
        variant="text"
        disabled={isSubmitting || isFetching}
        onClick={handleImportGoogleContacts}
        endIcon={<img src={IconGoogle} width={24} height={24} alt="Google" />}
      >
        {t('memberPage.addMemberModal.importFrom')}
      </Button>
    </div>
  );
};

export default TopSection;
