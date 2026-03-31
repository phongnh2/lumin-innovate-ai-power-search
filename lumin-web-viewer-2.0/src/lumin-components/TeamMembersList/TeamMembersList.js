import { Query } from '@apollo/client/react/components';
import Grid from '@mui/material/Grid';
import MenuList from '@mui/material/MenuList';
import { capitalize } from 'lodash';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import { FILTER_MEMBERS } from 'src/graphql/TeamGraph';
import { LIST_MEMBER_TO_SHOW, ROLE } from 'src/screens/Teams/TeamConstant';

import MemberNotFound from 'assets/lumin-svgs/search-not-found.svg';

import MenuItem from 'lumin-components/Shared/MenuItem';
import Icomoon from 'luminComponents/Icomoon';
import MaterialSelect from 'luminComponents/MaterialSelect';
import Pagination from 'luminComponents/Pagination';
import PopperButton from 'luminComponents/PopperButton';
import RoleTooltip from 'luminComponents/RoleTooltip';
import Tooltip from 'luminComponents/Shared/Tooltip';
import TeamMembersRow from 'luminComponents/TeamMembersRow';

import { useTranslation } from 'hooks';
import usePrevious from 'hooks/usePrevious';

import { SORT_BY_ALPHABETICAL_ORDER } from 'constants/lumin-common';
import { Colors } from 'constants/styles';

import * as Styled from './TeamMembersList.styled';
import './TeamMembersList.scss';

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 10;
const NUMBER_OF_DUMMIES = 5;

const roleMaps = {
  all: 'all',
  admin: 'admin',
  moderator: 'moderator',
  member: 'member',
};

const arrowDownElement = (
  <span>
    <Icomoon className="dropdown" color={Colors.NEUTRAL_50} size={10} style={{ marginLeft: 12 }} />
  </span>
);

function TeamMembersList(props) {
  const { team, searchText, setRefetchList, currentUser, refetchTeam } = props;
  const classes = Styled.useStyle();
  const [selectedPage, setSelectedPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [sortOptions, setSortOptions] = useState({ roleSort: roleMaps.all });
  const prevOptions = usePrevious(sortOptions);
  const { t } = useTranslation();

  const roleTooltipTeamRole = [
    {
      role: t('roleText.spaceAdmin'),
      content: t('teamMember.tooltipTeamAdmin'),
    },
    {
      role: t('common.member'),
      content: t('teamMember.tooltipMember'),
    },
  ];

  useEffect(() => {
    resetPagination();
    setSortOptions({ roleSort: roleMaps.all });
  }, [searchText]);

  useEffect(() => {
    !isEqual(prevOptions, sortOptions) && resetPagination();
  }, [sortOptions, prevOptions]);

  function resetPagination() {
    setSelectedPage(DEFAULT_PAGE);
    setLimit(DEFAULT_LIMIT);
  }

  function _onLimitChanged(limit) {
    setLimit(limit.value);
    setSelectedPage(DEFAULT_PAGE);
  }

  const withClosePopper = (closePopper, callback) => () => {
    callback();
    closePopper();
  };

  // eslint-disable-next-line react/prop-types
  function _renderPopperContentBySortType({ closePopper, sortType }) {
    return (
      <MenuList>
        {Object.keys(SORT_BY_ALPHABETICAL_ORDER).map((sortKey) => (
          <MenuItem
            key={sortKey}
            className="FilterPopper__item FilterPopper__item--custom"
            onClick={withClosePopper(closePopper, () => setSortOptions({ [sortType]: sortKey }))}
          >
            <span>{t(`memberPage.sortByAlphabeticalaz${capitalize(sortKey)}`)}</span>
            {sortOptions[sortType] === sortKey && <Icomoon className="check" color={Colors.SECONDARY_50} size={12} />}
          </MenuItem>
        ))}
      </MenuList>
    );
  }

  function _renderListMembers(members, total, refetch) {
    const totalPages = Math.ceil(total / limit);
    const isLastMember = Boolean(members.length === 1 && selectedPage !== DEFAULT_PAGE);
    const refetchListMember = () => {
      setSelectedPage(selectedPage - 1);
      refetch();
    };

    return (
      <>
        {members.map((member) => (
          <TeamMembersRow
            key={member?.user?._id || member.email}
            member={member}
            team={team}
            refetchTeam={refetchTeam}
            refetchList={refetch}
            onRemoved={isLastMember ? refetchListMember : () => {}}
          />
        ))}
        {members.length !== 0 && (
          <div className="TeamMembersList__bottom">
            <div className="TeamMembersList__limit">
              <span className="TeamMembersList__limit-text">{t('common.show')}</span>
              <MaterialSelect
                containerClasses={classes.TeamMemberList}
                inputClasses="TeamMembersList__select-input"
                arrowStyle={{ size: 10 }}
                value={limit}
                items={[
                  { name: '10', value: 10 },
                  { name: '20', value: 20 },
                  { name: '30', value: 30 },
                ]}
                // eslint-disable-next-line react/jsx-no-bind
                onSelected={_onLimitChanged}
              />
            </div>
            <div className="TeamMembersList__page-number">
              {total > limit && (
                <Pagination
                  currentPage={selectedPage + 1}
                  totalPages={totalPages}
                  onPageSelected={(page) => setSelectedPage(page - 1)}
                />
              )}
            </div>
            <div className="TeamMembersList__page-info">
              <span>
                {t(total > 1 ? 'common.showEntries' : 'common.showEntry', {
                  fromEntries: selectedPage * limit + 1,
                  toEntries: Math.min((selectedPage + 1) * limit, total),
                  total,
                })}
              </span>
            </div>
          </div>
        )}
        {members.length === 0 && (
          <div className="TeamMembersList__no-result">
            <img src={MemberNotFound} alt="Member Not Found" className="TeamMembersList__no-result-image" />
            <span className="TeamMembersList__no-result-text">{t('teamMember.noResult')}</span>
          </div>
        )}
      </>
    );
  }

  function _renderListMembersSkeleton(dummies) {
    return dummies.map((member) => <TeamMembersRow key={member} loading />);
  }

  const _renderRoleTooltip = () => (
    <div className="TeamMembersList__role-filter">
      <span style={{ marginRight: '10px' }}>{t('teamMember.role')}</span>
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip
          title={<RoleTooltip content={roleTooltipTeamRole} />}
          tooltipStyle={{
            maxWidth: 420,
            padding: 16,
          }}
          placement="bottom"
        >
          <Icomoon className="info" color={Colors.NEUTRAL_60} size={12} />
        </Tooltip>
      </span>
    </div>
  );

  const memberNameElement = (
    <Grid item xs={5} className="TeamMembersList__member-name">
      <span>{t('teamMember.memberName')}</span>
      <PopperButton
        ButtonComponent="span"
        renderPopperContent={({ closePopper }) => _renderPopperContentBySortType({ closePopper, sortType: 'nameSort' })}
        classes="TeamMembersList__header__role-content"
        popperProps={{ parentOverflow: 'viewport' }}
      >
        {arrowDownElement}
      </PopperButton>
    </Grid>
  );

  const roleElement = (
    <Grid className="hide-in-mobile TeamMembersList__header__role" item xs={2}>
      {_renderRoleTooltip()}
    </Grid>
  );

  const emailAddressElement = ({ title = 'EMAIL', className = 'hide-in-mobile' } = {}) => (
    <Grid className={`TeamMembersList__email ${className}`} item xs={5}>
      <span>{title}</span>
      <PopperButton
        ButtonComponent="span"
        renderPopperContent={({ closePopper }) =>
          _renderPopperContentBySortType({ closePopper, sortType: 'emailSort' })
        }
        classes="TeamMembersList__header__role-content"
        popperProps={{ parentOverflow: 'viewport' }}
      >
        {arrowDownElement}
      </PopperButton>
    </Grid>
  );

  function _renderList(members, total, refetch, loading = false) {
    const dummies = [...Array(NUMBER_OF_DUMMIES).keys()];

    return (
      <div className="TeamMembersList">
        <div className="TeamMembersList__header hide-in-tablet hide-in-desktop">{_renderRoleTooltip()}</div>
        <Grid container className="TeamMembersList__header hide-in-mobile">
          {memberNameElement}
          {roleElement}
          {emailAddressElement()}
        </Grid>
        {loading ? _renderListMembersSkeleton(dummies) : _renderListMembers(members, total, refetch)}
      </div>
    );
  }

  const getSortOptions = (
    defaultOptions = { isOwner: 'ASC', roleValue: 'ASC', _id: 'ASC' },
    showType = LIST_MEMBER_TO_SHOW.MEMBER
  ) => {
    const nameSort = sortOptions?.nameSort;
    const isAddedMembersType = showType === LIST_MEMBER_TO_SHOW.MEMBER;

    if (nameSort && isAddedMembersType) {
      return { name: nameSort };
    }

    const emailSort = sortOptions?.emailSort;
    if (emailSort) {
      return { email: emailSort };
    }

    return defaultOptions;
  };

  return (
    <Query
      query={FILTER_MEMBERS}
      fetchPolicy="network-only"
      variables={{
        clientId: currentUser._id,
        offset: selectedPage * limit,
        limit,
        userQueryInput: {
          searchText,
        },
        memberShipInput: {
          teamId: team._id,
          ...(sortOptions?.roleSort !== roleMaps.all && { role: sortOptions?.roleSort }),
        },
        sortOptions: getSortOptions(),
      }}
    >
      {({ data, error, loading, refetch }) => {
        setRefetchList(refetch);
        if (error) {
          return <div>Error</div>;
        }
        const isSortByAdmin = sortOptions?.roleSort === ROLE.ADMIN.toLowerCase();
        const memberships = data?.memberships || [];
        const members = isSortByAdmin ? memberships.filter((member) => !member.isOwner) : memberships;
        // eslint-disable-next-line no-unsafe-optional-chaining
        const total = data?.membershipsCount - (isSortByAdmin ? 1 : 0);
        return _renderList(members, total, refetch, loading);
      }}
    </Query>
  );
}

TeamMembersList.propTypes = {
  team: PropTypes.object.isRequired,
  searchText: PropTypes.string.isRequired,
  setRefetchList: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired,
  refetchTeam: PropTypes.func,
};

TeamMembersList.defaultProps = {
  refetchTeam: () => {},
};

export default TeamMembersList;
