/* eslint-disable import/order */
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider } from 'styled-components';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { isEmpty } from 'lodash';

import selectors from 'selectors';
import actions from 'actions';
import PopperButton from 'lumin-components/PopperButton';
import ButtonPermission from 'lumin-components/ButtonPermission';
import Popover from 'luminComponents/Shared/Popover';
import Tooltip from 'lumin-components/Shared/Tooltip';
import {
  Text,
  Divider,
  TextInput,
  Button,
  Menu,
  Icomoon,
  MenuItem,
  Paper,
} from 'lumin-ui/kiwi-ui';

import { ModalTypes, DOCUMENT_LINK_TYPE, DOCUMENT_ROLES, TIMEOUT } from 'constants/lumin-common';
import { DOCUMENT_TYPE, DocumentRole } from 'constants/documentConstants';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import { documentServices } from 'services';
import { toastUtils, getShareLink, errorUtils, file as fileUtils } from 'utils';
import {
  useEnableWebReskin,
  useGetCurrentTeam,
  useIsMountedRef,
  useTabletMatch,
  useThemeMode,
  useTranslation,
} from 'hooks';
import { ErrorCode } from 'constants/errorCode';
import ButtonIcon from 'lumin-components/Shared/ButtonIcon';
import * as Styled from './ShareSettingModal.styled';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import useCopyLinkPurpose from 'hooks/useCopyLinkPurpose';
import dayjs from 'dayjs';
import { Plans } from 'constants/plan';
import getOrgOfDoc from 'helpers/getOrgOfDoc';
import { DOCUMENT_TIME_LIMITED } from 'constants/urls';
import styles from './ShareSettingModal.module.scss';
import Title from 'luminComponents/ShareModal/components/Title';
import { handleUpdateShareSettingDocument } from './utils';
import logger from 'helpers/logger';

const getDocumentLinkTypeList = (t) => [
  {
    icon: 'security',
    reskinIcon: 'shield-md',
    title: t('modalShare.restricted'),
    role: DOCUMENT_LINK_TYPE.INVITED,
  },
  {
    icon: 'world',
    reskinIcon: 'world-md',
    title: t('modalShare.anyoneWithTheLink'),
    role: DOCUMENT_LINK_TYPE.ANYONE,
  },
];

const getShareSettingRolesList = (t) => [
  {
    icon: 'eye-open',
    reskinIcon: 'eye-md',
    title: t('modalShare.viewer'),
    description: t('modalShare.viewOnly'),
    role: DOCUMENT_ROLES.SPECTATOR,
  },
  {
    icon: 'comment',
    reskinIcon: 'message-circle-md',
    title: t('modalShare.commenter'),
    description: t('modalShare.viewAndComment'),
    role: DOCUMENT_ROLES.VIEWER,
  },
  {
    icon: 'edit-mode',
    reskinIcon: 'pencil-md',
    title: t('modalShare.editor'),
    description: t('modalShare.viewCommentAndEdit'),
    role: DOCUMENT_ROLES.EDITOR,
  },
];

export const TYPE_POPOVER = {
  LINK_TYPE: 'LINK_TYPE',
  SETTING_ROLES: 'SETTING_ROLES',
};

const DESCRIPTION_ANYONE = {
  [DOCUMENT_ROLES.EDITOR]: 'modalShare.anyoneOnTheInternetCanEditWithLink',
  [DOCUMENT_ROLES.VIEWER]: 'modalShare.anyoneOnTheInternetCanCommentWithLink',
  [DOCUMENT_ROLES.SPECTATOR]: 'modalShare.anyoneOnTheInternetCanViewWithLink',
};

const getLinkTypeDesc = (t) => ({
  [DOCUMENT_LINK_TYPE.INVITED]: {
    title: t('modalShare.restricted'),
    getDescription: () => t('modalShare.onlySharedPeopleCanAccessWithLink'),
  },
  [DOCUMENT_LINK_TYPE.ANYONE]: {
    title: t('modalShare.anyoneWithTheLink'),
    getDescription: (role) => t(DESCRIPTION_ANYONE[role]),
  },
});

export const DOCUMENT_ROLES_DESC = {
  [DOCUMENT_ROLES.EDITOR]: 'modalShare.editor',
  [DOCUMENT_ROLES.VIEWER]: 'modalShare.commenter',
  [DOCUMENT_ROLES.SPECTATOR]: 'modalShare.viewer',
};

const ShareSettingModal = ({
  currentDocument,
  handleClose,
  updateDocument,
  openHitDocStackModal,
  isShareLinkModal,
  canUpdateShareSetting,
}) => {
  const { isEnableReskin } = useEnableWebReskin();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isTabletUp = useTabletMatch();
  const isMounted = useIsMountedRef();
  const [saving, setSaving] = useState(false);
  const { shareSetting, documentType } = currentDocument;
  const [linkType, setLinkType] = useState(shareSetting.linkType);
  const [permission, setPermission] = useState(shareSetting.permission);
  const [subTitle, setSubTitle] = useState('');
  const [isCopy, setIsCopy] = useState(false);
  const [typePopover, setTypePopover] = useState('');
  const isDocTeam = documentType === DOCUMENT_TYPE.ORGANIZATION_TEAM;
  const isPersonalDoc = documentType === DOCUMENT_TYPE.PERSONAL;
  const buttonPermissionClasses = Styled.useButtonPermissionStyles();
  const linkTypeDesc = getLinkTypeDesc(t);
  const copyLinkPurpose = useCopyLinkPurpose('secondary');

  const currentTeam = useGetCurrentTeam() || {};
  const organizations = useSelector(selectors.getOrganizationList, shallowEqual);
  const orgOfDoc = getOrgOfDoc({ organizations, currentDocument });
  const { totalMembers: membersTeam } = currentTeam;

  const getTextSubTitle = (shareesLength) => {
    if (isDocTeam) {
      const title = isEnableReskin ? 'modalShare.shareMemberReskin' : 'modalShare.shareTeamMember';
      const pluralTitle = isEnableReskin ? 'modalShare.shareMemberAndMoreReskin' : 'modalShare.shareTeamMemberAndMore';
      return shareesLength > 0
        ? t(pluralTitle, { membersLength: membersTeam, shareesLength })
        : t(title, { membersLength: membersTeam });
    }
    if (isPersonalDoc) {
      return shareesLength > 0 && t('modalShare.shareWithUsers', { shareesLength });
    }
    const { totalMember: membersOrg } = orgOfDoc;
    const pluralTitle = isEnableReskin ? 'modalShare.shareMemberAndMoreReskin' : 'modalShare.shareCircleMemberAndMore';
    const title = isEnableReskin ? 'modalShare.shareMemberReskin' : 'modalShare.shareCircleMember';
    return shareesLength > 0
      ? t(pluralTitle, { membersLength: membersOrg, shareesLength })
      : t(title, { membersLength: membersOrg });
  };

  const getSubTitle = async () => {
    try {
      const shareesList = await documentServices.getShareInviteByEmailList({ documentId: currentDocument._id });
      const shareesLength = shareesList.filter((sharee) => sharee.role !== DocumentRole.OWNER).length;
      setSubTitle(getTextSubTitle(shareesLength));
    } catch (err) {
      logger.logError({ error: err });
    }
  };

  const isPublicLink = linkType === DOCUMENT_LINK_TYPE.ANYONE;

  const themeMode = useThemeMode();
  const themeModeProvider = Styled.theme[themeMode];

  const shareLinkRef = useRef();
  const copyTimeout = useRef();

  const onCopyShareLink = () => {
    shareLinkRef.current.select();
    document.execCommand('copy');
    setIsCopy(true);
    copyTimeout.current = setTimeout(() => {
      setIsCopy(false);
    }, TIMEOUT.COPY);
    toastUtils.success({ message: t('modalShare.hasBeenCopied'), useReskinToast: true });
  };

  const getModalTitle = () => {
    if (isShareLinkModal && currentDocument.name) {
      return `${t('common.share')} “${fileUtils.getFilenameWithoutExtension(currentDocument.name)}” `;
    }
    return t('modalShare.shareWithOthers');
  };

  useEffect(() => {
    getSubTitle();
    return () => clearTimeout(copyTimeout.current);
  }, []);

  const disableShareSettingRightSideBar = isShareLinkModal && !canUpdateShareSetting;

  const handleUpdateShareSetting = async () => {
    if (disableShareSettingRightSideBar) {
      handleClose();
      return;
    }
    try {
      setSaving(true);
      const {
        data: { updateShareSetting },
      } = await documentServices.updateShareSettingDocument({
        permission,
        linkType,
        documentId: currentDocument._id,
      });
      if (updateShareSetting) {
        handleUpdateShareSettingDocument({ currentDocument, updateDocument, updateShareSetting });
        handleClose();
      }
      toastUtils.success({ message: t('modalShare.permissionHasBeenUpdated'), useReskinToast: isEnableReskin });
    } catch (error) {
      const { code: errorCode } = errorUtils.extractGqlError(error);
      if (errorCode === ErrorCode.Document.ORG_REACHED_DOC_STACK_LIMIT) {
        openHitDocStackModal();
      } else {
        toastUtils.openToastMulti({
          type: ModalTypes.ERROR,
          message: t('common.somethingWentWrong'),
          useReskinToast: isEnableReskin,
        });
      }
    } finally {
      if (isMounted.current) {
        setSaving(false);
      }
    }
  };

  const beforeUpdateShareSetting = async () => {
    if (isEmpty(orgOfDoc)) {
      await handleUpdateShareSetting();
      return;
    }
    const {
      payment: { type },
    } = orgOfDoc;
    if (
      shareSetting.linkType === DOCUMENT_LINK_TYPE.ANYONE &&
      linkType === DOCUMENT_LINK_TYPE.INVITED &&
      type === Plans.FREE
    ) {
      const { createdAt } = currentDocument;
      const createdAtDate = dayjs(Number(createdAt));
      const [duration, unit] = DOCUMENT_TIME_LIMITED.split(' ');
      const isOverTimeLimit = dayjs().diff(createdAtDate, unit) >= duration;
      if (isOverTimeLimit) {
        dispatch(
          actions.openModal({
            type: ModalTypes.WARNING,
            title: t('modalUnpublishDocument.title'),
            message: t('modalUnpublishDocument.message'),
            confirmButtonTitle: t('modalUnpublishDocument.unpublish'),
            onCancel: () => {},
            onConfirm: handleUpdateShareSetting,
            useReskinModal: true,
          })
        );
        return;
      }
    }
    await handleUpdateShareSetting();
  };

  const renderPopover = ({ closePopper }) => {
    const documentLinkTypeList = getDocumentLinkTypeList(t);
    const shareSettingRolesList = getShareSettingRolesList(t);
    const list = typePopover === TYPE_POPOVER.LINK_TYPE ? documentLinkTypeList : shareSettingRolesList;
    const isPopoverLinkType = typePopover === TYPE_POPOVER.LINK_TYPE;
    const isPopoverSettingRole = typePopover === TYPE_POPOVER.SETTING_ROLES;

    const handleClickItem = (role) => {
      isPopoverLinkType && setLinkType(role);
      isPopoverSettingRole && setPermission(role);
      closePopper();
    };

    return (
      <Popover closePopper={closePopper}>
        {({ renderItem }) => list.map((item) => renderItem({
              value: item.title,
              text: item.title,
              icon: item.icon,
              key: item.role,
              onClick: () => handleClickItem(item.role),
        }))}
      </Popover>
    );
  };

  const renderModalTitle = () => (
    <Styled.TitleWrapper>
      {!isShareLinkModal && (
        <Tooltip title={t('modalShare.backToShareModal')}>
          <ButtonIcon onClick={handleClose} size={32} icon="arrow-left" />
        </Tooltip>
      )}
      <Styled.Title inShareLinkModal={isShareLinkModal}>{getModalTitle()}</Styled.Title>
    </Styled.TitleWrapper>
  );

  const renderUpdateShareSetting = () => {
    if (disableShareSettingRightSideBar) {
      return null;
    }
    const documentLinkTypeList = getDocumentLinkTypeList(t);
    const shareSettingRolesList = getShareSettingRolesList(t);
    if (isEnableReskin) {
      return (
        <div className={styles.shareSettingWrapper}>
          <Menu
            position="bottom-start"
            width={216}
            offset={4}
            ComponentTarget={
              <Button
                variant="text"
                endIcon={<Icomoon type="chevron-down-md" size="md" />}
                className={styles.shareSettingButton}
              >
                {linkTypeDesc[linkType].title}
              </Button>
            }
          >
            <>
              {documentLinkTypeList.map((item) => (
                <MenuItem
                  key={item.role}
                  leftIconProps={{ type: item.reskinIcon }}
                  onClick={() => setLinkType(item.role)}
                >
                  {item.title}
                </MenuItem>
              ))}
            </>
          </Menu>
          {isPublicLink && (
            <Menu
              position="top-end"
              width={180}
              ComponentTarget={
                <Button variant="text" endIcon={<Icomoon type="chevron-down-md" size="md" />}>
                  {t(DOCUMENT_ROLES_DESC[permission])}
                </Button>
              }
            >
              <>
                {shareSettingRolesList.map((item) => (
                  <MenuItem
                    key={item.role}
                    leftIconProps={{ type: item.reskinIcon }}
                    onClick={() => setPermission(item.role)}
                  >
                    {item.title}
                  </MenuItem>
                ))}
              </>
            </Menu>
          )}
        </div>
      );
    }
    return (
      <Styled.DropdownWrapper>
        <Styled.DropdownContainer>
          <PopperButton
            rootStyle={{
              height: 20,
              marginRight: 16,
            }}
            popperProps={{
              placement: 'bottom-start',
              disablePortal: false,
              parentOverflow: 'viewport',
              classes: `theme-${themeMode}`,
            }}
            classes={buttonPermissionClasses}
            ButtonComponent={ButtonPermission}
            renderPopperContent={renderPopover}
            onOpen={() => setTypePopover(TYPE_POPOVER.LINK_TYPE)}
          >
            {linkTypeDesc[linkType].title}
          </PopperButton>
        </Styled.DropdownContainer>

        {isPublicLink && (
          <PopperButton
            rootStyle={{
              height: 20,
              marginRight: 16,
            }}
            popperProps={{
              placement: 'bottom-start',
              disablePortal: false,
              parentOverflow: 'viewport',
              classes: `theme-${themeMode}`,
            }}
            ButtonComponent={ButtonPermission}
            renderPopperContent={renderPopover}
            onOpen={() => setTypePopover(TYPE_POPOVER.SETTING_ROLES)}
          >
            {t(DOCUMENT_ROLES_DESC[permission])}
          </PopperButton>
        )}
      </Styled.DropdownWrapper>
    );
  };

  if (isEnableReskin) {
    return (
      <Paper shadow="lg" radius="lg" p="var(--kiwi-spacing-3)">
        <Title
          onBack={handleClose}
          showBackButton={!isShareLinkModal}
          title={getModalTitle()}
        />
        {subTitle && (
          <Text type="body" size="md" className={styles.subTitle}>
            {subTitle}
          </Text>
        )}
        <Divider color="var(--kiwi-colors-surface-outline-variant)" my="var(--kiwi-spacing-2)" />
        <Text type="title" size="sm" className={styles.shareLinkText}>
          {t('modalShare.shareLink')}
        </Text>
        <div className={styles.inputWrapper}>
          <TextInput
            ref={shareLinkRef}
            type="text"
            readOnly
            value={getShareLink(currentDocument._id)}
            styles={{ input: { padding: '0 6px' } }}
          />
          <Button
            size="md"
            variant="outlined"
            onClick={onCopyShareLink}
            data-lumin-btn-name={ButtonName.COPY_LINK}
            data-lumin-btn-purpose={copyLinkPurpose}>
            {isCopy ? t('common.copied') : t('modalShare.copyLink')}
          </Button>
        </div>
        <Divider color="var(--kiwi-colors-surface-outline-variant)" my="var(--kiwi-spacing-2)" />
        {renderUpdateShareSetting()}
        <Text type="body" size="md" className={styles.descriptionText}>
          {linkTypeDesc[linkType].getDescription(permission)}
        </Text>
        <div className={styles.buttonWrapper}>
          <Button size="lg" onClick={beforeUpdateShareSetting} loading={saving} className={styles.button}>
            {t('common.done')}
          </Button>
        </div>
      </Paper>
    );
  }

  return (
    <ThemeProvider theme={themeModeProvider}>
      <Styled.Container inShareLinkModal={isShareLinkModal}>
        {renderModalTitle()}
        {subTitle && !isShareLinkModal && <Styled.SubTitle>{subTitle}</Styled.SubTitle>}
        <Styled.Divider />
        <Styled.LabelInput>{t('modalShare.shareLink')}</Styled.LabelInput>
        <Styled.InputWrapper>
          <Styled.Input ref={shareLinkRef} type="text" readOnly value={getShareLink(currentDocument._id)} />
          <Styled.ButtonCopy
            onClick={onCopyShareLink}
            data-lumin-btn-name={ButtonName.COPY_LINK}
            data-lumin-btn-purpose={copyLinkPurpose}
          >
            <span>{isCopy ? t('common.copied') : t('modalShare.copyLink')}</span>
          </Styled.ButtonCopy>
        </Styled.InputWrapper>
        <Styled.Divider />
        {renderUpdateShareSetting()}
        <Styled.SubTitle>{linkTypeDesc[linkType].getDescription(permission)}</Styled.SubTitle>
        <Styled.ButtonWrapper>
          <Styled.ButtonSubmit
            onClick={beforeUpdateShareSetting}
            loading={saving}
            size={isTabletUp ? ButtonSize.XL : ButtonSize.MD}
          >
            {t('common.done')}
          </Styled.ButtonSubmit>
        </Styled.ButtonWrapper>
      </Styled.Container>
    </ThemeProvider>
  );
};

ShareSettingModal.propTypes = {
  currentDocument: PropTypes.object,
  handleClose: PropTypes.func.isRequired,
  updateDocument: PropTypes.func,
  openHitDocStackModal: PropTypes.func,
  isShareLinkModal: PropTypes.bool,
  canUpdateShareSetting: PropTypes.bool,
};

ShareSettingModal.defaultProps = {
  currentDocument: {},
  updateDocument: () => {},
  openHitDocStackModal: () => {},
  isShareLinkModal: false,
  canUpdateShareSetting: false,
};

export default ShareSettingModal;
