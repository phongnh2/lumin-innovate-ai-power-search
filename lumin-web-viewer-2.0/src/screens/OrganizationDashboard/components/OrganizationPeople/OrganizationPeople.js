import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { batch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import useGetMembers from 'screens/OrganizationMember/hooks/useGetMembers';

import ButtonMaterial from 'lumin-components/ButtonMaterial';
import OrganizationListContext from 'lumin-components/OrganizationList/OrganizationListContext';
import AddMemberOrganizationModal from 'luminComponents/AddMemberOrganizationModal';
import Icomoon from 'luminComponents/Icomoon';
import OrganizationList from 'luminComponents/OrganizationList';
import OrganizationListHeader from 'luminComponents/OrganizationList/components/OrganizationListHeader';
import OrgMemberSegmentTab from 'luminComponents/OrgMemberSegmentTab';
import { localStorageHandlers } from 'luminComponents/PromptInviteUsersBanner/handlers';
import { CloseBannerReason } from 'luminComponents/PromptInviteUsersBanner/PromptInviteUsersBanner.types';

import {
  useEnableWebReskin,
  useIsMountedRef,
  useTranslation,
  useFetchPaymentCard,
  useRefetchOrganizationSignSeats,
} from 'hooks';

import { organizationServices } from 'services';

import logger from 'helpers/logger';

import { hotjarUtils } from 'utils';
import common from 'utils/common';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { ScimMemberManagementNotice } from 'features/SamlSso/components';

import { SEARCH_DELAY_TIME, SEARCH_PLACEHOLDER } from 'constants/customConstant';
import { HOTJAR_EVENT } from 'constants/hotjarEvent';
import { Colors } from 'constants/lumin-common';
import { ORGANIZATION_MEMBER_TYPE, ORG_PEOPLE_TAB_LIST_TYPE } from 'constants/organizationConstants';

import MemberSearchBar from './components/MemberSearchBar';
import SearchMemberInput from './components/SearchMemberInput';
import TabsSwitcher from './components/TabsSwitcher';
import withDashboardWindowTitle from '../withDashboardWindowTitle';

import styles from './OrganizationPeople.module.scss';

import './OrganizationPeople.scss';

const propTypes = {
  currentOrganization: PropTypes.object.isRequired,
  location: PropTypes.object,
  navigate: PropTypes.func,
  updateCurrentOrganization: PropTypes.func.isRequired,
  updateOrganizationInList: PropTypes.func.isRequired,
  setRightElement: PropTypes.func.isRequired,
};

const defaultProps = {
  location: {},
  navigate: () => {},
};

const tabMapping = {
  [ORG_PEOPLE_TAB_LIST_TYPE.member]: ORGANIZATION_MEMBER_TYPE.PEOPLE_MEMBER,
  [ORG_PEOPLE_TAB_LIST_TYPE.guest]: ORGANIZATION_MEMBER_TYPE.PEOPLE_GUEST,
  [ORG_PEOPLE_TAB_LIST_TYPE.pending]: ORGANIZATION_MEMBER_TYPE.PEOPLE_PENDING_MEMBER,
  [ORG_PEOPLE_TAB_LIST_TYPE.request]: ORGANIZATION_MEMBER_TYPE.PEOPLE_REQUEST_ACCESS,
};

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 10;

const getOrgPeopleTabList = (t) => [
  {
    id: '1',
    type: 'member',
    text: t('orgDashboardPeople.member'),
    toolTips: t('orgDashboardPeople.tooltipMember'),
  },
  {
    id: '2',
    type: 'guest',
    text: t('orgDashboardPeople.guest'),
    toolTips: t('orgDashboardPeople.tooltipGuest'),
  },
  {
    id: '3',
    type: 'pending',
    text: t('orgDashboardPeople.pendingInvite'),
    toolTips: t('orgDashboardPeople.toolTipPendingInvite'),
  },
  {
    id: '4',
    type: 'request',
    text: t('orgDashboardPeople.requestAccess'),
    toolTips: t('orgDashboardPeople.toolTipRequestAccess'),
  },
];

const OrganizationPeople = ({
  currentOrganization,
  location,
  navigate,
  updateCurrentOrganization,
  updateOrganizationInList,
  setRightElement,
}) => {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputParam = searchParams.get('searchInput') || '';
  const { shouldRefetchOrgList, shouldUpdateInnerMembersList } = location.state || {};
  const isRequestingAccessHash = location.hash === '#requesting-access';
  const associateDomains = currentOrganization?.data?.associateDomains || [];
  const emailParam = searchParams.get('email') || '';
  const domain = common.getDomainFromEmail(emailParam);
  const initTab =
    (isRequestingAccessHash && 'request') || (domain && !associateDomains.includes(domain) ? 'guest' : 'member');
  const [activeTab, setActiveTab] = useState(initTab);
  const [searchValue, setSearchValue] = useState(searchInputParam || emailParam);
  const [inputValue, setInputValue] = useState(searchInputParam || emailParam);
  const [segmentAmount, setSegmentAmount] = useState({
    member: 0,
    guest: 0,
    pending: 0,
    request: 0,
  });
  const [isOpenAddDialog, setOpenAddDialog] = useState(false);
  const isMountedRef = useIsMountedRef();

  const [sortOptions, setSortOptions] = useState({});
  const [selectedPage, setSelectedPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const orgPeopleTabList = getOrgPeopleTabList(t);

  const {
    loading,
    error,
    data: members,
    refetch,
    networkStatus,
  } = useGetMembers({
    type: tabMapping[activeTab],
    limit,
    selectedPage,
    sortOptions,
    searchKey: searchValue,
  });

  const [isFetchedCard, setIsFetchedCard] = useState(false);

  const { currentPaymentMethod } = useFetchPaymentCard({
    clientId: currentOrganization.data?._id,
    setIsFetchedCard: () => setIsFetchedCard(true),
  });

  useRefetchOrganizationSignSeats({
    refetchList: refetch,
  });

  const transformEdgesToShow = (_edges) => _edges.map((item) => ({ ...item.node, ...item.node.user, user: undefined }));
  const { edges } =
    members?.getListRequestJoinOrganization ||
    members?.getMemberOfOrganization ||
    members?.getListPendingUserOrganization ||
    {};
  const users = transformEdgesToShow(edges || []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceSearch = useCallback(
    debounce((text = '') => {
      setSearchValue(text.trim());
    }, SEARCH_DELAY_TIME),
    []
  );

  const fetchTotalMember = useCallback(async () => {
    try {
      const { member, guest, pending, request } = await organizationServices.getTotalMembers({
        orgId: currentOrganization.data?._id,
      });
      const total = member + guest + pending;
      const updatedData = { totalMember: total };
      if (isMountedRef.current) {
        batch(() => {
          updateCurrentOrganization(updatedData);
          updateOrganizationInList(currentOrganization?.data._id, updatedData);
        });
        setSegmentAmount({
          member,
          guest,
          pending,
          request,
        });
      }
      if (isRequestingAccessHash && request === 0) {
        localStorageHandlers.setExpirationTime({
          orgId: currentOrganization.data?._id,
          show: false,
          reason: CloseBannerReason.HAS_NO_DATA,
        });
      }
    } catch (err) {
      logger.logError({ error: err });
    }
  }, [currentOrganization, isRequestingAccessHash]);

  useEffect(() => {
    if (shouldRefetchOrgList) {
      fetchTotalMember();
      refetch();
      navigate('', { replace: true });
    }
  }, [shouldRefetchOrgList]);

  useEffect(() => {
    if (currentOrganization.data?._id) {
      fetchTotalMember();
    }
  }, [currentOrganization.data?._id, activeTab]);

  useEffect(() => {
    if (
      shouldUpdateInnerMembersList &&
      [ORG_PEOPLE_TAB_LIST_TYPE.member, ORG_PEOPLE_TAB_LIST_TYPE.guest].includes(activeTab)
    ) {
      organizationServices.handleUpdateInnerMemberListWhenReceivedNewNotification(users, shouldUpdateInnerMembersList);
    }
    !isRequestingAccessHash && navigate('', { replace: true });
  }, [shouldUpdateInnerMembersList, isRequestingAccessHash]);

  const handleSetActiveTab = (type) => {
    batch(() => {
      setActiveTab(type);
      setInputValue('');
      setSearchValue('');
    });
    if (isRequestingAccessHash) {
      // prevent open modal when close and reload page
      navigate('', { replace: true });
    }
  };

  const handleSearchValue = (e) => {
    const text = e.target.value;
    setInputValue(text);
    debounceSearch(text);
  };

  const handleOnSaveAddModal = () => {
    setOpenAddDialog(false);
    refetch();
    fetchTotalMember();
  };

  const handleOpenInviteMembersModal = () => {
    setOpenAddDialog(true);
    hotjarUtils.trackEvent(HOTJAR_EVENT.MODAL_VIEWED_INVITE_CIRCLE_MEMBER);
  };

  const renderButtonInvite = () => (
    <ButtonMaterial onClick={handleOpenInviteMembersModal} data-lumin-btn-name={ButtonName.INVITE_CIRCLE_MEMBER}>
      <Icomoon className="add-member" size={20} color={Colors.WHITE} style={{ marginRight: 8 }} />
      <span className="hide-in-mobile text">{t('memberPage.inviteMembers')}</span>
    </ButtonMaterial>
  );

  useEffect(() => {
    setRightElement(renderButtonInvite());
    return () => {
      setRightElement(null);
    };
  }, [setRightElement]);

  useEffect(() => {
    if (searchParams.get('modal') === 'invite_member') {
      handleOpenInviteMembersModal();
      searchParams.delete('modal');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  const getTitleTab = (_activeTab) => orgPeopleTabList.find((item) => _activeTab === item.type);
  const titleTab = getTitleTab(activeTab).text;

  const context = useMemo(
    () => ({
      loading,
      error,
      members,
      refetch,
      networkStatus,
    }),
    [error, loading, members, networkStatus, refetch]
  );

  const listType = useMemo(() => tabMapping[activeTab], [activeTab]);

  return (
    <section className={isEnableReskin && styles.container}>
      <ScimMemberManagementNotice style={{ marginTop: 0 }} />
      {isEnableReskin ? (
        <TabsSwitcher segmentAmount={segmentAmount} selectedTab={activeTab} onTrigger={handleSetActiveTab} />
      ) : (
        <div className="OrganizationMembers__tabList">
          {orgPeopleTabList.map((item) => (
            <OrgMemberSegmentTab
              key={item.id}
              amount={segmentAmount[item.type]}
              text={item.text}
              toolTips={item.toolTips}
              onClick={() => handleSetActiveTab(item.type)}
              isActived={activeTab === item.type}
            />
          ))}
        </div>
      )}
      {isEnableReskin ? (
        <div className={styles.header}>
          <MemberSearchBar
            title={titleTab}
            autoFocus={Boolean(emailParam)}
            searchValue={inputValue}
            onSearch={handleSearchValue}
            onInviteMembers={handleOpenInviteMembersModal}
          />
          {searchValue && !users.length ? null : (
            <OrganizationListHeader
              listType={listType}
              isPendingMember={listType === ORGANIZATION_MEMBER_TYPE.PEOPLE_PENDING_MEMBER}
              setSortOptions={setSortOptions}
              sortOptions={sortOptions}
              totalSignSeats={currentOrganization.data?.totalSignSeats}
              availableSignSeats={currentOrganization.data?.availableSignSeats}
            />
          )}
        </div>
      ) : (
        <div className="OrgMemberSegmentTab__wrapper">
          <div className="OrgMemberSegmentTab__searchWrapper">
            <h2 className="OrganizationMembers__subtitle">{titleTab}</h2>
            <SearchMemberInput
              autoFocus={Boolean(emailParam)}
              value={inputValue}
              onChange={handleSearchValue}
              placeholder={t(SEARCH_PLACEHOLDER.SEARCH_EMAIL)}
            />
          </div>
        </div>
      )}
      <OrganizationListContext.Provider value={context}>
        <OrganizationList
          sortOptions={sortOptions}
          setSortOptions={setSortOptions}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
          limit={limit}
          setLimit={setLimit}
          searchText={searchValue}
          fetchTotalMember={fetchTotalMember}
          type={listType}
          totalSignSeats={currentOrganization.data?.totalSignSeats}
          availableSignSeats={currentOrganization.data?.availableSignSeats}
          currentPaymentMethod={currentPaymentMethod}
          isFetchedCard={isFetchedCard}
        />
      </OrganizationListContext.Provider>
      {isOpenAddDialog && (
        <AddMemberOrganizationModal open onClose={() => setOpenAddDialog(false)} onSaved={handleOnSaveAddModal} />
      )}
    </section>
  );
};

OrganizationPeople.propTypes = propTypes;
OrganizationPeople.defaultProps = defaultProps;

export default withDashboardWindowTitle(OrganizationPeople, 'common.people');
