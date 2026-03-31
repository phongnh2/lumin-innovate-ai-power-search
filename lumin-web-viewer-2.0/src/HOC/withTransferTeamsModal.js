import React, { useRef, useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import selectors from 'selectors';

import teamServices from 'services/teamServices';

const ChangeTeamsOwnerModal = React.lazy(() => import(/* webpackChunkName: 'ChangeTeamsOwnerModal' */ /* webpackPrefetch: true  */'../lumin-components/ChangeTeamsOwnerModal'));

const transformTeamList = (list) => list.map(({
  _id, name, avatarRemoteId, newAdmin = {}, totalMembers,
}) => ({
  _id,
  name,
  avatarRemoteId,
  newAdmin,
  totalMembers,
}));

const withTransferTeamsModal = (Component) => (props) => {
  const callbackRef = useRef(() => {});
  const teamAdminRef = useRef({});
  const [teamList, setTeamList] = useState([]);
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};

  const onClose = () => {
    setTeamList([]);
  };

  const checkTransferTeams = async (teamAdmin, callback) => {
    const { _id } = teamAdmin;
    try {
      const teams = await teamServices.getTeamsOfTeamAdmin(currentOrganization._id, _id);

      const teamsData = transformTeamList(teams.filter(({ totalMembers }) => totalMembers > 1));

      const canShowModal = teamsData.length > 0;

      if (canShowModal) {
        callbackRef.current = callback;
        teamAdminRef.current = teamAdmin;
        setTeamList(teamsData);
      } else {
        callback();
      }

      return canShowModal;
    } catch (e) {
      onClose();
      return false;
    }
  };

  return (
    <>
      <Component {...props} checkTransferTeams={checkTransferTeams} />
      <React.Suspense fallback={<div />}>
        <ChangeTeamsOwnerModal
          teamList={teamList}
          teamAdmin={teamAdminRef.current}
          setTeamList={setTeamList}
          onAfterChanged={callbackRef.current}
          onClose={onClose}
        />
      </React.Suspense>
    </>
  );
};

export default withTransferTeamsModal;
