/* eslint-disable @typescript-eslint/ban-ts-comment */
import classNames from 'classnames';
import { Icomoon as KiwiIcomoon, PlainTooltip, Avatar } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useRef } from 'react';

import DefaultOrgAvatar from 'assets/reskin/lumin-svgs/default-org-avatar.png';

import Icomoon from 'luminComponents/Icomoon';
import Tooltip from 'luminComponents/Shared/Tooltip';
import { useTransferDocumentContext } from 'luminComponents/TransferDocument/hooks';
import {
  DestinationLocation,
  ITransferDocumentContext,
} from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';

import { useTranslation, useTabletMatch, useEnableWebReskin } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import avatarUtils from 'utils/avatar';

import { RootTypes } from 'features/NestedFolders/constants';

import { FolderType } from 'constants/folderConstant';
import { Colors } from 'constants/styles';

import * as Styled from './LeftSideBar.styled';

import styles from './LeftSideBar.module.scss';

type LeftSideBarProps = {
  collapsed?: boolean;
  setDisplayToggleButton?: React.Dispatch<React.SetStateAction<boolean>>;
};

const LeftSideBar = ({ collapsed, setDisplayToggleButton }: LeftSideBarProps): JSX.Element => {
  const { getter, setter }: ITransferDocumentContext = useTransferDocumentContext();
  const { t } = useTranslation();
  const isTabletMatch = useTabletMatch();
  const { isEnableReskin } = useEnableWebReskin();
  const leftSidebarContainerRef = useRef<HTMLDivElement>();

  const { onKeyDown } = useKeyboardAccessibility();

  const { setSelectedTarget, setExpandedItem, setDestination, setPersonalTargetSelected, getNestedFolders } = setter;
  const { organizations, selectedTarget, personalData, getFolders, context, isPersonalTargetSelected, destination } =
    getter;

  const showPersonalSection = personalData.isOldProfessional;

  useEffect(() => {
    if (
      !destination.scrollTo ||
      destination.type !== DestinationLocation.ORGANIZATION ||
      !leftSidebarContainerRef.current
    ) {
      return;
    }
    const scrollToElement = leftSidebarContainerRef.current.querySelector(`[data-org-id="${destination.scrollTo}"]`);
    if (scrollToElement) {
      setDestination({
        ...destination,
        scrollTo: null,
      });
      scrollToElement.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }, [destination]);

  const renderNextArrow = (): JSX.Element =>
    !isTabletMatch && (
      <Styled.NextArrow>
        <Icomoon className="arrow-right-alt" size={12} color={Colors.NEUTRAL_100} />
      </Styled.NextArrow>
    );

  if (isEnableReskin) {
    return (
      <div
        ref={leftSidebarContainerRef}
        className={classNames(styles.container, 'custom-scrollbar-reskin')}
        data-collapsed={collapsed}
        onMouseEnter={() => setDisplayToggleButton(true)}
        onMouseLeave={() => setDisplayToggleButton(false)}
      >
        <div className={styles.content} data-collapsed={collapsed}>
          {showPersonalSection && (
            <Styled.PersonalSectionReskin
              role="button"
              tabIndex={0}
              data-cy="sidebar_personal_workspace_item"
              role="button"
              tabIndex={0}
              data-activated={isPersonalTargetSelected}
              onClick={() => {
                if (isPersonalTargetSelected) {
                  return;
                }
                setSelectedTarget(personalData.originUser);
                setDestination({
                  _id: personalData._id,
                  name: personalData.originUser.name,
                  type: DestinationLocation.PERSONAL,
                  belongsTo: {
                    _id: personalData._id,
                    type: DestinationLocation.PERSONAL,
                    data: personalData.originUser,
                  },
                });
                setPersonalTargetSelected(true);
                getFolders({ type: FolderType.PERSONAL, personalOnly: true });
                getNestedFolders({
                  rootType: RootTypes.Personal,
                  forcePersonalTarget: true,
                  withLoading: true,
                }).finally(() => {});
              }}
              onKeyDown={onKeyDown}
            >
              <KiwiIcomoon type="ph-user-circle-fill" size="lg" color="var(--kiwi-colors-surface-outline)" />
              <Styled.ItemNameReskin type="body" size="md" className={styles.text} data-collapsed={collapsed}>
                {personalData.originUser.name}
              </Styled.ItemNameReskin>
              {renderNextArrow()}
            </Styled.PersonalSectionReskin>
          )}
          <Styled.TitleReskin type="headline" size="xs">
            {t('organizations', { ns: 'terms' })}
          </Styled.TitleReskin>
          <Styled.LeftSideBarWrapperReskin>
            {organizations.map((organization) => (
              <Styled.ItemReskin
                role="button"
                tabIndex={0}
                key={organization._id}
                data-cy="sidebar_organization_item"
                data-org-id={organization._id}
                data-activated={selectedTarget._id === organization._id && !isPersonalTargetSelected}
                onClick={() => {
                  setSelectedTarget(organization);
                  setDestination({
                    _id: organization._id,
                    name: organization.name,
                    type: DestinationLocation.PERSONAL,
                    belongsTo: {
                      _id: organization._id,
                      name: organization.name,
                      type: DestinationLocation.ORGANIZATION,
                      data: organization,
                    },
                  });
                  setExpandedItem('');
                  setPersonalTargetSelected(false);
                }}
                onKeyDown={onKeyDown}
              >
                <Avatar
                  src={avatarUtils.getAvatar(organization.avatarRemoteId) || DefaultOrgAvatar}
                  placeholder={<img src={DefaultOrgAvatar} alt="workspace avatar" />}
                  variant="outline"
                  size="xs"
                />
                <PlainTooltip content={organization.name} position="bottom">
                  <Styled.ItemNameReskin type="body" size="md" className={styles.text} data-collapsed={collapsed}>
                    {organization.name}
                  </Styled.ItemNameReskin>
                </PlainTooltip>
                {renderNextArrow()}
              </Styled.ItemReskin>
            ))}
          </Styled.LeftSideBarWrapperReskin>
        </div>
      </div>
    );
  }

  return (
    <Styled.LeftSideBarContainer ref={leftSidebarContainerRef}>
      {showPersonalSection && (
        <Styled.PersonalSection
          $isActive={isPersonalTargetSelected}
          onClick={() => {
            setSelectedTarget(personalData.originUser);
            setDestination({
              _id: personalData._id,
              name: personalData.originUser.name,
              type: DestinationLocation.PERSONAL,
              belongsTo: {
                _id: personalData._id,
                type: DestinationLocation.PERSONAL,
                data: personalData.originUser,
              },
            });
            setPersonalTargetSelected(true);
            getFolders({ type: FolderType.PERSONAL, personalOnly: true });
          }}
        >
          {/* @ts-ignore */}
          <Icomoon className="user" size={18} />
          <Styled.ItemName>{t('modalMove.personalWorkspace')}</Styled.ItemName>
          {renderNextArrow()}
        </Styled.PersonalSection>
      )}
      {(showPersonalSection || context.showAllLocation) && (
        <Styled.Title>{t('organizations', { ns: 'terms' })}</Styled.Title>
      )}

      <Styled.LeftSideBarWrapper>
        {organizations.map((organization) => (
          <Styled.LeftSideBarItem
            key={organization._id}
            $isActive={selectedTarget._id === organization._id && !isPersonalTargetSelected}
            onClick={() => {
              setSelectedTarget(organization);
              setDestination({
                _id: organization._id,
                name: organization.name,
                type: DestinationLocation.PERSONAL,
                belongsTo: {
                  _id: organization._id,
                  name: organization.name,
                  type: DestinationLocation.ORGANIZATION,
                  data: organization,
                },
              });
              setExpandedItem('');
              setPersonalTargetSelected(false);
            }}
          >
            <Styled.Avatar src={avatarUtils.getAvatar(organization.avatarRemoteId)} hasBorder size={24}>
              <Icomoon className="default-org-2" size={14} color={Colors.NEUTRAL_100} />
            </Styled.Avatar>
            {/* @ts-ignore */}
            <Tooltip title={organization.name} placement="bottom">
              <Styled.ItemName>{organization.name}</Styled.ItemName>
            </Tooltip>
            {renderNextArrow()}
          </Styled.LeftSideBarItem>
        ))}
      </Styled.LeftSideBarWrapper>
    </Styled.LeftSideBarContainer>
  );
};

export default React.memo(LeftSideBar);
