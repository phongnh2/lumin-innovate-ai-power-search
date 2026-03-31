/* eslint-disable no-nested-ternary */
import { PopoverDropdown } from 'lumin-ui/kiwi-ui';
import React, { useState, useMemo, useEffect } from 'react';

import Loading from 'lumin-components/Loading';
import EmptySearchResult from 'luminComponents/DocumentComponents/components/EmptySearchResult';
import InfiniteScroll from 'luminComponents/InfiniteScroll';
import MaterialPopper from 'luminComponents/MaterialPopper';
import { goToDestination } from 'luminComponents/TransferDocument/helpers/destinationHelper';
import { useTransferDocumentContext } from 'luminComponents/TransferDocument/hooks';
import {
  DestinationLocation,
  ISearchResults,
  ITransferDocumentContext,
} from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';

import { useTranslation } from 'hooks';

import { avatar as avatarUtils } from 'utils';

import { Colors } from 'constants/styles';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { IUser } from 'interfaces/user/user.interface';

import { ResultTabs } from '../../constants/moveDocumentConstant';
import { EmptySearchResult as EmptySearchResultReskin } from '../EmptySearchResult';
import ResultItemRender from '../ResultItemRender';
import { SearchResultHeader } from '../SearchResultHeader';

import * as Styled from './SearchResult.styled';

import styles from './SearchResult.module.scss';

interface SearchResultProps {
  anchorEl: HTMLDivElement;
  isOpen: boolean;
  onClose: () => void;
  searchResults: ISearchResults;
  loading: boolean;
  selectedTarget: IOrganization | IUser;
  isEnableReskin?: boolean;
}

const SearchResult = ({
  anchorEl,
  isOpen,
  onClose,
  searchResults,
  loading,
  selectedTarget,
  isEnableReskin,
}: SearchResultProps): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const { orgResults, teamResults, folderResults } = searchResults || {
    orgResults: [],
    teamResults: [],
    folderResults: [],
  };
  const [tab, setTab] = useState(ResultTabs.TEAMS);
  const tabClasses = Styled.useTabStyles();
  const { getter, setter }: ITransferDocumentContext = useTransferDocumentContext();
  const { personalData, disableTarget, organizations, getFolders } = getter;
  const { setDestination, setExpandedItem, setSelectedTarget, setPersonalTargetSelected, getNestedFolders } = setter;
  const { t } = useTranslation();

  const isPersonalWorkspace = personalData.isOldProfessional && selectedTarget._id === personalData.originUser._id;

  const Tabs = useMemo(
    () => [
      {
        value: ResultTabs.TEAMS,
        label: t('common.teams'),
        suffix: <Styled.Badge>{teamResults.length}</Styled.Badge>,
      },
      {
        value: ResultTabs.FOLDERS,
        label: t('common.folders'),
        suffix: <Styled.Badge>{folderResults.length}</Styled.Badge>,
      },
    ],
    [teamResults.length, folderResults.length]
  );

  const emptySearchResultComponent = useMemo(
    () =>
      isEnableReskin ? (
        <EmptySearchResultReskin />
      ) : (
        <Styled.ContainerEmpty>
          <EmptySearchResult noResultFolderOrDoc />
        </Styled.ContainerEmpty>
      ),
    [isEnableReskin]
  );

  const autoHeightMaxScroll = useMemo(() => {
    if (isEnableReskin) {
      return isPersonalWorkspace ? 332 : 284;
    }
    return isPersonalWorkspace ? 308 : 267;
  }, [isPersonalWorkspace, isEnableReskin]);

  const renderScroll = (_renderChild: () => JSX.Element[]): JSX.Element => (
    <InfiniteScroll
      autoHeight
      autoHeightMin={0}
      autoHeightMax={autoHeightMaxScroll}
      hasNextPage={false}
      onLoadMore={() => {}}
      className={isEnableReskin && styles.infiniteScrollWrapper}
    >
      {_renderChild()}
    </InfiniteScroll>
  );

  const renderFolder = (): JSX.Element[] =>
    folderResults.map((folder) => {
      const isDisabled = disableTarget === folder._id;
      return (
        <ResultItemRender.Folder
          key={folder._id}
          title={folder.name}
          text={folder.path?.name}
          goToDestination={() =>
            !isDisabled &&
            goToDestination({
              organizations,
              setDestination,
              isPersonalWorkspace,
              selectedTarget,
              item: folder,
              type: DestinationLocation.FOLDER,
              setExpandedItem,
              getFolders,
              getNestedFolders,
            }) &&
            onClose()
          }
        />
      );
    });

  const renderTeam = (): JSX.Element[] =>
    teamResults.map((team) => {
      const isDisabled = disableTarget === team._id;
      return (
        <ResultItemRender.Team
          key={team._id}
          avatarSrc={avatarUtils.getAvatar(team.avatarRemoteId)}
          avatarDefault={avatarUtils.getTextAvatar(team.name)}
          title={team.name}
          goToDestination={() =>
            !isDisabled &&
            goToDestination({
              organizations,
              setDestination,
              selectedTarget,
              item: team,
              type: DestinationLocation.ORGANIZATION_TEAM,
            }) &&
            onClose()
          }
        />
      );
    });

  const renderOrgs = (): JSX.Element[] =>
    orgResults.map((org) => {
      const isDisabled = disableTarget === org._id;
      return (
        <ResultItemRender.Team
          key={org._id}
          avatarSrc={avatarUtils.getAvatar(org.avatarRemoteId)}
          avatarDefault={avatarUtils.getTextAvatar(org.name)}
          title={org.name}
          goToDestination={() =>
            !isDisabled &&
            goToDestination({
              organizations,
              setDestination,
              selectedTarget,
              setExpandedItem,
              setSelectedTarget,
              setPersonalTargetSelected,
              item: org,
              type: DestinationLocation.ORGANIZATION,
            }) &&
            onClose()
          }
        />
      );
    });

  const renderFolderOldProfessional = (): JSX.Element => {
    if (folderResults.length) {
      return renderScroll(renderFolder);
    }
    return emptySearchResultComponent;
  };

  const renderResult = (_renderScroll: (_renderChild: () => JSX.Element[]) => JSX.Element): JSX.Element => {
    if (isPersonalWorkspace) {
      return renderFolderOldProfessional();
    }

    switch (tab) {
      case ResultTabs.TEAMS: {
        if (!orgResults.length && !teamResults.length) {
          return emptySearchResultComponent;
        }
        return (
          <>
            {orgResults.length > 0 && _renderScroll(renderOrgs)}
            {teamResults.length > 0 && _renderScroll(renderTeam)}
          </>
        );
      }
      case ResultTabs.FOLDERS: {
        if (folderResults.length) {
          return _renderScroll(renderFolder);
        }
        return emptySearchResultComponent;
      }
      default:
        break;
    }
  };

  const onTabChange = (newTab: ResultTabs): void => {
    setTab(newTab);
  };

  useEffect(() => {
    if (isEnableReskin) {
      if (!loading && folderResults.length && !orgResults.length && !teamResults.length) {
        setTab(ResultTabs.FOLDERS);
      } else {
        setTab(ResultTabs.TEAMS);
      }
      return;
    }
    if (!loading && folderResults.length && !teamResults.length) {
      setTab(ResultTabs.FOLDERS);
    } else {
      setTab(ResultTabs.TEAMS);
    }
  }, [isEnableReskin, loading, orgResults.length, teamResults.length, folderResults.length]);

  if (isEnableReskin) {
    return (
      <PopoverDropdown paddingVariant="none" className={styles.searchResultsPopper}>
        {!isPersonalWorkspace && (
          <SearchResultHeader
            tab={tab}
            onTabChange={onTabChange}
            folderResults={folderResults}
            teamResults={teamResults}
            orgResults={orgResults}
          />
        )}
        {loading ? (
          <Loading normal useReskinCircularProgress containerStyle={{ marginTop: 16 }} reskinSize="sm" />
        ) : (
          renderResult(renderScroll)
        )}
      </PopoverDropdown>
    );
  }

  return (
    <MaterialPopper
      noPadding
      open={isOpen}
      anchorEl={anchorEl}
      parentOverflow="viewport"
      placement="bottom-end"
      handleClose={onClose}
    >
      <Styled.Container>
        {!isPersonalWorkspace && (
          <Styled.HeaderContainer>
            <Styled.TabsContainer>
              <Styled.Tabs
                tabs={Tabs}
                onChange={onTabChange}
                value={tab}
                activeBarColor={Colors.SECONDARY_50}
                classes={tabClasses as unknown}
              />
            </Styled.TabsContainer>
            <Styled.Divider />
          </Styled.HeaderContainer>
        )}
        {loading ? (
          <Loading normal containerStyle={{ marginTop: 16 }} />
        ) : (
          <Styled.ResultList>{renderResult(renderScroll)}</Styled.ResultList>
        )}
      </Styled.Container>
    </MaterialPopper>
  );
};

export default SearchResult;
