/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Avatar, Icomoon as KiwiIcomoon, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { Fragment, useState, useEffect } from 'react';

import DefaultOrgAvatar from 'assets/reskin/lumin-svgs/default-org-avatar.png';
import DefaultTeamAvatar from 'assets/reskin/lumin-svgs/default-team-avatar.png';

import Icomoon from 'lumin-components/Icomoon';
import Collapse from 'lumin-components/Shared/Collapse';
import Tooltip from 'lumin-components/Shared/Tooltip';
import { useTransferDocumentContext } from 'lumin-components/TransferDocument/hooks';
import {
  DestinationLocation,
  ITransferDocumentContext,
  SetDestinationParams,
} from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';

import { useEnableWebReskin, useTranslation } from 'hooks';
import { useEnableNestedFolder } from 'hooks/useEnableNestedFolder';

import avatarUtils from 'utils/avatar';

import { NestedFoldersPanel } from 'features/NestedFolders/components';

import { documentStorage } from 'constants/documentConstants';
import { FolderType } from 'constants/folderConstant';
import { TOOLTIP_MAX_WIDTH } from 'constants/lumin-common';
import { Colors } from 'constants/styles';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { ITeam } from 'interfaces/team/team.interface';

import RightPanelSkeleton from './RightPanelSkeleton';
import * as LeftSideBarStyled from '../LeftSideBar/LeftSideBar.styled';

import * as Styled from './RightPanel.styled';

function RightPanel({ fullWidth = false }: { fullWidth?: boolean }): JSX.Element {
  const { isEnableReskin } = useEnableWebReskin();
  const { isEnableNestedFolder } = useEnableNestedFolder();
  const { getter, setter }: ITransferDocumentContext = useTransferDocumentContext();
  const [scrollToRef, setScrollToRef] = useState<HTMLElement>(null);
  const [foldersExpanded, setFoldersExpanded] = useState(false);
  const { t } = useTranslation();
  const {
    getTeamsOfSelectedOrg,
    destination,
    selectedTarget,
    personalData,
    disableTarget,
    folderData,
    getFolders,
    expandedItem,
    documents,
    context,
    isPersonalTargetSelected,
    totalFolders,
    loading,
  } = getter;
  const { setDestination, setExpandedItem, resetFolders } = setter;
  const { isOldProfessional } = personalData;
  const {
    belongsTo: { workspaceId },
  } = documents[0];

  useEffect(() => {
    if (isEnableNestedFolder) {
      return;
    }
    const isFolderLocation = destination.type === DestinationLocation.FOLDER;
    if (scrollToRef && (!isFolderLocation || foldersExpanded || isPersonalTargetSelected)) {
      setDestination({
        ...destination,
        scrollTo: null,
      });
      scrollToRef.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }, [scrollToRef, foldersExpanded, destination.type, isEnableNestedFolder]);

  const onSetDestination = ({ item, type, belongsTo = {} }: SetDestinationParams): void => {
    setDestination({
      _id: item._id,
      name: item.name,
      type,
      belongsTo,
    });
  };

  const setExpanded = (e: React.MouseEvent<HTMLElement>, { item, type }: { item: string; type: string }): void => {
    e.stopPropagation();
    const isOpen = expandedItem !== item;
    setExpandedItem(isOpen ? item : '');
    if (isOpen) {
      getFolders({ type, source: item });
    }
  };

  const withItemTooltip = (
    Component: JSX.Element,
    {
      informFileAlreadyHere = false,
      informChangingStorage = true,
    }: { informFileAlreadyHere?: boolean; informChangingStorage?: boolean }
  ): JSX.Element => {
    const documentsStoredInS3 = documents.filter((doc) => doc.service !== documentStorage.s3);
    if (informFileAlreadyHere || (documentsStoredInS3.length && informChangingStorage)) {
      const alreadyExistTitle =
        documents.length > 1 ? t('modalMove.tooltipFilesAreAlreadyHere') : t('modalMove.tooltipFileIsAlreadyHere');
      const changingStorageTitle = context.isCopyModal
        ? t('modalMakeACopy.changingStorageTooltip')
        : t('modalMove.changingStorageTooltip');
      if (isEnableReskin) {
        return (
          <PlainTooltip
            content={informFileAlreadyHere ? alreadyExistTitle : changingStorageTitle}
            maw={TOOLTIP_MAX_WIDTH}
          >
            <div>{Component}</div>
          </PlainTooltip>
        );
      }
      return (
        /* @ts-ignore */
        <Tooltip title={informFileAlreadyHere ? alreadyExistTitle : changingStorageTitle}>
          <div>{Component}</div>
        </Tooltip>
      );
    }

    return Component;
  };

  const onEnteredCollapse = (): void => {
    setFoldersExpanded(true);
  };

  const onExitedCollapse = (): void => {
    resetFolders();
    setFoldersExpanded(false);
  };

  const renderFolderList = ({
    belongsToType,
    isSubItem = true,
    isRender = true,
  }: { belongsToType?: DestinationLocation; isSubItem?: boolean; isRender?: boolean } = {}): JSX.Element => {
    const { folders } = folderData;

    if (!isRender) {
      return null;
    }

    if (isEnableReskin) {
      return (
        <Styled.FolderItemContainerReskin data-sub-item={isSubItem}>
          {folders.map((folder) => {
            const isActive = destination._id === folder._id;
            const requiredScrollToEl = destination.scrollTo === folder._id;
            return (
              <Fragment key={folder._id}>
                {withItemTooltip(
                  <Styled.RightSideBarItemReskin
                    ref={(ref) => requiredScrollToEl && setScrollToRef(ref)}
                    onClick={() =>
                      onSetDestination({
                        item: folder,
                        type: DestinationLocation.FOLDER,
                        belongsTo: { ...folder.belongsTo.location, type: belongsToType },
                      })
                    }
                    data-activated={isActive}
                  >
                    {isSubItem && <div style={{ minWidth: 'calc(var(--kiwi-spacing-4) + var(--kiwi-spacing-0-5))' }} />}
                    <KiwiIcomoon type="folder-lg" size="lg" />
                    <LeftSideBarStyled.ItemNameReskin type="body" size="md">
                      {folder.name}
                    </LeftSideBarStyled.ItemNameReskin>
                  </Styled.RightSideBarItemReskin>,
                  {
                    informChangingStorage: context.isCopyModal || belongsToType !== DestinationLocation.PERSONAL,
                  }
                )}
              </Fragment>
            );
          })}
        </Styled.FolderItemContainerReskin>
      );
    }

    return (
      <Styled.FolderItemContainer>
        {folders.map((folder) => {
          const isActive = destination._id === folder._id;
          const isDisabled = disableTarget === folder._id;
          const requiredScrollToEl = destination.scrollTo === folder._id;
          return (
            <Fragment key={folder._id}>
              {withItemTooltip(
                <Styled.RightSideBarItem
                  ref={(ref) => requiredScrollToEl && setScrollToRef(ref)}
                  onClick={() =>
                    !isDisabled &&
                    onSetDestination({
                      item: folder,
                      type: DestinationLocation.FOLDER,
                      belongsTo: { ...folder.belongsTo.location, type: belongsToType },
                    })
                  }
                  $isSubItem={isSubItem}
                  $isActive={isActive}
                  $isDisabled={isDisabled}
                >
                  <Styled.FolderSection $isSubItem={isSubItem}>
                    {/* @ts-ignore */}
                    <Icomoon className="folder" size={16} color={Colors.NEUTRAL_100} />
                    <Styled.ItemName>{folder.name}</Styled.ItemName>
                  </Styled.FolderSection>
                </Styled.RightSideBarItem>,
                {
                  informFileAlreadyHere: isDisabled,
                  informChangingStorage: context.isCopyModal || belongsToType !== DestinationLocation.PERSONAL,
                }
              )}
            </Fragment>
          );
        })}
      </Styled.FolderItemContainer>
    );
  };

  const renderArrow = ({
    hasFolder,
    isExpanded,
    onClick,
    id,
  }: {
    hasFolder: boolean;
    isExpanded: boolean;
    onClick: (e: React.MouseEvent<HTMLElement>) => void;
    id: string;
  }): JSX.Element =>
    hasFolder ? (
      <Styled.ArrowButton
        iconColor="var(--kiwi-colors-surface-on-surface)"
        size="sm"
        icon="caret-right-filled-sm"
        data-expanded={isExpanded}
        onClick={onClick}
        id={id}
      />
    ) : (
      <div style={{ minWidth: 'var(--kiwi-spacing-3)' }} />
    );
  const renderPersonalSection = (): JSX.Element => {
    const isExpanded = !isPersonalTargetSelected && expandedItem === personalData._id;
    const isBelongsToMyDocuments = !isOldProfessional || isPersonalTargetSelected !== Boolean(workspaceId);
    const isDisabled = isBelongsToMyDocuments && disableTarget === personalData._id;
    const isActive = destination._id === selectedTarget._id && destination.type === DestinationLocation.PERSONAL;
    const hasFolder = totalFolders[selectedTarget._id]?.myDocuments > 0;

    if (isEnableReskin) {
      return (
        <div>
          {withItemTooltip(
            <Styled.RightSideBarItemReskin
              data-activated={isActive}
              onClick={() =>
                onSetDestination({
                  item: selectedTarget,
                  type: DestinationLocation.PERSONAL,
                  belongsTo: {
                    _id: selectedTarget._id,
                    name: selectedTarget.name,
                    type: isBelongsToMyDocuments ? DestinationLocation.ORGANIZATION : DestinationLocation.PERSONAL,
                    data: selectedTarget,
                  },
                })
              }
            >
              {!isPersonalTargetSelected &&
                renderArrow({
                  isExpanded,
                  onClick: (e) =>
                    setExpanded(e, {
                      item: personalData._id,
                      type: FolderType.PERSONAL,
                    }),
                  hasFolder,
                  id: personalData._id,
                })}
              <KiwiIcomoon type="file-type-pdf-lg" size="lg" />
              <LeftSideBarStyled.ItemNameReskin type="body" size="md">
                {t('modalMove.myDocuments')}
              </LeftSideBarStyled.ItemNameReskin>
            </Styled.RightSideBarItemReskin>,
            { informChangingStorage: context.isCopyModal || false }
          )}
          <Collapse
            isExpand={isExpanded && !folderData.isLoading}
            onEntered={onEnteredCollapse}
            onExited={onExitedCollapse}
          >
            {renderFolderList({ belongsToType: DestinationLocation.PERSONAL, isRender: isExpanded })}
          </Collapse>
        </div>
      );
    }

    return (
      <>
        {withItemTooltip(
          <Styled.RightSideBarItem
            $isActive={isActive}
            onClick={() =>
              !isDisabled &&
              onSetDestination({
                item: selectedTarget,
                type: DestinationLocation.PERSONAL,
                belongsTo: {
                  _id: selectedTarget._id,
                  name: selectedTarget.name,
                  type: isBelongsToMyDocuments ? DestinationLocation.ORGANIZATION : DestinationLocation.PERSONAL,
                  data: selectedTarget,
                },
              })
            }
            $isPersonalTargetSelected={isPersonalTargetSelected}
            $isDisabled={isDisabled}
          >
            {!isPersonalTargetSelected && (
              <Styled.ArrowContainer
                onClick={(e) =>
                  hasFolder &&
                  setExpanded(e, {
                    item: personalData._id,
                    type: FolderType.PERSONAL,
                  })
                }
                $isExpanded={isExpanded}
                id={personalData._id}
                $hasFolder={hasFolder}
              >
                {/* @ts-ignore */}
                {hasFolder ? (
                  <Icomoon className="dropdown" size={10} style={{ width: '28px' }} />
                ) : (
                  <Styled.HiddenArrow />
                )}
              </Styled.ArrowContainer>
            )}
            {/* @ts-ignore */}
            <Icomoon className="my-document" size={16} />
            <Styled.ItemName>{t('modalMove.myDocuments')}</Styled.ItemName>
          </Styled.RightSideBarItem>,
          { informFileAlreadyHere: isDisabled, informChangingStorage: context.isCopyModal || false }
        )}
        <Collapse
          isExpand={isExpanded && !folderData.isLoading}
          onEntered={onEnteredCollapse}
          onExited={onExitedCollapse}
        >
          {renderFolderList({ belongsToType: DestinationLocation.PERSONAL, isRender: isExpanded })}
        </Collapse>
      </>
    );
  };

  const renderOrganizationSection = (): JSX.Element => {
    const isExpanded = expandedItem === selectedTarget._id;
    const isActive = destination._id === selectedTarget._id && destination.type === DestinationLocation.ORGANIZATION;
    const isDisabled = disableTarget === selectedTarget._id;
    const requiredScrollToEl = destination.scrollTo === selectedTarget._id;
    const orgDocuments = isEnableReskin
      ? `All ${selectedTarget.name}`
      : t('modalMove.orgDocuments', { orgName: (selectedTarget as IOrganization).name });
    const hasFolder = totalFolders[selectedTarget._id]?.orgDocuments > 0;
    if (isEnableReskin) {
      return (
        <div>
          {withItemTooltip(
            <Styled.RightSideBarItemReskin
              ref={(ref) => requiredScrollToEl && setScrollToRef(ref)}
              data-activated={isActive}
              onClick={() =>
                onSetDestination({
                  item: selectedTarget,
                  type: DestinationLocation.ORGANIZATION,
                  belongsTo: {
                    _id: selectedTarget._id,
                    name: selectedTarget.name,
                    type: DestinationLocation.ORGANIZATION,
                    data: selectedTarget,
                  },
                })
              }
            >
              {renderArrow({
                isExpanded,
                onClick: (e) => setExpanded(e, { item: selectedTarget._id, type: FolderType.ORGANIZATION }),
                hasFolder,
                id: selectedTarget._id,
              })}
              <Avatar
                src={avatarUtils.getAvatar((selectedTarget as IOrganization).avatarRemoteId) || DefaultOrgAvatar}
                placeholder={<img src={DefaultOrgAvatar} alt="workspace avatar" />}
                variant="outline"
                size="xs"
              />
              <LeftSideBarStyled.ItemNameReskin type="body" size="md">
                {orgDocuments}
              </LeftSideBarStyled.ItemNameReskin>
            </Styled.RightSideBarItemReskin>,
            {}
          )}
          <Collapse
            isExpand={isExpanded && !folderData.isLoading}
            onEntered={onEnteredCollapse}
            onExited={onExitedCollapse}
          >
            {renderFolderList({ belongsToType: DestinationLocation.ORGANIZATION, isRender: isExpanded })}
          </Collapse>
        </div>
      );
    }
    return (
      <>
        {withItemTooltip(
          <Styled.RightSideBarItem
            ref={(ref) => requiredScrollToEl && setScrollToRef(ref)}
            $isActive={isActive}
            onClick={() =>
              !isDisabled &&
              onSetDestination({
                item: selectedTarget,
                type: DestinationLocation.ORGANIZATION,
                belongsTo: {
                  _id: selectedTarget._id,
                  name: selectedTarget.name,
                  type: DestinationLocation.ORGANIZATION,
                  data: selectedTarget,
                },
              })
            }
            $isDisabled={isDisabled}
          >
            <Styled.ArrowContainer
              id={selectedTarget._id}
              onClick={(e) =>
                hasFolder &&
                setExpanded(e, {
                  item: selectedTarget._id,
                  type: FolderType.ORGANIZATION,
                })
              }
              $isExpanded={isExpanded}
              $hasFolder={hasFolder}
            >
              {/* @ts-ignore */}
              {hasFolder ? (
                <Icomoon className="dropdown" size={10} style={{ width: '28px' }} />
              ) : (
                <Styled.HiddenArrow />
              )}
            </Styled.ArrowContainer>
            {/* @ts-ignore */}
            <Icomoon className="circle-document" size={20} color={Colors.NEUTRAL_100} />
            {/* @ts-ignore */}
            <Styled.ItemName>{orgDocuments}</Styled.ItemName>
          </Styled.RightSideBarItem>,
          { informFileAlreadyHere: isDisabled }
        )}
        <Collapse
          isExpand={isExpanded && !folderData.isLoading}
          onEntered={onEnteredCollapse}
          onExited={onExitedCollapse}
        >
          {renderFolderList({ belongsToType: DestinationLocation.ORGANIZATION, isRender: isExpanded })}
        </Collapse>
      </>
    );
  };

  const renderTeamSection = (team: ITeam): JSX.Element => {
    const isExpanded = expandedItem === team._id;
    const isActive = destination._id === team._id;
    const isDisabled = disableTarget === team._id;
    const requiredScrollToEl = destination.scrollTo === team._id;
    const hasFolder = (totalFolders[selectedTarget._id]?.teams as unknown as Record<string, number>)?.[team._id] > 0;

    if (isEnableReskin) {
      return (
        <div key={team._id}>
          {withItemTooltip(
            <Styled.RightSideBarItemReskin
              ref={(ref) => requiredScrollToEl && setScrollToRef(ref)}
              data-activated={isActive}
              onClick={() =>
                onSetDestination({
                  item: team,
                  type: DestinationLocation.ORGANIZATION_TEAM,
                  belongsTo: {
                    _id: selectedTarget._id,
                    name: selectedTarget.name,
                    type: DestinationLocation.ORGANIZATION,
                    data: selectedTarget,
                  },
                })
              }
            >
              {renderArrow({
                isExpanded,
                onClick: (e) => setExpanded(e, { item: team._id, type: FolderType.ORGANIZATION_TEAM }),
                hasFolder,
                id: team._id,
              })}
              <Avatar
                src={avatarUtils.getAvatar(team.avatarRemoteId) || DefaultTeamAvatar}
                placeholder={<img src={DefaultTeamAvatar} alt="team avatar" />}
                variant="outline"
                size="xs"
              />
              <LeftSideBarStyled.ItemNameReskin type="body" size="md">
                {team.name}
              </LeftSideBarStyled.ItemNameReskin>
            </Styled.RightSideBarItemReskin>,
            {}
          )}
          <Collapse
            isExpand={isExpanded && !folderData.isLoading}
            onEntered={onEnteredCollapse}
            onExited={onExitedCollapse}
          >
            {renderFolderList({ belongsToType: DestinationLocation.ORGANIZATION_TEAM, isRender: isExpanded })}
          </Collapse>
        </div>
      );
    }

    return (
      <Fragment key={team._id}>
        {withItemTooltip(
          <Styled.RightSideBarItem
            ref={(ref) => requiredScrollToEl && setScrollToRef(ref)}
            $isActive={isActive}
            onClick={() =>
              !isDisabled &&
              onSetDestination({
                item: team,
                type: DestinationLocation.ORGANIZATION_TEAM,
                belongsTo: {
                  _id: selectedTarget._id,
                  name: selectedTarget.name,
                  type: DestinationLocation.ORGANIZATION,
                  data: selectedTarget,
                },
              })
            }
            $isDisabled={isDisabled}
          >
            <Styled.ArrowContainer
              id={team._id}
              onClick={(e) =>
                hasFolder &&
                setExpanded(e, {
                  item: team._id,
                  type: FolderType.ORGANIZATION_TEAM,
                })
              }
              $isExpanded={isExpanded}
              $hasFolder={hasFolder}
            >
              {/* @ts-ignore */}
              {hasFolder ? (
                <Icomoon className="dropdown" size={10} style={{ width: '28px' }} />
              ) : (
                <Styled.HiddenArrow />
              )}
            </Styled.ArrowContainer>
            <Styled.Avatar size={24} src={avatarUtils.getAvatar(team.avatarRemoteId)} team>
              {avatarUtils.getTextAvatar(team.name)}
            </Styled.Avatar>
            <Styled.ItemName>{team.name}</Styled.ItemName>
          </Styled.RightSideBarItem>,
          { informFileAlreadyHere: isDisabled }
        )}
        <Collapse
          isExpand={isExpanded && !folderData.isLoading}
          onEntered={onEnteredCollapse}
          onExited={onExitedCollapse}
        >
          {renderFolderList({ belongsToType: DestinationLocation.ORGANIZATION_TEAM, isRender: isExpanded })}
        </Collapse>
      </Fragment>
    );
  };

  if (isEnableReskin) {
    if (isEnableNestedFolder) {
      return <NestedFoldersPanel loading={loading} fullWidth={fullWidth} />;
    }
    return (
      <Styled.RightSideBarContainerReskin data-full-width={fullWidth} className="custom-scrollbar-reskin">
        {loading ? (
          <RightPanelSkeleton />
        ) : (
          <>
            <Styled.RightSideBarItemWrapper>{renderPersonalSection()}</Styled.RightSideBarItemWrapper>
            {isPersonalTargetSelected ? (
              <Styled.SubTitleReskin type="headline" size="xs">
                {t('modalMove.folders')}
              </Styled.SubTitleReskin>
            ) : (
              <Styled.SubTitleReskin type="headline" size="xs">
                {t('teams', { ns: 'terms' })}
              </Styled.SubTitleReskin>
            )}
            <Styled.RightSideBarItemWrapper>
              {!isPersonalTargetSelected && renderOrganizationSection()}
              {isPersonalTargetSelected
                ? renderFolderList({ belongsToType: DestinationLocation.PERSONAL, isSubItem: false })
                : getTeamsOfSelectedOrg().map((team) => renderTeamSection(team))}
            </Styled.RightSideBarItemWrapper>
          </>
        )}
      </Styled.RightSideBarContainerReskin>
    );
  }

  return (
    <Styled.RightSideBarContainer>
      <Styled.RightSideBar>
        <Styled.Title>{t(context.selectAPlace)}</Styled.Title>
        {loading ? (
          <RightPanelSkeleton />
        ) : (
          <Styled.RightSideBarItemContainer>
            <Styled.RightSideBarItemWrapper>
              {renderPersonalSection()}
              {!isPersonalTargetSelected && renderOrganizationSection()}
            </Styled.RightSideBarItemWrapper>
            {isPersonalTargetSelected ? (
              <Styled.SubTitle>{t('modalMove.folders')}</Styled.SubTitle>
            ) : (
              getTeamsOfSelectedOrg().length > 0 && <Styled.SubTitle>{t('teams', { ns: 'terms' })}</Styled.SubTitle>
            )}
            <Styled.RightSideBarItemWrapper>
              {isPersonalTargetSelected
                ? renderFolderList({ belongsToType: DestinationLocation.PERSONAL, isSubItem: false })
                : getTeamsOfSelectedOrg().map((team) => renderTeamSection(team))}
            </Styled.RightSideBarItemWrapper>
          </Styled.RightSideBarItemContainer>
        )}
      </Styled.RightSideBar>
    </Styled.RightSideBarContainer>
  );
}

export default React.memo(RightPanel);
