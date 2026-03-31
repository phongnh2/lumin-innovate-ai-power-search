import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { useSelector, shallowEqual } from 'react-redux';

import selectors from 'selectors';

import MaterialDialog from 'lumin-components/Dialog';

import teamServices from 'services/teamServices';

import { toastUtils } from 'utils';

import TransferTeamsContainer from './components/TransferTeamsContainer';
import TransferTeamsHeader from './components/TransferTeamsHeader';

import * as Styled from './ChangeTeamsOwnerModal.styled';

const propTypes = {
  teamAdmin: PropTypes.shape({
    _id: PropTypes.string,
    email: PropTypes.string,
  }),
  teamList: PropTypes.array,
  onAfterChanged: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  setTeamList: PropTypes.func.isRequired,
};
const defaultProps = {
  teamAdmin: {},
  teamList: [],
  onAfterChanged: () => {},
};
const useStyles = makeStyles({
  paper: {
    overflow: 'hidden',
    padding: 0,
  },
});
function ChangeTeamsOwnerModal({
  teamAdmin,
  teamList,
  onAfterChanged,
  onClose,
  setTeamList,
}) {
  const { email, _id: adminId } = teamAdmin;
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasError, setError] = useState(false);
  const classes = useStyles();
  const handleClose = () => {
    setVisible(false);
  };

  const openErrorToast = () => {
    handleClose();
    toastUtils.openUnknownErrorToast();
  };

  const onSubmit = async () => {
    try {
      setLoading(true);
      setError(false);
      const teams = teamList.map(({ _id, newAdmin }) => ({ teamId: _id, targetUserId: newAdmin._id }));
      const { teamsFailed: failedTeamIds } = await teamServices.transferListTeamOwnership(
        currentOrganization._id,
        adminId,
        teams,
      );
      unstable_batchedUpdates(() => {
        setLoading(false);
        if (!failedTeamIds.length) {
          handleClose();
          onAfterChanged();
          return;
        }

        const list = teamList.filter((team) => failedTeamIds.includes(team._id));
        if (list.length) {
          setError(true);
          setTeamList(list);
        } else {
          openErrorToast();
        }
      });
    } catch (e) {
      openErrorToast();
    }
  };

  const onCloseHOF = () => {
    setError(false);
    onClose();
  };

  useEffect(() => {
    if (teamList.length && email) {
      setVisible(true);
    }
  }, [teamList, email]);

  if (!visible) {
    return null;
  }

  return (
    <MaterialDialog
      open
      onExited={onCloseHOF}
      classes={classes}
    >
      <Styled.Container loading={loading}>
        <TransferTeamsHeader
          email={email}
          hasError={hasError}
        />
        <Styled.Divider />

        <TransferTeamsContainer
          teamAdmin={teamAdmin}
          loading={loading}
          teamList={teamList}
          setTeamList={setTeamList}
          onSubmit={onSubmit}
          onClose={handleClose}
          setError={setError}
        />
      </Styled.Container>
    </MaterialDialog>
  );
}

ChangeTeamsOwnerModal.propTypes = propTypes;
ChangeTeamsOwnerModal.defaultProps = defaultProps;

export default ChangeTeamsOwnerModal;
