import { throttle, debounce, reject } from 'lodash';
import { IconButton } from 'lumin-ui/kiwi-ui';
import React, {
  useContext, useRef, useEffect, useState, useMemo, useCallback,
} from 'react';
import Scrollbars from 'react-custom-scrollbars-2';

import MemberRoleOrganizationMenu from '@web-new-ui/components/MemberRoleOrganizationMenu/MemberRoleOrganizationMenu';

import UserResults from 'lumin-components/Shared/UserResults';
import Icomoon from 'luminComponents/Icomoon';
import MemberRoleOrganizationPopper from 'luminComponents/MemberRoleOrganizationPopper';
import SearchInput from 'luminComponents/Shared/SearchInput';

import { useEnableWebReskin, useTabletMatch, useTranslation } from 'hooks';

import { organizationServices, userServices } from 'services';

import { toastUtils, errorUtils, commonUtils } from 'utils';
import { FORM_INPUT_NAME } from 'utils/Factory/EventCollection/FormEventCollection';

import {
  DEBOUNCED_SEARCH_TIME, EntitySearchType, ErrorCode, SearchUserStatus,
} from 'constants/lumin-common';
import { ORG_ROLE_KEY, ORGANIZATION_ROLES } from 'constants/organizationConstants';
import { Colors } from 'constants/styles';

import { OrganizationCreateContext } from '../OrganizationCreate.context';
import styles from '../OrganizationCreate.module.scss';
import {
  StyledItem,
  StyledItemLabelWrapper,
  StyledItemContent,
  StyledScrollbarsWrapper,
  StyledScrollItem,
  StyledScrollItemRight,
  StyledScrollItemText,
  StyledInputLabel,
} from '../OrganizationCreate.styled';

const { isOrgAdmin } = organizationServices;

const _renderRoleButton = ({ member, onChangeRoleMember, t }) => {
  const isAdmin = isOrgAdmin(member.role);
  return (
    <StyledScrollItemRight $isAdmin={isAdmin} onClick={(e) => !isAdmin && onChangeRoleMember(e, member)}>
      <StyledScrollItemText className={`${member.role}`}>{t(ORG_ROLE_KEY[member.role])}</StyledScrollItemText>
      {!isAdmin && <Icomoon style={{ marginLeft: '12px' }} className="dropdown" size={10} color={Colors.NEUTRAL_60} /> }
    </StyledScrollItemRight>
  );
};

const SCROLL_BARS_HEIGHT_MAX = 230;
const SCROLL_BARS_HEIGHT_MAX_RESKIN = 200;
const SCROLL_BARS_HEIGHT_MIN = 0;

const AddMember = () => {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();
  const { state, setState } = useContext(OrganizationCreateContext);
  const [searching, setSearching] = useState(false);
  const isTabletUp = useTabletMatch();
  const currentEmail = useRef('');
  const memberList = [...state.members, ...state.pendingMembers];
  const membersRef = useRef(memberList);
  const searchDebounced = useRef(debounce(searchUser, DEBOUNCED_SEARCH_TIME)).current;
  const getCustomRightSpacing = !isTabletUp ? 7 : 5;
  const getCustomLeftSpacing = !isTabletUp ? 5 : 7;
  // eslint-disable-next-line no-use-before-define
  const onAddedMember = (member) => (!member._id ? handleAddedPendingMember(member) : handleAddedMember(member));
  const isAddedPendingMember = (email) => state.pendingMembers.some((_member) => _member.email === email);
  const isAddedMember = (memberId) => state.members.some((_member) => memberId === _member._id);
  const handleAddedPendingMember = (member) => {
    if (!isAddedPendingMember(member.email)) {
      setState((prev) => ({
        pendingMembers: [...prev.pendingMembers, { email: member.email, role: ORGANIZATION_ROLES.MEMBER }],
        searchUsers: reject(prev.searchUsers, ['email', member.email]),
      }));
    }
  };

  const handleAddedMember = (member) => {
    if (!isAddedMember(member._id)) {
      setState((prev) => ({
        members: [...prev.members, { ...member, role: ORGANIZATION_ROLES.MEMBER }],
        searchUsers: reject(prev.searchUsers, ['email', member.email]),
      }));
    }
  };

  const onScroll = useMemo(() => throttle(() => setState({ popperShow: false }), 100), []);

  const onChangeRoleMember = (event, member) =>
    setState({ selectedMember: member, anchorEl: event.currentTarget, popperShow: true });
  const handleRemovePendingUser = (_member) =>
    setState({ pendingMembers: state.pendingMembers.filter((member) => _member.email !== member.email) });

  const onRemovePendingUser = (member) => handleRemovePendingUser(member);
  const getId = (target) => target._id;
  const setSearchUsers = (newSearchUsers) => setState({ searchUsers: newSearchUsers });
  const filterAddedMemberList = (user) => membersRef.current.every((mem) => mem.email !== user.email);
  const injectDataToResults = (user) => ({
    ...user,
    disabled: user.status !== SearchUserStatus.USER_VALID,
  });

  async function searchUser(searchText) {
    setSearching(true);
    try {
      const searchResults = await userServices.findUser({
        searchKey: searchText,
        targetType: EntitySearchType.ORGANIZATION_CREATION,
        excludeUserIds: membersRef.current.map(getId),
      });
      currentEmail.current = searchText;
      setSearchUsers(
        searchResults.filter(filterAddedMemberList).map(injectDataToResults),
      );
    } catch (error) {
      const { code: errorCode } = errorUtils.extractGqlError(error);
      if (errorCode === ErrorCode.User.UNAVAILABLE_USER) {
        setSearchUsers([{ email: searchText, disabled: true, status: SearchUserStatus.USER_UNAVAILABLE }]);
      } else {
        toastUtils.openUnknownErrorToast();
      }
    } finally {
      setSearching(false);
    }
  }

  const _renderButtonTrash = (member) => (
    <StyledScrollItemRight>
      <Icomoon className="trash" size={20} color={Colors.NEUTRAL_60} onClick={() => onRemovePendingUser(member)} />
    </StyledScrollItemRight>
  );

  const _renderButtonTrashReskin = (member) => (
    <IconButton icon="trash-md" size="md" onClick={() => onRemovePendingUser(member)} />
  );

  const handleChangeMemberRole = (role) => {
    if (role === 'remove') {
      setState({ members: state.members.filter((member) => member.email !== state.selectedMember.email) });
    } else {
      setState({
        members: state.members.map((member) => {
          const newMember = { ...member };
          if (newMember.email === state.selectedMember.email) {
            newMember.role = role;
          }
          return newMember;
        }),
      });
    }
    setState({ popperShow: false });
  };

  const handleChangeMemberRoleReskin = ({ role, user }) => {
    if (role === 'remove') {
      setState({ members: state.members.filter((member) => member.email !== user.email) });
    } else {
      setState({
        members: state.members.map((member) => {
          const newMember = { ...member };
          if (newMember.email === user.email) {
            newMember.role = role;
          }
          return newMember;
        }),
      });
    }
  };

  const renderResult = useCallback((resultProps) => <UserResults {...resultProps} />, []);

  useEffect(() => {
    membersRef.current = memberList;
  }, [state.members, state.pendingMembers]);

  useEffect(() => {
    searchUser(currentEmail.current);
  }, [memberList.length]);

  const renderSearchInput = () => (
    <SearchInput
      name={FORM_INPUT_NAME.INVITED_EMAIL}
      disabled={state.isCreating}
      options={state.searchUsers}
      resultComponent={renderResult}
      onSelect={onAddedMember}
      onChange={searchDebounced}
      placeholder={t('common.eg', { egText: 'alice.metz@enlight.co' })}
      label={t('common.addMembersOptional')}
      loading={searching}
      isReskin={isEnableReskin}
    />
  );

  if (isEnableReskin) {
    return (
      <div>
        {renderSearchInput()}
        <div className={styles.memberListWrapper}>
          <Scrollbars
            renderView={(props) => <div {...props} className={styles.memberList} />}
            autoHide
            autoHeight
            autoHeightMax={SCROLL_BARS_HEIGHT_MAX_RESKIN}
            autoHeightMin={SCROLL_BARS_HEIGHT_MIN}
            hideTracksWhenNotNeeded
            onScroll={onScroll}
          >
            {state.members.map((member) => (
              <StyledScrollItem
                key={member._id}
                user={member}
                moreRightElement
                rightElement={
                  <MemberRoleOrganizationMenu
                    onChangeRole={handleChangeMemberRoleReskin}
                    currentRole={member.role}
                    user={member}
                  />
                }
                customRightSpacing={getCustomRightSpacing}
                customLeftSpacing={getCustomLeftSpacing}
                isReskin
              />
            ))}
            {state.pendingMembers.map((member) => (
              <StyledScrollItem
                key={member.email}
                user={member}
                moreRightElement
                rightElement={_renderButtonTrashReskin(member)}
                isReskin
              />
            ))}
          </Scrollbars>
        </div>
      </div>
    );
  }

  return (
    <>
      <StyledItem>
        <StyledItemLabelWrapper>
          <StyledInputLabel>{commonUtils.formatTitleCaseByLocale(t('common.addMembers'))}</StyledInputLabel>
        </StyledItemLabelWrapper>
        <StyledItemContent>
          {renderSearchInput()}
        </StyledItemContent>
      </StyledItem>
      <StyledScrollbarsWrapper>
        <Scrollbars
          autoHide
          autoHeight
          autoHeightMax={SCROLL_BARS_HEIGHT_MAX}
          autoHeightMin={SCROLL_BARS_HEIGHT_MIN}
          hideTracksWhenNotNeeded
          onScroll={onScroll}
        >
          {state.members.map((member) => (
            <StyledScrollItem
              key={member._id}
              user={member}
              moreRightElement
              rightElement={_renderRoleButton({ member, onChangeRoleMember, t })}
              customRightSpacing={getCustomRightSpacing}
              customLeftSpacing={getCustomLeftSpacing}
            />
          ))}
          {state.pendingMembers.map((member) => (
            <StyledScrollItem
              key={member.email}
              user={member}
              moreRightElement
              rightElement={_renderButtonTrash(member)}
            />
          ))}
        </Scrollbars>
      </StyledScrollbarsWrapper>
      {state.popperShow && (
        <MemberRoleOrganizationPopper
          open={state.popperShow}
          anchorEl={state.anchorEl}
          onSelected={handleChangeMemberRole}
          currentRole={state.selectedMember.role}
          handleClose={() => setState({ popperShow: false })}
          parentOverflow="viewport"
        />
      )}
    </>
  );
};

export default AddMember;
