/* eslint-disable react/jsx-no-bind */
import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import PropTypes from 'prop-types';
import { debounce, reject } from 'lodash';

import CustomScroll from 'lumin-components/Shared/CustomScroll';
import Dialog from 'luminComponents/Dialog';
import MemberListItem from 'luminComponents/MemberListItem';
import SearchResultItem from 'luminComponents/SearchResultItem';
import ModalFooter from 'luminComponents/ModalFooter';
import SearchInput from 'luminComponents/Shared/SearchInput';
import ButtonIcon from 'luminComponents/Shared/ButtonIcon';
import Alert from 'lumin-components/Shared/Alert';
import { commonUtils, toastUtils } from 'utils';
import { teamServices, organizationServices, userServices } from 'services';
import {
  DEBOUNCED_SEARCH_TIME,
  EntitySearchType, ModalTypes, SearchUserStatus, STATUS_CODE,
} from 'constants/lumin-common';
import { WARNING_MESSAGE_CAN_NOT_INVITE_MEMBER } from 'constants/messages';
import { TOAST_DURATION_ERROR_INVITE_MEMBER } from 'constants/customConstant';
import { useTranslation } from 'hooks';
import { MAX_MEMBERS, ROLE } from '../../screens/Teams/TeamConstant';
import './AddMemberModal.scss';

function AddMemberModal(props) {
  const {
    team,
    onSaved,
    onClose,
    updateTeamById,
  } = props;
  const [members, setMembers] = useState([]);
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [error, setError] = useState('');
  const [isDisableSave, setIsDisableSave] = useState(true);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const membersRef = useRef(members);
  const currentEmail = useRef('');
  const onSearchDebounced = useRef(debounce(onSearch, DEBOUNCED_SEARCH_TIME)).current;
  const { t } = useTranslation();

  function addMemberToOrgTeam(member) {
    const isStatusValid = member.status === SearchUserStatus.USER_VALID;
    if (isStatusValid) {
      setMembers((prevMembers) => ([...prevMembers, { user: member, role: ROLE.MEMBER.toLowerCase() }]));
      setResults((prevResults) => reject(prevResults, ['email', member.email]));
    }
  }

  function removeUserFromReadyList(member) {
    setMembers((prevMembers) => prevMembers.filter((m) => m.user._id !== member.user._id));
  }

  function _renderRoleButton(member) {
    return (
      <div className="AddMemberModal__trash-icon-wrapper">
        <ButtonIcon onClick={() => removeUserFromReadyList(member)} size={32} icon="trash" />
      </div>
    );
  }

  async function _onSave() {
    try {
      setIsDisableSave(true);
      setSaving(true);
      const memberWillBeAdded = members.map((member) => ({
        userId: member.user._id,
        userEmail: member.user.email,
        role: member.role,
      }));
      const data = await organizationServices.inviteMemberToTeam({
        teamId: team._id,
        members: { luminUsers: memberWillBeAdded },
      });
      const { statusCode } = data;
      switch (statusCode) {
        case STATUS_CODE.SUCCEED: {
          toastUtils.openToastMulti({
            message: t('teamMember.memberHaveBeenAdded'),
            type: ModalTypes.SUCCESS,
          });
          break;
        }
        case STATUS_CODE.BAD_REQUEST:
          toastUtils.openToastMulti({
            message: t(WARNING_MESSAGE_CAN_NOT_INVITE_MEMBER),
            type: ModalTypes.WARNING,
            duration: TOAST_DURATION_ERROR_INVITE_MEMBER,
          });
          break;
        default:
          break;
      }
      const { data: { team: teamDetail } } = await teamServices.getTeamDetail(team._id);
      updateTeamById(teamDetail._id, teamDetail);
      onSaved();
      handleClose();
    } finally {
      setSaving(false);
      setIsDisableSave(false);
    }
  }
  function handleClose() {
    unstable_batchedUpdates(() => {
      onClose();
      setError('');
      setMembers([]);
      setInvitedMembers([]);
      setIsDisableSave(false);
    });
  }

  const filterAddedMemberList = (user) => membersRef.current.every((mem) => mem.user.email !== user.email);

  const injectDataToResults = (user) => ({
    ...user,
    disabled: user.status !== SearchUserStatus.USER_VALID,
  });

  async function onSearch(searchingEmail) {
    try {
      setLoading(true);
      const searchResults = await userServices.findUser({
        searchKey: searchingEmail,
        targetId: team._id,
        targetType: EntitySearchType.ORGANIZATION_TEAM,
        excludeUserIds: membersRef.current.map((m) => m.user._id),
      });
      currentEmail.current = searchingEmail;
      setResults(
        searchResults.filter(filterAddedMemberList).map(injectDataToResults),
      );
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const renderResult = useCallback((resultProps) => <SearchResultItem.TeamMember {...resultProps} />, []);

  useEffect(() => {
    const isEmptyInvitedList = members.length === 0 && invitedMembers.length === 0;
    const hasReachTotalMemberLimit = team.totalMembers === MAX_MEMBERS;
    const isOverInvitationLimit = (team.totalMembers + members.length) > MAX_MEMBERS;
    setIsDisableSave(isEmptyInvitedList || hasReachTotalMemberLimit || isOverInvitationLimit);
  }, [members, invitedMembers, team.totalMembers]);

  useEffect(() => {
    membersRef.current = members;
    onSearch(currentEmail.current);
  }, [members, invitedMembers]);

  return (
    <Dialog open onClose={handleClose} className="AddMemberModalWrapper">
      <div>
        <h2 className="AddMemberModal__title">{commonUtils.formatTitleCaseByLocale(t('createOrg.addMember'))}</h2>
        <div className="AddMemberModal__content">
          {error && (
            <Alert>
              {error}
            </Alert>
          )}
          <h2 className="AddMemberModal__content__label">{commonUtils.formatTitleCaseByLocale(t('createOrg.searchMember'))}</h2>
          <SearchInput
            resultComponent={renderResult}
            onSelect={addMemberToOrgTeam}
            onChange={onSearchDebounced}
            options={results}
            autoFocus
            loading={loading}
            placeholder={t('common.eg', { egText: 'lily@gmail.com' })}
          />
          {(members.length > 0 || invitedMembers.length > 0) && (
            <CustomScroll
              autoHide
              autoHeight
              autoHeightMax={250}
              autoHeightMin={250}
              className="AddMemberModal__content__members"
            >
              {members.map((member) => (
                <MemberListItem
                  key={member.user._id}
                  member={member}
                  rightElement={_renderRoleButton(member)}
                  noGutter
                  containerStyle={{ paddingRight: 12 }}
                />
              ))}
            </CustomScroll>
          )}
          <ModalFooter
            className="AddMemberModal__footer"
            onSubmit={_onSave}
            onCancel={handleClose}
            disabled={isDisableSave}
            label={t('common.save')}
            loading={saving}
          />
        </div>
      </div>
    </Dialog>
  );
}

AddMemberModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func,
  updateTeamById: PropTypes.func.isRequired,
  team: PropTypes.object,
};

AddMemberModal.defaultProps = {
  team: {},
  onSaved: () => {},
};

export default AddMemberModal;
