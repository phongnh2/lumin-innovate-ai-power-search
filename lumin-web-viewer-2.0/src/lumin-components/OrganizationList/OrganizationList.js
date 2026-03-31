import { NetworkStatus } from '@apollo/client';
import { capitalize } from 'lodash';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React, { useContext, useEffect } from 'react';
import ReactDOM from 'react-dom';

import MemberNotFound from 'assets/lumin-svgs/no-document.svg';

import Icomoon from 'lumin-components/Icomoon';
import MemberOrgRow from 'lumin-components/MemberOrgRow';
import Tooltip from 'lumin-components/Shared/Tooltip';
import RoleTooltip from 'luminComponents/RoleTooltip';

import { useEnableWebReskin, useTabletMatch, useTranslation } from 'hooks';
import usePrevious from 'hooks/usePrevious';

import { ModalTypes, /* SORT_BY_ALPHABETICAL_ORDER, */ SORT_BY_DATE } from 'constants/lumin-common';
import { ORGANIZATION_MEMBERS_FILTER_BY_ROLE, ORGANIZATION_MEMBER_TYPE } from 'constants/organizationConstants';
import { Colors } from 'constants/styles';

import OrganizationListEmptyList from './components/OrganizationListEmptyList';
import OrganizationListLoading from './components/OrganizationListLoading';
import OrganizationListPagination from './components/OrganizationListPagination';
import OrganizationListSkeleton from './components/OrganizationListSkeleton';
import OrganizationListContext from './OrganizationListContext';

import * as Styled from './OrganizationList.styled';

import styles from './OrganizationList.module.scss';

const propTypes = {
  type: PropTypes.string,
  fetchTotalMember: PropTypes.func,
  searchText: PropTypes.string,
  openModal: PropTypes.func,
  checkTransferTeams: PropTypes.func.isRequired,
  sortOptions: PropTypes.object,
  setSortOptions: PropTypes.func,
  selectedPage: PropTypes.number,
  setSelectedPage: PropTypes.func,
  limit: PropTypes.number,
  setLimit: PropTypes.func,
  currentPaymentMethod: PropTypes.object,
  isFetchedCard: PropTypes.bool,
};

const defaultProps = {
  type: '',
  fetchTotalMember: () => {},
  searchText: '',
  openModal: () => {},
  sortOptions: {},
  setSortOptions: () => {},
  selectedPage: 1,
  setSelectedPage: () => {},
  limit: 0,
  setLimit: () => {},
};

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 10;

const transformEdgesToShow = (edges) => edges.map((item) => ({ ...item.node, ...item.node.user, user: undefined }));

const getToolTipStyles = (isTabletUp) => ({
  maxWidth: isTabletUp ? 420 : 212,
  padding: 16,
});

const popperHeaderProps = { parentOverflow: 'viewport', scrollWillClosePopper: true };

const OrganizationList = ({
  type,
  fetchTotalMember,
  searchText: searchKey,
  openModal,
  checkTransferTeams,
  sortOptions,
  setSortOptions,
  selectedPage,
  setSelectedPage,
  limit,
  setLimit,
  currentPaymentMethod,
  isFetchedCard,
}) => {
  const { t } = useTranslation();
  const prevOptions = usePrevious(sortOptions);
  const isPendingMember = ORGANIZATION_MEMBER_TYPE.PEOPLE_PENDING_MEMBER === type;
  const isTabletUp = useTabletMatch();
  const { loading, error, members, refetch, networkStatus } = useContext(OrganizationListContext);
  const { edges, totalItem } =
    members?.getListRequestJoinOrganization ||
    members?.getMemberOfOrganization ||
    members?.getListPendingUserOrganization ||
    {};
  const users = transformEdgesToShow(edges || []);

  const tooltipStyle = getToolTipStyles(isTabletUp);

  const { isEnableReskin } = useEnableWebReskin();

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

  useEffect(() => {
    ReactDOM.unstable_batchedUpdates(() => {
      setSortOptions({});
      setSelectedPage(DEFAULT_PAGE);
    });
  }, [type, searchKey]);

  useEffect(() => {
    if (!isEqual(prevOptions, sortOptions)) {
      ReactDOM.unstable_batchedUpdates(() => {
        setSelectedPage(DEFAULT_PAGE);
        setLimit(DEFAULT_LIMIT);
      });
    }
  }, [sortOptions, prevOptions]);

  async function afterRemovingUser(totalItems) {
    const isTotalItemValid = totalItems - 1 <= limit * selectedPage;
    const isDefaultPage = selectedPage === DEFAULT_PAGE;
    const shouldRefetch = !isTotalItemValid || isDefaultPage;
    if (shouldRefetch) {
      await refetch();
    } else {
      setSelectedPage(selectedPage - 1);
    }
    fetchTotalMember();
  }

  const defaultCheck = (role) =>
    ORGANIZATION_MEMBERS_FILTER_BY_ROLE[role] === ORGANIZATION_MEMBERS_FILTER_BY_ROLE.ALL && isEmpty(sortOptions);

  // eslint-disable-next-line react/prop-types
  const renderPopperContentByRole = ({ closePopper }) => (
    <Styled.Menu>
      {Object.keys(ORGANIZATION_MEMBERS_FILTER_BY_ROLE).map((role) => (
        <Styled.MenuItem
          key={role}
          onClick={() => {
            setSortOptions({ roleSort: role });
            closePopper();
          }}
        >
          {t(ORGANIZATION_MEMBERS_FILTER_BY_ROLE[role])}
          {(defaultCheck(role) || role === sortOptions?.roleSort) && (
            <Icomoon className="check" color={Colors.SECONDARY_50} size={12} />
          )}
        </Styled.MenuItem>
      ))}
    </Styled.Menu>
  );

  // eslint-disable-next-line react/prop-types
  // function _renderPopperContentByName({ closePopper, sortType }) {
  //   return (
  //     <Styled.Menu>
  //       {Object.keys(SORT_BY_ALPHABETICAL_ORDER).map((sortKey) => (
  //         <Styled.MenuItem
  //           key={sortKey}
  //           onClick={() => {
  //             setSortOptions({ [sortType]: sortKey });
  //             closePopper();
  //           }}
  //         >
  //           {t('memberPage.sortText', { text: SORT_BY_ALPHABETICAL_ORDER[sortKey] })}
  //           {sortKey === sortOptions[sortType] && (
  //             <Icomoon className="check" color={Colors.SECONDARY_50} size={12} />
  //           )}
  //         </Styled.MenuItem>
  //       ))}
  //     </Styled.Menu>
  //   );
  // }

  // eslint-disable-next-line react/prop-types
  const renderPopperContentByJoinedDate = ({ closePopper }) => (
    <Styled.Menu>
      {Object.keys(SORT_BY_DATE).map((sortKey) => (
        <Styled.MenuItem
          key={sortKey}
          onClick={() => {
            setSortOptions({ joinSort: sortKey });
            closePopper();
          }}
        >
          {t(`common.sort${capitalize(SORT_BY_DATE[sortKey])}`)}
          {sortKey === sortOptions?.joinSort && <Icomoon className="check" color={Colors.SECONDARY_50} size={12} />}
        </Styled.MenuItem>
      ))}
    </Styled.Menu>
  );

  // eslint-disable-next-line react/prop-types
  // const renderPopperContentByLastActivity = ({ closePopper }) => (
  //   <Styled.Menu>
  //     {Object.keys(SORT_BY_DATE).map((sortKey) => (
  //       <Styled.MenuItem
  //         key={sortKey}
  //         onClick={() => {
  //           setSortOptions({ lastActivitySort: sortKey });
  //           closePopper();
  //         }}
  //       >
  //         {t('memberPage.sortText', { text: SORT_BY_DATE[sortKey] })}
  //         {sortKey === sortOptions?.lastActivitySort && (
  //           <Icomoon className="check" color={Colors.SECONDARY_50} size={12} />
  //         )}
  //       </Styled.MenuItem>
  //     ))}
  //   </Styled.Menu>
  // );

  // eslint-disable-next-line react/prop-types
  // function renderPopperContentByRequestDate({ closePopper }) {
  //   return (
  //     <Styled.Menu>
  //       {Object.keys(SORT_BY_DATE).map((sortKey) => (
  //         <Styled.MenuItem
  //           key={sortKey}
  //           onClick={() => {
  //             setSortOptions({ requestDateSort: sortKey });
  //             closePopper();
  //           }}
  //         >
  //           {t('memberPage.sortText', { text: SORT_BY_DATE[sortKey] })}
  //           {sortKey === sortOptions?.requestDateSort && (
  //             <Icomoon className="check" color={Colors.SECONDARY_50} size={12} />
  //           )}
  //         </Styled.MenuItem>
  //       ))}
  //     </Styled.Menu>
  //   );
  // }

  function _renderTableContent(type) {
    switch (type) {
      case ORGANIZATION_MEMBER_TYPE.PEOPLE_GUEST:
      case ORGANIZATION_MEMBER_TYPE.PEOPLE_MEMBER:
        return (
          <>
            <Styled.HeaderItem $dateJoin $hideInMobile item sm={2} xs={2}>
              <Styled.HeaderText>{t('memberPage.dateJoined')}</Styled.HeaderText>
              <Styled.PopperButton
                ButtonComponent="span"
                renderPopperContent={renderPopperContentByJoinedDate}
                popperProps={popperHeaderProps}
              >
                <Styled.HeaderText button>
                  <Icomoon className="dropdown" color={Colors.NEUTRAL_50} size={8} />
                </Styled.HeaderText>
              </Styled.PopperButton>
            </Styled.HeaderItem>
            <Styled.HeaderItem $hideInMobile item sm={2} xs={2}>
              <Styled.HeaderText>{t('memberPage.lastActivity')}</Styled.HeaderText>
              {/* <Styled.PopperButton
                ButtonComponent="span"
                renderPopperContent={renderPopperContentByLastActivity}
                popperProps={popperHeaderProps}
              >
                <Styled.HeaderText button>
                  <Icomoon
                    className="dropdown"
                    color={Colors.NEUTRAL_50}
                    size={8}
                  />
                </Styled.HeaderText>
              </Styled.PopperButton> */}
            </Styled.HeaderItem>
            <Styled.HeaderItem item sm={1} xs={1} />
          </>
        );
      case ORGANIZATION_MEMBER_TYPE.PEOPLE_REQUEST_ACCESS:
        return (
          <Styled.HeaderItem $hideInMobile item sm={4} xs={4}>
            <Styled.HeaderText>{t('memberPage.requestDate')}</Styled.HeaderText>
            {/* <Styled.PopperButton
              ButtonComponent="span"
              renderPopperContent={renderPopperContentByRequestDate}
              popperProps={popperHeaderProps}
            >
              <Styled.HeaderText button>
                <Icomoon
                  className="dropdown"
                  color={Colors.NEUTRAL_50}
                  size={8}
                />
              </Styled.HeaderText>
            </Styled.PopperButton> */}
          </Styled.HeaderItem>
        );
      case ORGANIZATION_MEMBER_TYPE.MEMBER:
        return (
          <Styled.HeaderItem $hideInMobile item sm={4} xs={4}>
            <Styled.HeaderText>{t('common.email').toUpperCase()}</Styled.HeaderText>
            {/* <Styled.PopperButton
              ButtonComponent="span"
              renderPopperContent={({ closePopper }) => _renderPopperContentByName({ closePopper, sortType: 'emailSort' })}
              popperProps={popperHeaderProps}
            >
              <Styled.HeaderText button>
                <Icomoon
                  className="dropdown"
                  color={Colors.NEUTRAL_50}
                  size={8}
                />
              </Styled.HeaderText>
            </Styled.PopperButton> */}
          </Styled.HeaderItem>
        );
      default:
        break;
    }
  }

  const renderPagination = () => {
    if (searchKey && users.length < 10) {
      return null;
    }
    if (users.length > 0) {
      return (
        <OrganizationListPagination
          limit={limit}
          setLimit={setLimit}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
          totalItem={totalItem}
          defaultPage={DEFAULT_PAGE}
        />
      );
    }
    return null;
  };

  function renderList() {
    const isTabRequestAccess = type === ORGANIZATION_MEMBER_TYPE.PEOPLE_REQUEST_ACCESS;
    const isShowLoading = loading && (isTabRequestAccess || networkStatus !== NetworkStatus.refetch);

    if (isShowLoading) {
      return isEnableReskin ? (
        <OrganizationListLoading listType={type} />
      ) : (
        <OrganizationListSkeleton listToShow={type} />
      );
    }

    if (error) {
      const modalSettings = {
        type: ModalTypes.ERROR,
        title: t('memberPage.failToSearchMembers'),
        message: t('memberPage.pleaseTryToReloadThePage'),
        confirmButtonTitle: t('common.ok'),
        useReskinModal: true,
        confirmButtonProps: {
          withExpandedSpace: true,
        },
      };

      return openModal(modalSettings);
    }

    if (isEnableReskin) {
      if (users.length === 0 && !loading) {
        return isEnableReskin ? (
          <OrganizationListEmptyList searchKey={searchKey} />
        ) : (
          <Styled.NoResultWrapper>
            <Styled.ImageNotFound src={MemberNotFound} alt="Member Not Found" />
            <Styled.TextNotFound>
              {searchKey ? t('memberPage.noResult') : t('memberPage.noMembersInList')}
            </Styled.TextNotFound>
          </Styled.NoResultWrapper>
        );
      }
      return (
        <div className={styles.listWrapper} data-disabled={loading}>
          {users.map((member) => (
            <MemberOrgRow
              key={member._id}
              listToShow={type}
              member={member}
              refetchList={() => afterRemovingUser(totalItem)}
              networkStatus={networkStatus}
              checkTransferTeams={checkTransferTeams}
              currentPaymentMethod={currentPaymentMethod}
              isFetchedCard={isFetchedCard}
            />
          ))}
          {renderPagination()}
        </div>
      );
    }

    return (
      <Styled.ListContainer disabled={loading}>
        {users.map((member) => (
          <MemberOrgRow
            key={member._id}
            listToShow={type}
            member={member}
            refetchList={() => afterRemovingUser(totalItem)}
            networkStatus={networkStatus}
            checkTransferTeams={checkTransferTeams}
            currentPaymentMethod={currentPaymentMethod}
          />
        ))}
        {users.length !== 0 && (
          <OrganizationListPagination
            limit={limit}
            setLimit={setLimit}
            selectedPage={selectedPage}
            setSelectedPage={setSelectedPage}
            totalItem={totalItem}
            defaultPage={DEFAULT_PAGE}
          />
        )}

        {users.length === 0 && !loading && (
          <Styled.NoResultWrapper>
            <Styled.ImageNotFound src={MemberNotFound} alt="Member Not Found" />
            <Styled.TextNotFound>
              {searchKey ? t('memberPage.noResult') : t('memberPage.noMembersInList')}
            </Styled.TextNotFound>
          </Styled.NoResultWrapper>
        )}
      </Styled.ListContainer>
    );
  }

  if (isEnableReskin) {
    return <div className={styles.container}>{renderList()}</div>;
  }

  return (
    <Styled.Container>
      <Styled.Header container>
        <Styled.HeaderItem $hideInMobile item xs={4} sm={4}>
          <Styled.HeaderText>
            {isPendingMember ? t('memberPage.emailAddress') : t('memberPage.memberName')}
          </Styled.HeaderText>
          {/* <Styled.PopperButton
            ButtonComponent="span"
            renderPopperContent={({ closePopper }) => _renderPopperContentByName({ closePopper, sortType: isPendingMember ? 'emailSort' : 'nameSort' })}
            popperProps={{ parentOverflow: 'viewport' }}
          >
            <Icomoon className="dropdown" color={Colors.NEUTRAL_50} size={8} />
          </Styled.PopperButton> */}
        </Styled.HeaderItem>
        <Styled.HeaderItem item xs={10} sm={3}>
          <Styled.HeaderText>{t('memberPage.role')}</Styled.HeaderText>
          <Styled.TooltipWrapper>
            <Tooltip
              title={<RoleTooltip content={roleTooltipContent} />}
              tooltipStyle={tooltipStyle}
              placement="bottom"
            >
              <Icomoon className="info" size={12} color={Colors.NEUTRAL_60} />
            </Tooltip>
          </Styled.TooltipWrapper>
          {![ORGANIZATION_MEMBER_TYPE.PEOPLE_REQUEST_ACCESS, ORGANIZATION_MEMBER_TYPE.PEOPLE_PENDING_MEMBER].includes(
            type
          ) && (
            <Styled.PopperButton
              ButtonComponent="span"
              renderPopperContent={renderPopperContentByRole}
              popperProps={popperHeaderProps}
              $haveTooltip
            >
              <Icomoon className="dropdown" color={Colors.NEUTRAL_50} size={8} />
            </Styled.PopperButton>
          )}
        </Styled.HeaderItem>
        {_renderTableContent(type)}
      </Styled.Header>
      {renderList()}
    </Styled.Container>
  );
};

OrganizationList.propTypes = propTypes;
OrganizationList.defaultProps = defaultProps;

export default React.memo(OrganizationList);
