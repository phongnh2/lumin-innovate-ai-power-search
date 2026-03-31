import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import { isEmpty, uniqBy } from 'lodash';
import { Button, CircularProgress, Icomoon, Tabs as KiwiTabs, Menu, Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useMemo, useReducer, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { shallowEqual, useSelector } from 'react-redux';

import IllustrationFind from 'assets/reskin/images/illustration-find.png';
import IllustrationNoPeopleDarkMode from 'assets/reskin/images/illustration-no-people.png';

import selectors from 'selectors';

import ButtonPermission from 'lumin-components/ButtonPermission';
import Loading from 'lumin-components/Loading';
import * as RequestAccessStyled from 'lumin-components/RequestAccessButtonGroup/RequestAccessButtonGroup.styled';
import Tabs from 'lumin-components/Shared/Tabs';
import * as ShareeListStyled from 'lumin-components/ShareeList/ShareeList.styled';
import * as ShareModalStyled from 'lumin-components/ShareModal/ShareModal.styled';
import InfiniteScroll from 'luminComponents/InfiniteScroll';
import MemberItem from 'luminComponents/MemberItem';
import SharePermissionPopover from 'luminComponents/ShareListItem/components/SharePermissionPopover';

import { useStylesWithTheme, useTabletMatch, useGetFolderType, useTranslation, useEnableWebReskin, useHomeMatch } from 'hooks';

import { organizationServices, documentServices } from 'services';

import logger from 'helpers/logger';

import { toastUtils } from 'utils';
import errorExtract from 'utils/error';
import documentPermissionsChecker from 'utils/Factory/DocumentPermissions';
import stringUtils from 'utils/string';

import { UserSharingType, DocumentRole, folderType } from 'constants/documentConstants';
import { DOCUMENT_ROLES, LOGGER, STATUS_CODE, THEME_MODE } from 'constants/lumin-common';
import { SHARE_DOCUMENT_LIST_TYPE, ORGANIZATION_ROLES } from 'constants/organizationConstants';
import { SOCKET_EMIT } from 'constants/socketConstant';
import { Breakpoints } from 'constants/styles';

import { initialState, reducer } from './reducer';
import { socket } from '../../../../socket';
import membersFormater from '../../helpers/membersFormater';
import DocumentMemberRolePopper from '../DocumentMemberRolePopper';
import RoleText from '../RoleText';

import './SharingList.scss';
import styles from './SharingList.module.scss';

const Styled = {
  ...ShareModalStyled,
  ...ShareeListStyled,
  ...RequestAccessStyled,
};

const useStyles = makeStyles({
  tab: {
    [`@media screen and (max-width: ${Breakpoints.md - 1}px)`]: {
      fontSize: 12,
      lineHeight: '16px',
    },
  },
});

const getTabs = ({ isTabletMatched, isMemberView, t }) =>
  isMemberView
    ? []
    : [
        {
          value: SHARE_DOCUMENT_LIST_TYPE.MEMBER,
          label: t('modalShare.memberList'),
        },
        {
          value: SHARE_DOCUMENT_LIST_TYPE.INVITED_EMAIL,
          label: isTabletMatched ? t('modalShare.peopleInvitedList') : t('modalShare.invitedList'),
        },
      ];

const documentRoles = [...Object.values(DOCUMENT_ROLES), ...Object.values(DocumentRole)];

const getPermissionsText = (t) => ({
  [DOCUMENT_ROLES.SPECTATOR]: t('sharePermission.canView'),
  [DOCUMENT_ROLES.VIEWER]: t('sharePermission.canComment'),
  [DOCUMENT_ROLES.EDITOR]: t('sharePermission.canEdit'),
  [DOCUMENT_ROLES.SHARER]: t('sharePermission.canShare'),
  [DOCUMENT_ROLES.OWNER]: t('sharePermission.docOwner'),
});

const propTypes = {
  onLoadMore: PropTypes.func,
  hasNextPage: PropTypes.bool,
  ownerId: PropTypes.string,
  currentDocument: PropTypes.object,
  updateMembersList: PropTypes.func,
  currentUser: PropTypes.object,
  currentUserRole: PropTypes.string,
  isFetching: PropTypes.bool,
  loading: PropTypes.bool.isRequired,
  listType: PropTypes.oneOf(Object.values(SHARE_DOCUMENT_LIST_TYPE)).isRequired,
  setListType: PropTypes.func.isRequired,
  members: PropTypes.array,
  themeMode: PropTypes.oneOf(Object.values(THEME_MODE)),
  documentRole: PropTypes.oneOf(documentRoles).isRequired,
  openPermissionDeniedModal: PropTypes.func,
};
const defaultProps = {
  onLoadMore: () => {},
  hasNextPage: false,
  ownerId: '',
  currentDocument: {},
  updateMembersList: () => {},
  currentUser: {},
  currentUserRole: '',
  isFetching: false,
  members: [],
  themeMode: THEME_MODE.LIGHT,
  openPermissionDeniedModal: () => {},
};

// eslint-disable-next-line sonarjs/cognitive-complexity
const SharingList = (props) => {
  const {
    onLoadMore,
    hasNextPage,
    currentDocument,
    updateMembersList,
    currentUserRole,
    ownerId,
    currentUser,
    isFetching,
    loading,
    listType,
    setListType,
    members: membersProp,
    themeMode,
    documentRole,
    openPermissionDeniedModal,
  } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const { data: organizationList, loading: orgListLoading } = useSelector(selectors.getOrganizationList, shallowEqual);
  const classes = useStylesWithTheme(useStyles);
  const currentFolderType = useGetFolderType();
  const { documentType, belongsTo } = currentDocument;
  const {
    location: { _id: ownerOrgId },
  } = belongsTo;
  const { _id: userId, name: userName, email: userEmail, avatarRemoteId } = currentUser;
  const { isEnableReskin } = useEnableWebReskin();

  const [scrollElement, setScrollElement] = useState();

  const getUserRoleInOrganization = () => {
    const foundOrganization = organizationList?.find(({ organization }) => organization._id === ownerOrgId) || {};
    return isEmpty(foundOrganization) ? documentRole.toUpperCase() : foundOrganization.role.toUpperCase();
  };

  const currentUserPermissionItem = {
    userId,
    name: userName,
    email: userEmail,
    avatarRemoteId,
    permission: documentRole.toUpperCase(),
    role: getUserRoleInOrganization(),
  };

  const permissionChecker = useMemo(
    () =>
      documentPermissionsChecker.from(documentType).createChecker({
        document: currentDocument,
        userRole: currentUserRole,
      }),
    [currentDocument, documentType, currentUserRole]
  );
  const isManager = permissionChecker.isManager();
  const isMember = permissionChecker.isMember();
  const canShare = permissionChecker.canShare();
  const isTabletMatched = useTabletMatch();
  const { t } = useTranslation();
  const isInvitedList = listType === SHARE_DOCUMENT_LIST_TYPE.INVITED_EMAIL;
  const { isRecentTab } = useHomeMatch();
  const hideOwner =
    ([folderType.ORGANIZATION, folderType.TEAMS].includes(currentFolderType) || isRecentTab) &&
    isManager &&
    isInvitedList;
  const tabs = getTabs({ isTabletMatched, isMemberView: !isManager, t });

  const members =
    !isManager && isInvitedList
      ? uniqBy(membersFormater([currentUserPermissionItem, ...membersProp]), '_id')
      : membersFormater(membersProp);

  const setStateToShowPopperMember = (newStatePopper, eventClick = {}, member = {}) =>
    dispatch({
      type: 'UPDATE_STATE_WHEN_CLICKED_DOCUMENT_MEMBER_ROLE',
      payload: {
        newStatePopperShow: newStatePopper,
        selectedMember: member,
        anchorMemberEl: eventClick.currentTarget,
      },
    });

  const isOwner = (member) => member.userId === ownerId;

  const isMe = ({ userId, _id }) => [userId, _id].includes(currentUser._id);

  const filterOwnerInInvitedList = (_members) => _members.filter((member) => !isOwner(member));

  const filteredMembers = hideOwner ? filterOwnerInInvitedList(members) : members;

  const setSelectedMember = (newSelectedMember) =>
    dispatch({
      type: 'UPDATE_SELECTED_MEMBER',
      payload: { newSelectedMember },
    });

  const handleClickUserRole = (event, member) => setStateToShowPopperMember(true, event, member);

  const setPopperShowMember = (newState) =>
    dispatch({
      type: 'UPDATE_POPPER_SHOW_MEMBER',
      payload: { popperShowMember: newState },
    });

  const updateDocumentPermission = async (targetPermission) => {
    const payloadToSend =
      listType === SHARE_DOCUMENT_LIST_TYPE.MEMBER
        ? { userId: state.selectedMember.userId }
        : { email: state.selectedMember.email };
    try {
      const data = await documentServices.updateDocumentPermission({
        documentId: currentDocument._id,
        role: targetPermission,
        email: state.selectedMember.email,
      });
      if (data.statusCode !== STATUS_CODE.SUCCEED) {
        return;
      }
      toastUtils.success({ message: t('common.updateSuccessfully'), useReskinToast: true });
      updateMembersList(targetPermission, listType, payloadToSend);
      setStateToShowPopperMember(false);
      socket.emit(SOCKET_EMIT.SHARE_PERMISSION, {
        type: 'UPDATE',
        documentId: currentDocument._id,
        role: targetPermission.toUpperCase(),
        id: state.selectedMember?.userId || state.selectedMember?._id,
      });
    } catch (error) {
      setPopperShowMember(false);
      const { message, statusCode } = errorExtract.extractGqlError(error);
      if (statusCode === STATUS_CODE.FORBIDDEN) {
        openPermissionDeniedModal();
      } else {
        toastUtils.openUnknownErrorToast();
      }
      logger.logError({ error, message });
    }
  };

  const renderRoleText = (_member) => {
    const permissionsText = getPermissionsText(t);

    if (_member?.type === UserSharingType.EXTERNAL) {
      return permissionsText[_member.role.toUpperCase()];
    }
    return _member.permission === DOCUMENT_ROLES.OWNER
      ? permissionsText[DOCUMENT_ROLES.SHARER]
      : permissionsText[_member.permission];
  };

  const handleRemoveMember = async () => {
    const targetPermission = 'REMOVE';
    const { email } = state.selectedMember;
    setStateToShowPopperMember(false);
    await documentServices.removeDocumentPermission({
      documentId: currentDocument._id,
      email,
    });
    logger.logInfo({
      message: LOGGER.EVENT.REMOVE_DOCUMENT_PERMISSION,
      reason: LOGGER.Service.HIGH_RISK_FUNCTIONALITY_INFO,
    });
    updateMembersList(targetPermission, listType, { email });
    socket.emit(SOCKET_EMIT.SHARE_PERMISSION, {
      type: 'DELETE',
      documentId: currentDocument._id,
      id: state.selectedMember?._id,
      linkType: currentDocument.shareSetting.linkType,
    });
  };

  const renderRoleButtonElement = ({ member, disableClick }) => {
    const roleMemberText = renderRoleText(member);
    if (isOwner(member)) {
      return <RoleText isOwner />;
    }

    if (!disableClick) {
      const extraMenuProps = scrollElement
        ? {
            closeOnScroll: { elementRef: { current: scrollElement } },
          }
        : {};
      return isEnableReskin ? (
        <Menu
          position="bottom-end"
          width={180}
          ComponentTarget={
            <Button
              variant="text"
              endIcon={<Icomoon type="chevron-down-md" size="md" />}
              onClick={(e) => {
                handleClickUserRole(e, member);
              }}
              data-cy="share_permision_selector"
            >
              {roleMemberText}
            </Button>
          }
          padding="var(--kiwi-spacing-1)"
          {...extraMenuProps}
        >
          <SharePermissionPopover
            value={(
              state.selectedMember?.permission ||
              state.selectedMember?.role?.toUpperCase() ||
              DOCUMENT_ROLES.SHARER
            ).toLowerCase()}
            canDelete={
              listType === SHARE_DOCUMENT_LIST_TYPE.INVITED_EMAIL &&
              DOCUMENT_ROLES.SHARER === documentRole.toUpperCase()
            }
            closePopper={() => setPopperShowMember(false)}
            handleChangePermission={(role) => updateDocumentPermission(role.toUpperCase())}
            handleRemoveMember={handleRemoveMember}
          />
        </Menu>
      ) : (
        <ButtonPermission onClick={(e) => handleClickUserRole(e, member)}>{roleMemberText}</ButtonPermission>
      );
    }
    return <RoleText isOwner={false} role={roleMemberText} />;
  };

  const renderRoleButtonMember = (member) => {
    const memberIsManager = organizationServices.isManager(member.role);
    const isDocOwner = ownerId === member.userId;
    const isDisableClick = isMe(member) || memberIsManager || isDocOwner || !canShare;

    return renderRoleButtonElement({
      member,
      disableClick: isDisableClick,
    });
  };

  const renderRoleButtonInvitedByEmail = (member) => {
    const memberIsSharer = stringUtils.isIgnoreCaseEqual(member.role, DOCUMENT_ROLES.SHARER);
    const isExternalSharer = !isMember && canShare;
    const isMemberSharer = isMember && canShare;

    const canExternalChangePerm = isExternalSharer && !memberIsSharer;

    const userCanShare = isManager || isMemberSharer || canExternalChangePerm;
    const shouldShowPopperRole = !isMe(member) && userCanShare;

    return renderRoleButtonElement({
      member,
      disableClick: !shouldShowPopperRole,
      showableCaret: shouldShowPopperRole,
    });
  };

  const renderRoleButtonByType = (member) => {
    switch (listType) {
      case SHARE_DOCUMENT_LIST_TYPE.MEMBER:
        return renderRoleButtonMember(member);
      case SHARE_DOCUMENT_LIST_TYPE.INVITED_EMAIL:
        return renderRoleButtonInvitedByEmail(member);
      default: {
        throw new Error('Invalid member type.');
      }
    }
  };

  const handleScroll = () => {
    if (state.selectedMember?.email) {
      unstable_batchedUpdates(() => {
        setSelectedMember({});
        setPopperShowMember(false);
      });
    }
  };

  const renderScroll = (_renderChild, isReskin) => {
    if (!filteredMembers.length) {
      const image = themeMode === THEME_MODE.DARK ? IllustrationNoPeopleDarkMode : IllustrationFind;
      return isReskin ? (
        <div className={styles.noResults}>
          <img src={image} alt="No people illustration" className={styles.illustration} />
          <Text type="body" size="lg" color="var(--kiwi-colors-surface-on-surface)" className={styles.info}>
            {t('modalShare.thereAreNoPeopleHere')}
          </Text>
        </div>
      ) : (
        <Styled.NoResults>{t('modalShare.thereAreNoPeopleHere')}</Styled.NoResults>
      );
    }
    // eslint-disable-next-line no-magic-numbers
    const maxHeightScroll = isReskin ? 284 : 300;
    if (listType === SHARE_DOCUMENT_LIST_TYPE.MEMBER) {
      return (
        <InfiniteScroll
          autoHeight
          autoHeightMin={0}
          autoHeightMax={maxHeightScroll}
          hasNextPage={hasNextPage}
          onLoadMore={onLoadMore}
          isFetchingData={isFetching}
          handleScrollParent={handleScroll}
          contentProps={{
            className: classNames({ [styles.listMembers]: isReskin }),
          }}
          setScrollElement={setScrollElement}
        >
          {_renderChild()}
          {isFetching && <Loading normal containerStyle={{ height: 64 }} />}
        </InfiniteScroll>
      );
    }
    return (
      <InfiniteScroll
        autoHeight
        autoHeightMin={0}
        autoHeightMax={maxHeightScroll}
        hasNextPage={false}
        onLoadMore={() => {}}
        handleScrollParent={handleScroll}
        className={classNames({ [styles.listMembers]: isReskin })}
        setScrollElement={setScrollElement}
      >
        {_renderChild()}
      </InfiniteScroll>
    );
  };

  const renderItem = () =>
    filteredMembers.map((member) => (
      <MemberItem
        isShowUserRole={
          listType === SHARE_DOCUMENT_LIST_TYPE.MEMBER &&
          (organizationServices.isManager(member.role) ||
            stringUtils.isIgnoreCaseEqual(ORGANIZATION_ROLES.TEAM_ADMIN, member.role) ||
            ownerId === member.userId)
        }
        selfControl
        key={member.email}
        isOwner={ownerId === member.userId}
        user={member}
        isMe={isMe(member)}
        className="SharingList__item"
        rightElement={renderRoleButtonByType(member)}
        documentType={documentType}
        disabled={loading}
        isReskin={isEnableReskin}
      />
    ));

  if (isEnableReskin) {
    return (
      <>
        {Boolean(tabs.length) && !loading && (
          <KiwiTabs mt="var(--kiwi-spacing-1)" value={listType} onChange={setListType}>
            <KiwiTabs.List grow className={styles.listTabs}>
              {tabs.map((tab) => (
                <KiwiTabs.Tab key={tab.value} value={tab.value}>
                  <Text type="label" size="md">
                    {tab.label}
                  </Text>
                </KiwiTabs.Tab>
              ))}
            </KiwiTabs.List>
          </KiwiTabs>
        )}
        <div className={styles.listUsers}>
          {loading || orgListLoading ? (
            <div className={styles.loadingWrapper}>
              <CircularProgress size="md" />
            </div>
          ) : (
            renderScroll(renderItem, true)
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <Styled.TabsContainer $isManagerView={isManager}>
        <Tabs
          tabs={tabs}
          onChange={setListType}
          value={listType}
          classes={{ tab: classes.tab }}
          activeBarColor={ShareModalStyled.theme[themeMode].activeBarTab}
          fullWidth
        />
      </Styled.TabsContainer>
      <div className={classNames('SharingList__list', 'Divider')}>
        {loading || orgListLoading ? (
          <div className="SharingList__loading-container">
            <Loading normal />
          </div>
        ) : (
          renderScroll(renderItem)
        )}
      </div>
      {state.popperShowMember && state.selectedMember?.email && (
        <DocumentMemberRolePopper
          open={state.popperShowMember}
          anchorEl={state.anchorMemberEl}
          onSelected={(targetRole) => updateDocumentPermission(targetRole)}
          currentDocumentRole={state.selectedMember?.permission || state.selectedMember?.role?.toUpperCase()}
          documentRole={documentRole}
          handleClose={() => setPopperShowMember(false)}
          listType={listType}
          handleRemoveMember={handleRemoveMember}
          themeMode={themeMode}
        />
      )}
    </>
  );
};

SharingList.propTypes = propTypes;
SharingList.defaultProps = defaultProps;

export default SharingList;
