import classNames from 'classnames';
import { Avatar, PlainTooltip, Text } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';

import UserAvatar from 'assets/reskin/lumin-svgs/default-user-avatar.svg';

import mapInvalidStatus from 'luminComponents/SearchResultItem/helpers/mapInvalidStatus';

import { useTranslation } from 'hooks';

import { avatar as avatarUtils } from 'utils';

import { SearchUserStatus } from 'constants/lumin-common';

import { IUserResult } from 'interfaces/user/user.interface';

import styles from './SearchResultItem.module.scss';

interface SearchResultItemProps {
  item: IUserResult;
  onClick: () => void;
  selected: boolean;
}

const SearchResultItem = (props: SearchResultItemProps) => {
  const { item, onClick, selected } = props;

  const { t } = useTranslation();

  const isPendingUser = useMemo(() => !item._id, [item]);

  const userName = useMemo(() => {
    // eslint-disable-next-line sonarjs/no-small-switch
    switch (item.status) {
      case SearchUserStatus.USER_UNAVAILABLE:
        return t('modalShare.unavailableUser');
      default:
        if (isPendingUser) {
          return t('modalShare.pendingUser');
        }
        return item.name;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPendingUser, item]);

  const isDisabled = useMemo(
    () =>
      [
        SearchUserStatus.USER_DELETING,
        SearchUserStatus.USER_UNAVAILABLE,
        SearchUserStatus.USER_RESTRICTED,
        SearchUserStatus.USER_UNALLOWED,
      ].includes(item.status),
    [item.status]
  );

  const invalidStatus = useMemo(
    () => [SearchUserStatus.USER_DELETING, SearchUserStatus.USER_RESTRICTED].find((status) => status === item.status),
    [item.status]
  );

  return (
    <PlainTooltip
      content={isDisabled ? t('modalShare.cannotShareDocumentWithUser') : ''}
      w={258}
      offset={-2}
      className={styles.tooltip}
    >
      <div
        role="presentation"
        className={classNames(styles.container, { [styles.disabled]: isDisabled })}
        onClick={() => !isDisabled && onClick()}
        data-cy={`search_result_item_${item._id}`}
        data-selected={selected}
      >
        <div className={styles.userInfoWrapper}>
          {isPendingUser ? (
            <Avatar size="sm" variant="outline" src={UserAvatar} />
          ) : (
            <Avatar size="sm" variant="outline" src={avatarUtils.getAvatar(item.avatarRemoteId)} name={item.name} />
          )}
          <div className={styles.userInfo}>
            <Text
              type="title"
              size="sm"
              ellipsis
              className={classNames(styles.name, { [styles.emphasize]: isPendingUser })}
            >
              {userName}
            </Text>
            <Text type="body" size="sm" ellipsis className={styles.email}>
              {item.email}
            </Text>
          </div>
        </div>
        {invalidStatus && (
          <div className={styles.rightSection}>
            <Text type="label" size="md" color="var(--kiwi-colors-semantic-error)" className={classNames(styles.text)}>
              {t(`common.${mapInvalidStatus[invalidStatus].toLowerCase()}`)}
            </Text>
          </div>
        )}
      </div>
    </PlainTooltip>
  );
};

export default SearchResultItem;
