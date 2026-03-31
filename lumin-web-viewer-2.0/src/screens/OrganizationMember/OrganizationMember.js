import { MenuList, MenuItem } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useReducer, useEffect, useState, useMemo, useCallback } from 'react';
import { batch, connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import Icomoon from 'lumin-components/Icomoon';
import OrganizationList from 'lumin-components/OrganizationList';
import OrganizationListContext from 'lumin-components/OrganizationList/OrganizationListContext';
import { LayoutSecondary } from 'luminComponents/Layout';

import withOrganizationTitle from 'HOC/withOrganizationTitle';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { organizationServices } from 'services';

import logger from 'helpers/logger';

import { hotjarUtils } from 'utils';
import { getPathnameWithoutLanguage } from 'utils/getLanguage';
import { lazyWithRetry } from 'utils/lazyWithRetry';

import { ScimMemberManagementNotice } from 'features/SamlSso/components';

import { DASHBOARD_ACTION } from 'constants/dashboardConstants';
import { HOTJAR_EVENT } from 'constants/hotjarEvent';
import { InviteUsersSetting } from 'constants/organization.enum';
import {
  ORGANIZATION_MEMBER_TYPE,
  ORGANIZATION_ROLES,
} from 'constants/organizationConstants';
import { Routers } from 'constants/Routers';

import TopSection from './components/TopSection';
import useGetMembers from './hooks/useGetMembers';
import { reducer, initialState } from './reducer';

import * as Styled from './OrganizationMember.styled';

import styles from './OrganizationMember.module.scss';

const AddMemberOrganizationModal = lazyWithRetry(() => import(/* webpackPrefetch: true */'luminComponents/AddMemberOrganizationModal'));
const OrganizationInfoModal = lazyWithRetry(() => import(/* webpackPrefetch: true */'luminComponents/OrganizationInfoModal'));
const EditOrganizationModal = lazyWithRetry(() => import(/* webpackPrefetch: true */'luminComponents/EditOrganizationModal'));

const propTypes = {
  currentOrganization: PropTypes.object,
  updateCurrentOrganization: PropTypes.func.isRequired,
  updateOrganizationInList: PropTypes.func.isRequired,
};

const defaultProps = {
  currentOrganization: {},
};

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 10;

const OrganizationMember = ({
  currentOrganization,
  updateCurrentOrganization,
  updateOrganizationInList,
}) => {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();
  const location = useLocation();
  const navigate = useNavigate();
  const urlSearch = new URLSearchParams(location.search);
  const { data, loading } = currentOrganization;
  const { shouldRefetchOrgList, shouldUpdateInnerMembersList } =
    location.state || {};
  const [state, dispatch] = useReducer(reducer, initialState);

  const [sortOptions, setSortOptions] = useState({});
  const [selectedPage, setSelectedPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const {
    loading: loadingMembers, error, data: members, refetch, networkStatus,
  } = useGetMembers({
    type: state.listToShow,
    limit,
    selectedPage,
    sortOptions,
    searchKey: state.searchText,
  });

  const transformEdgesToShow = (_edges) => _edges.map((item) => ({ ...item.node, ...item.node.user, user: undefined }));
  const { edges } =
    members?.getListRequestJoinOrganization ||
    members?.getMemberOfOrganization ||
    members?.getListPendingUserOrganization ||
    {};
  const users = transformEdgesToShow(edges || []);

  const { _id: orgId, userRole, url: orgUrl } = data || {};
  const currentUserRole = userRole.toUpperCase();
  const filteringPermission = [
      ORGANIZATION_ROLES.ORGANIZATION_ADMIN,
      ORGANIZATION_ROLES.BILLING_MODERATOR,
      ORGANIZATION_ROLES.TEAM_ADMIN,
    ].includes(currentUserRole) || data.settings.inviteUsersSetting === InviteUsersSetting.ANYONE_CAN_INVITE;

  const fetchCountingMembers = useCallback(async () => {
    try {
      const {
        pending,
        member,
        guest,
      } = await organizationServices.getTotalMembers({ orgId });
      const totalMembers = member + guest;
      dispatch({
        type: 'UPDATE_TOTAL_PENDING_MEMBERS',
        payload: { totalPendingMembers: pending },
      });
      dispatch({ type: 'UPDATE_TOTAL_MEMBERS', payload: { totalMembers } });
      if (
        pending === 0 &&
        state.listToShow === ORGANIZATION_MEMBER_TYPE.PEOPLE_PENDING_MEMBER
      ) {
        // eslint-disable-next-line no-use-before-define
        setChangeListToShow(ORGANIZATION_MEMBER_TYPE.MEMBER);
      }

      // eslint-disable-next-line no-use-before-define
      updateTotalMemberOrganization(pending + member + guest);
    } catch (error) {
      logger.logError({ error });
    }
  }, [orgId, state.listToShow]);

  const updateTotalMemberOrganization = (total) => {
    const updatedData = { totalMember: total };
    batch(() => {
      updateCurrentOrganization(updatedData);
      updateOrganizationInList(currentOrganization?.data._id, updatedData);
    });
  };

  const handleShowAddMemberModal = () => {
    if (urlSearch.get('action') === DASHBOARD_ACTION.INVITE_MEMBERS) {
      // eslint-disable-next-line no-use-before-define
      toggleAddDialog(true);
      hotjarUtils.trackEvent(HOTJAR_EVENT.MODAL_VIEWED_INVITE_CIRCLE_MEMBER);
    }
  };

  useEffect(() => {
    fetchCountingMembers();
    handleShowAddMemberModal();
    return () => {
      dispatch({
        type: 'UPDATE_TOTAL_PENDING_MEMBERS',
        payload: { totalPendingMembers: 0 },
      });
    };
  }, []);

  useEffect(() => {
    if (shouldRefetchOrgList) {
      fetchCountingMembers();
      refetch();
      navigate(null, { replace: true });
    }
  }, [shouldRefetchOrgList]);

  useEffect(() => {
    if (shouldUpdateInnerMembersList) {
      organizationServices.handleUpdateInnerMemberListWhenReceivedNewNotification(
        users,
        shouldUpdateInnerMembersList,
      );
      navigate(null, { replace: true });
    }
  }, [shouldUpdateInnerMembersList]);

  const setChangeListToShow = (listToShow) => dispatch({ type: 'CHANGE_LIST_TO_SHOW', payload: { listToShow } });

  const updateListToShow = (listToShow) => setChangeListToShow(listToShow);

  // eslint-disable-next-line react/prop-types
  const renderPopperFilter = ({ closePopper }) => (
    <MenuList>
      <MenuItem
        onClick={() => {
          closePopper();
          updateListToShow(ORGANIZATION_MEMBER_TYPE.MEMBER);
        }}
      >
        <Icomoon className="user-plus" size={18} />
        {t('memberPage.showAddedMembers')}
        {state.listToShow === ORGANIZATION_MEMBER_TYPE.MEMBER && (
          <div className="OrganizationPeople__iconContainer">
            <Icomoon className="check" color="#3c80ef" size="14" />
          </div>
        )}
      </MenuItem>
      <MenuItem
        onClick={() => {
          closePopper();
          updateListToShow(ORGANIZATION_MEMBER_TYPE.PEOPLE_PENDING_MEMBER);
        }}
      >
        <Icomoon className="pending" size={18} />
        {t('memberPage.showPendingMembers')}
        {state.listToShow ===
          ORGANIZATION_MEMBER_TYPE.PEOPLE_PENDING_MEMBER && (
          <div className="OrganizationPeople__iconContainer">
            <Icomoon className="check" color="#3c80ef" size="14" />
          </div>
        )}
      </MenuItem>
    </MenuList>
  );

  const clearSearch = () => dispatch({ type: 'CLEAR_SEARCH' });

  const updateInputText = (str) => dispatch({ type: 'UPDATE_INPUT_TEXT', payload: { newText: str } });

  const updateSearchText = (str) => dispatch({ type: 'UPDATE_SEARCH_TEXT', payload: { newText: str } });

  const toggleInfoDialog = (isOpenOrgInfoDialog) => dispatch({ type: 'TOGGLE_ORG_INFO_DIALOG', payload: { isOpenOrgInfoDialog } });

  const toggleEditDialog = (isOpenEditDialog) => {
    if (isEnableReskin) {
      navigate(`${Routers.ORGANIZATION}/${orgUrl}/dashboard/settings`);
    }
    dispatch({ type: 'TOGGLE_ORG_EDIT_DIALOG', payload: { isOpenEditDialog } });
  };

  const toggleAddDialog = (isOpenAddDialog) => dispatch({ type: 'TOGGLE_ADD_DIALOG', payload: { isOpenAddDialog } });

  const handleOnSaveAddModal = () => {
    toggleAddDialog(false);
    refetch();
    fetchCountingMembers();
  };

  const withClearQueryParam = (callback) => (params) => {
    callback(params);
    navigate({ pathname: getPathnameWithoutLanguage(), search: '' }, { replace: true });
  };

  const context = useMemo(() => ({
      loading: loadingMembers,
      error,
      members,
      refetch,
      networkStatus,
    }),
    [error, loadingMembers, members, networkStatus, refetch]
  );

  if (loading) {
    return null;
  }

  const renderContent = () => (
    <>
      <ScimMemberManagementNotice style={{ marginBottom: 0 }} />
      <TopSection
        filteringPermission={filteringPermission}
        renderPopperFilter={renderPopperFilter}
        toggleEditDialog={toggleEditDialog}
        toggleAddDialog={toggleAddDialog}
        toggleInfoDialog={toggleInfoDialog}
        clearSearch={clearSearch}
        updateSearchText={updateSearchText}
        updateInputText={updateInputText}
        totalPendingMembers={state.totalPendingMembers}
        inputText={state.inputText}
        totalMembers={state.totalMembers}
        isReskin={isEnableReskin}
        sortOptions={sortOptions}
        setSortOptions={setSortOptions}
        listType={state.listToShow}
        isEmptySearchingResults={state.searchText && !users.length}
      />

      <OrganizationListContext.Provider value={context}>
        <OrganizationList
          sortOptions={sortOptions}
          setSortOptions={setSortOptions}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
          limit={limit}
          setLimit={setLimit}
          searchText={state.searchText}
          fetchTotalMember={fetchCountingMembers}
          type={state.listToShow}
          totalSignSeats={currentOrganization.data?.totalSignSeats}
          availableSignSeats={currentOrganization.data?.availableSignSeats}
        />
      </OrganizationListContext.Provider>

      {state.isOpenInfoDialog && (
        <OrganizationInfoModal open onClose={() => toggleInfoDialog(false)} />
      )}
      {state.isOpenAddDialog && (
        <AddMemberOrganizationModal
          open
          onClose={() => withClearQueryParam(toggleAddDialog)(false)}
          onSaved={handleOnSaveAddModal}
        />
      )}
      {state.isOpenEditDialog && (
        <EditOrganizationModal
          open
          onClose={() => toggleEditDialog(false)}
          onSaved={() => toggleEditDialog(false)}
        />
      )}
    </>
  );

  if (isEnableReskin) {
    return (
      <LayoutSecondary withScrollRef footer={false} isReskin={isEnableReskin}>
        <div className={styles.container}>{renderContent()}</div>
      </LayoutSecondary>
    );
  }

  return <Styled.Container>{renderContent()}</Styled.Container>;
};

OrganizationMember.propTypes = propTypes;
OrganizationMember.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  currentOrganization: selectors.getCurrentOrganization(state),
  teams: selectors.getTeams(state),
});

const mapDispatchToProps = (dispatch) => ({
  updateCurrentOrganization: (data) => dispatch(actions.updateCurrentOrganization(data)),
  updateOrganizationInList: (orgId, data) => dispatch(actions.updateOrganizationInList(orgId, data)),
});

export default compose(
  withOrganizationTitle('common.members'),
  connect(mapStateToProps, mapDispatchToProps),
)(OrganizationMember);
