import classNames from 'classnames';
import { capitalize, isEmpty } from 'lodash';
import { Icomoon, IconButton, PlainTooltip, Menu, MenuItem } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { Trans } from 'react-i18next';
import { useMatch } from 'react-router';

import { useTranslation } from 'hooks';

import { getLanguage } from 'utils/getLanguage';

import { SORT_BY_DATE } from 'constants/lumin-common';
import {
  ORG_TEXT,
  ORGANIZATION_MEMBER_TYPE,
  ORGANIZATION_MEMBERS_FILTER_BY_ROLE,
} from 'constants/organizationConstants';

import styles from './OrganizationListHeader.module.scss';

type OrganizationListHeaderProps = {
  listType: string;
  setSortOptions({ roleSort, joinSort }: { roleSort?: string; joinSort?: string }): void;
  sortOptions: {
    roleSort: string;
    joinSort: string;
  };
  isPendingMember: boolean;
  totalSignSeats?: number;
  availableSignSeats?: number;
};

type SortOrder = 'ASC' | 'DESC';

const OrganizationListHeader = ({
  listType,
  isPendingMember,
  setSortOptions,
  sortOptions,
  totalSignSeats,
  availableSignSeats,
}: OrganizationListHeaderProps) => {
  const { t } = useTranslation();

  const isOrgMembersPage = Boolean(useMatch({ path: `${ORG_TEXT}/:orgDomain/members`, end: false }));

  const [openedRoleSort, setOpenedRoleSort] = useState(false);
  const [openedJoinedDateSort, setOpenedJoinedDateSort] = useState(false);

  const roleTooltipContent = [
    {
      role: t('roleText.orgAdmin'),
      content: t('memberPage.tooltipRoleAdmin'),
    },
    {
      role: t('roleText.billingModerator'),
      content: t('memberPage.tooltipRoleBilling'),
    },
    {
      role: t('roleText.member'),
      content: t('memberPage.tooltipRoleMember'),
    },
  ];

  const signSeatTooltipContent = [
    {
      title: t('memberPage.luminSignSeat.availableSeats'),
      content: `${availableSignSeats}/${totalSignSeats}`,
    },
    {
      title: t('memberPage.luminSignSeat.assignedSeats'),
      content: `${totalSignSeats - availableSignSeats}/${totalSignSeats}`,
    },
  ];

  const defaultCheck = (role: string) =>
    ORGANIZATION_MEMBERS_FILTER_BY_ROLE[role] === ORGANIZATION_MEMBERS_FILTER_BY_ROLE.ALL && isEmpty(sortOptions);

  const renderSortTarget = ({
    opened,
    onChange,
    items,
  }: {
    opened: boolean;
    onChange: React.Dispatch<React.SetStateAction<boolean>>;
    items: React.ReactNode[];
  }) => (
    <Menu
      opened={opened}
      ComponentTarget={
        <IconButton size="sm" icon="caret-down-filled-sm" iconColor="var(--kiwi-colors-surface-on-surface-variant)" />
      }
      onChange={onChange}
      closeOnItemClick
    >
      {items}
    </Menu>
  );

  const renderExtraHeaderColumn = () => {
    if (listType === ORGANIZATION_MEMBER_TYPE.PEOPLE_REQUEST_ACCESS) {
      return <span className={styles.headerItem}>{t('memberPage.requestDate')}</span>;
    }
    if (
      [
        ORGANIZATION_MEMBER_TYPE.PEOPLE_GUEST,
        ORGANIZATION_MEMBER_TYPE.PEOPLE_MEMBER,
        ORGANIZATION_MEMBER_TYPE.MEMBER,
      ].includes(listType)
    ) {
      return (
        <div className={styles.signSeatHeader}>
          <span className={styles.headerItem}>Lumin Sign</span>
          <PlainTooltip
            p="var(--kiwi-spacing-0-5) var(--kiwi-spacing-1)"
            miw="134px"
            position="bottom-start"
            zIndex={301}
            content={
              <>
                <span>
                  <Trans i18nKey="memberPage.luminSignSeat.totalSeats" values={{ totalSignSeats }} />
                  {' = '} {totalSignSeats}
                </span>
                {signSeatTooltipContent.map(({ title, content }) => (
                  <ul key={title} className={styles.signSeatContent}>
                    <li>
                      <span>
                        {title}
                        {' = '} {content}
                      </span>
                    </li>
                  </ul>
                ))}
              </>
            }
          >
            <Icomoon size="md" type="info-circle-md" color="var(--kiwi-colors-surface-on-surface-variant)" />
          </PlainTooltip>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={classNames(styles.headerWrapper, isOrgMembersPage && styles.membersPage)}
      data-list-type={listType.toLowerCase()}
    >
      <span className={styles.headerItem}>
        {isPendingMember ? t('memberPage.emailAddress') : t('memberPage.memberName')}
      </span>
      <div className={styles.roleHeader}>
        <span className={styles.headerItem}>{t('memberPage.role')}</span>
        <PlainTooltip
          p="var(--kiwi-spacing-1-5)"
          maw="min-content"
          miw="384px"
          zIndex={301}
          content={
            <p className={styles.roleTooltip}>
              {roleTooltipContent.map(({ role, content }) => (
                <p
                  key={role}
                  className={styles.roleContent}
                  style={{
                    gridTemplateColumns: `${getLanguage() === 'en' ? 80 : 100}px 1fr`,
                  }}
                >
                  <span>{role}</span>
                  <span>{content}.</span>
                </p>
              ))}
            </p>
          }
        >
          <Icomoon size="md" type="info-circle-md" color="var(--kiwi-colors-surface-on-surface-variant)" />
        </PlainTooltip>
        {![ORGANIZATION_MEMBER_TYPE.PEOPLE_REQUEST_ACCESS, ORGANIZATION_MEMBER_TYPE.PEOPLE_PENDING_MEMBER].includes(
          listType
        ) &&
          renderSortTarget({
            opened: openedRoleSort,
            onChange: setOpenedRoleSort,
            items: Object.keys(ORGANIZATION_MEMBERS_FILTER_BY_ROLE).map((role) => (
              <MenuItem key={role} data-cy={role} onClick={() => setSortOptions({ roleSort: role })}>
                <div className={classNames(styles.sortItemWrapper, styles.roleSort)}>
                  <span>{t(ORGANIZATION_MEMBERS_FILTER_BY_ROLE[role])}</span>
                  {(defaultCheck(role) || role === sortOptions?.roleSort) && (
                    <Icomoon size="sm" type="check-sm" color="var(--kiwi-colors-surface-on-surface)" />
                  )}
                </div>
              </MenuItem>
            )),
          })}
      </div>
      {[
        ORGANIZATION_MEMBER_TYPE.PEOPLE_MEMBER,
        ORGANIZATION_MEMBER_TYPE.PEOPLE_GUEST,
        ORGANIZATION_MEMBER_TYPE.MEMBER,
      ].includes(listType) && (
        <div className={styles.roleHeader}>
          <span className={styles.headerItem}>{t('memberPage.dateJoined')}</span>
          {renderSortTarget({
            opened: openedJoinedDateSort,
            onChange: setOpenedJoinedDateSort,
            items: Object.keys(SORT_BY_DATE).map((sortKey: SortOrder) => (
              <MenuItem key={sortKey} data-cy={sortKey} onClick={() => setSortOptions({ joinSort: sortKey })}>
                <div className={classNames(styles.sortItemWrapper, styles.dateSort)}>
                  <span>{t(`common.sort${capitalize(SORT_BY_DATE[sortKey])}`)}</span>
                  {sortKey === sortOptions?.joinSort && (
                    <Icomoon size="sm" type="check-sm" color="var(--kiwi-colors-surface-on-surface)" />
                  )}
                </div>
              </MenuItem>
            )),
          })}
        </div>
      )}
      {renderExtraHeaderColumn()}
    </div>
  );
};

export default OrganizationListHeader;
