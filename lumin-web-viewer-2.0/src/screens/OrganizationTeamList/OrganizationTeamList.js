import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { batch, connect } from 'react-redux';
import { compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import Loading from 'lumin-components/Loading';
import CreateTeamItem from 'luminComponents/CreateTeamItem';
import EmptyTeamList from 'luminComponents/EmptyTeamList/EmptyTeamList';
import TeamItemGrid from 'luminComponents/TeamItemGrid';

import withOrganizationTitle from 'HOC/withOrganizationTitle';

import { useEnableWebReskin } from 'hooks';
import useCreateTeam from 'hooks/useCreateTeam';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import HeaderSection from './components/HeaderSection';

import { StyledTeamGridContainer, StyledTeamGridItem } from './OrganizationTeamList.styled';

import styles from './OrganizationTeamList.module.scss';

const CreateTeamModal = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'luminComponents/CreateTeamModal'));

function OrganizationTeamList({
  currentOrganization,
  fetchCurrentOrganization,
  fetchOrganizations,
  isFetchingOrganization,
}) {
  const { url: orgUrl, teams: teamList } = currentOrganization;
  const { isEnableReskin } = useEnableWebReskin();
  const { onClose, onCreate, openCreateTeamModal, onCreateTeamClick } = useCreateTeam(currentOrganization);
  const fetchOrganization = () => {
    batch(() => {
      fetchCurrentOrganization(orgUrl);
      fetchOrganizations();
    });
  };

  const _renderTeamList = () => {
    if (!teamList.length) {
      return <EmptyTeamList onCreateTeamClick={onCreateTeamClick} />;
    }
    return (
      <StyledTeamGridContainer>
        <StyledTeamGridItem>
          <CreateTeamItem onClick={onCreateTeamClick} />
        </StyledTeamGridItem>
        {teamList.map((team) => (
          <StyledTeamGridItem key={team._id}>
            <TeamItemGrid team={team} />
          </StyledTeamGridItem>
        ))}
      </StyledTeamGridContainer>
    );
  };

  useEffect(() => {
    if (orgUrl) {
      fetchOrganization();
    }
  }, [orgUrl]);

  if (isFetchingOrganization) {
    return <Loading normal containerStyle={{ marginTop: 120 }} />;
  }

  return (
    <div className={isEnableReskin ? styles.teamListContainer : ''}>
      <HeaderSection />
      {_renderTeamList()}

      {openCreateTeamModal && <CreateTeamModal open onClose={onClose} onCreate={onCreate} />}
    </div>
  );
}

OrganizationTeamList.propTypes = {
  currentOrganization: PropTypes.object.isRequired,
  fetchCurrentOrganization: PropTypes.func.isRequired,
  fetchOrganizations: PropTypes.func.isRequired,
  isFetchingOrganization: PropTypes.bool.isRequired,
};

OrganizationTeamList.defaultProps = {};

const mapStateToProps = (state) => ({
  currentOrganization: selectors.getCurrentOrganization(state).data,
  isFetchingOrganization: selectors.getCurrentOrganization(state).loading,
});

const mapDispatchToProps = (dispatch) => ({
  fetchCurrentOrganization: (url) => dispatch(actions.fetchCurrentOrganization(url, { disabledLoading: true })),
  fetchOrganizations: () => dispatch(actions.fetchOrganizations({ disabledLoading: true })),
});

export default compose(
  withOrganizationTitle('common.teams'),
  connect(mapStateToProps, mapDispatchToProps),
  React.memo
)(OrganizationTeamList);
