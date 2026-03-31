import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import actions from 'actions';
import selectors from 'selectors';

import SettingSection from 'lumin-components/SettingSection';

import { useTranslation } from 'hooks';

import { organizationServices } from 'services';

import { toastUtils } from 'utils';

import { ModalTypes } from 'constants/lumin-common';
import { ORG_TEXT } from 'constants/organizationConstants';
import { TEAMS_TEXT } from 'constants/teamConstant';

function DeleteTeamSetting({ team }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};

  const text = {
    description: t('teamInsight.deleteTeamDes'),
    delete: t('teamCommon.deleteTeam'),
    deleteTeamConfirm: t('teamCommon.deleteTeamConfirm'),
    message: (
      <Trans
        i18nKey="teamInsight.collaboratorsCanNoLongerAccess"
        components={{ b: <b /> }}
        values={{ name: team.name }}
      />
    ),
    toast: t('teamInsight.teamHasBeenDeleted'),
  };

  const onConfirmDelete = async () => {
    const teamId = team._id;
    dispatch(
      actions.updateModalProperties({
        isProcessing: true,
      })
    );
    await organizationServices.deleteOrganizationTeam(teamId);
    toastUtils.openToastMulti({
      type: ModalTypes.SUCCESS,
      message: text.toast,
    });
    batch(() => {
      dispatch(actions.removeTeamById(teamId));
      dispatch(actions.closeModal());
    });
    navigate(`/${ORG_TEXT}/${currentOrganization.url}/${TEAMS_TEXT}`);
  };

  const onDeleteTeam = () => {
    const settings = {
      type: ModalTypes.WARNING,
      title: text.deleteTeamConfirm,
      message: text.message,
      confirmButtonTitle: t('common.delete'),
      onCancel: () => {},
      onConfirm: onConfirmDelete,
      closeOnConfirm: false,
    };
    dispatch(actions.openModal(settings));
  };
  return (
    <SettingSection.DeleteResourceSettings
      heading={text.delete}
      text={text.description}
      renderButton={({ DeleteButton }) => <DeleteButton onDelete={onDeleteTeam}>{text.delete}</DeleteButton>}
    />
  );
}

DeleteTeamSetting.propTypes = {
  team: PropTypes.object.isRequired,
};

export default DeleteTeamSetting;
