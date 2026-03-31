import { Button, Icomoon, Text } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useRef } from 'react';

import { SearchInput } from 'luminComponents/ReskinLayout/components/SearchInput';

import { useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { SEARCH_PLACEHOLDER } from 'constants/customConstant';

import styles from './MemberSearchBar.module.scss';

type MemberSearchBarProps = {
  autoFocus: boolean;
  title: string;
  searchValue: string;
  onInviteMembers(): void;
  onSearch(e: React.ChangeEvent<HTMLInputElement>): void;
};

const MemberSearchBar = ({ searchValue, title, onSearch, onInviteMembers, autoFocus }: MemberSearchBarProps) => {
  const { t } = useTranslation();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!autoFocus || !inputRef.current) {
      return;
    }
    inputRef.current.focus();
  }, [autoFocus]);

  return (
    <div className={styles.container}>
      <Text type="headline" size="lg" color="var(--kiwi-colors-surface-on-surface)">
        {title}
      </Text>
      <div className={styles.rightSection}>
        <div className={styles.searchInputWrapper}>
          <SearchInput
            ref={inputRef}
            size="lg"
            width="100%"
            onChange={onSearch}
            value={searchValue}
            placeholder={t(SEARCH_PLACEHOLDER.SEARCH_EMAIL)}
          />
        </div>
        <Button
          size="lg"
          variant="filled"
          startIcon={<Icomoon type="user-plus-lg" size="lg" />}
          onClick={onInviteMembers}
          data-lumin-btn-name={ButtonName.INVITE_CIRCLE_MEMBER}
        >
          {t('memberPage.inviteMembers')}
        </Button>
      </div>
    </div>
  );
};

export default MemberSearchBar;
