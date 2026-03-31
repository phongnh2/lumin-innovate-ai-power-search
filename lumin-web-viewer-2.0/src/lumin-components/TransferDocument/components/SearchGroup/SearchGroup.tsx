/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Popover, PopoverTarget } from 'lumin-ui/kiwi-ui';
import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';

import Input from 'lumin-components/Shared/Input';
import { InputSize } from 'lumin-components/Shared/Input/types/InputSize';
import Tooltip from 'lumin-components/Shared/Tooltip';
import Icomoon from 'luminComponents/Icomoon/Icomoon';
import { SearchInput } from 'luminComponents/ReskinLayout/components/SearchInput';
import { useTransferDocumentContext } from 'luminComponents/TransferDocument/hooks';
import { ITransferDocumentContext } from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';

import { useTabletMatch, useTranslation } from 'hooks';

import { documentServices } from 'services';

import { DOCUMENT_TYPE } from 'constants/documentConstants';
import { DEBOUNCED_SEARCH_TIME } from 'constants/lumin-common';
import { Colors } from 'constants/styles';

import { IOrganization } from 'interfaces/organization/organization.interface';

import SearchResult from '../SearchResult';

import * as Styled from './SearchGroup.styled';

import styles from './SearchGroup.module.scss';

const INPUT_MAX_SIZE = 216;

type SearchGroupProps = {
  isEnableReskin?: boolean;
  setSearching: React.Dispatch<React.SetStateAction<boolean>>;
};

const SearchGroup = ({ setSearching, isEnableReskin }: SearchGroupProps): JSX.Element => {
  const { getter, setter }: ITransferDocumentContext = useTransferDocumentContext();
  const { setDestination } = setter;
  const { selectedTarget, personalData, isPersonalTargetSelected, destination } = getter;
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const [searchText, setSearchText] = useState('');
  const [focusing, setFocusing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOpenResult, setIsOpenResult] = useState(false);
  const controller = useRef(new AbortController());
  const orgName = selectedTarget.name;
  const [searchResults, setSearchResults] = useState({ orgResults: [], teamResults: [], folderResults: [] });
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const isTabletMatch = useTabletMatch();
  const { t } = useTranslation();
  const placeholder = focusing ? '' : t('common.search');

  const isExpand = useMemo(() => focusing || Boolean(searchText), [focusing, searchText]);

  const searchInPersonalWorkSpace = async (searchKey: string): Promise<void> => {
    const folderResults = await documentServices.findAvailableLocation(
      {
        type: DOCUMENT_TYPE.FOLDER,
        searchKey,
        orgId: undefined,
      },
      { signal: controller.current.signal }
    );
    setSearchResults({
      folderResults: folderResults.data,
      teamResults: [],
      orgResults: [],
    });
  };

  const searchInOrgWorkSpace = async (searchKey: string): Promise<void> => {
    const [teamResults, folderResults] = await Promise.all(
      [DOCUMENT_TYPE.ORGANIZATION_TEAM, DOCUMENT_TYPE.FOLDER].map((type) =>
        documentServices.findAvailableLocation(
          {
            type,
            searchKey,
            orgId: selectedTarget._id,
          },
          { signal: controller.current.signal }
        )
      )
    );
    const isPersonalWorkspace = personalData.isOldProfessional && isPersonalTargetSelected;
    const shouldIgnoreOrgFoundResults = !isEnableReskin || isPersonalWorkspace;
    const isMatchCurrentWorkspace = selectedTarget.name.toLowerCase().includes(searchKey.trim().toLowerCase());
    let orgResults: IOrganization[] = [];
    if (!shouldIgnoreOrgFoundResults && isMatchCurrentWorkspace) {
      orgResults = [{ ...selectedTarget, name: `All ${selectedTarget.name}` } as IOrganization];
    }

    setSearchResults({
      orgResults,
      teamResults: teamResults.data,
      folderResults: folderResults.data,
    });
  };

  const clearSearchResults = (): void => {
    setSearchResults({
      orgResults: [],
      teamResults: [],
      folderResults: [],
    });
  };

  const searchOnInputHasValue = async (value: string): Promise<void> => {
    try {
      if (controller.current) {
        controller.current.abort();
      }
      controller.current = new AbortController();
      if (isPersonalTargetSelected && personalData.isOldProfessional) {
        await searchInPersonalWorkSpace(value);
      } else {
        await searchInOrgWorkSpace(value);
      }
    } catch (err) {
      clearSearchResults();
    } finally {
      setLoading(false);
    }
  };

  const onSearch = async (value: string) => {
    setIsOpenResult(Boolean(value));
    if (value) {
      await searchOnInputHasValue(value);
    } else {
      setLoading(false);
      clearSearchResults();
    }
  };

  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchText(text);
    setLoading(true);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      onSearch(text).finally(() => {});
    }, DEBOUNCED_SEARCH_TIME);
  };

  const onClose = (): void => {
    setIsOpenResult(false);
  };

  useEffect(() => {
    setSearching(isOpenResult || focusing);
  }, [focusing, isOpenResult]);

  const renderWorkspace = useCallback(
    () =>
      isExpand &&
      orgName && (
        <Tooltip title={orgName}>
          <Styled.CircleBadge>
            <Icomoon size={18} className="search" color={Colors.NEUTRAL_60} />
            <Styled.OrganizationName>{orgName}</Styled.OrganizationName>
          </Styled.CircleBadge>
        </Tooltip>
      ),
    [orgName, isExpand]
  );

  const onBlur = (): void => {
    if (inputRef.current !== document.activeElement) {
      setFocusing(false);
    }
  };

  const onFocus = (): void => {
    setFocusing(true);
    if (searchText.length > 0) {
      setIsOpenResult(true);
    }
    if (destination.scrollTo) {
      setDestination({
        ...destination,
        scrollTo: null,
      });
    }
  };

  const handleClickSearchIcon = (): void => {
    setFocusing(true);
    inputRef.current?.focus();
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    e.stopPropagation();
  };

  if (!isTabletMatch && !focusing) {
    return (
      <Styled.IconContainer onClick={handleClickSearchIcon}>
        <Icomoon className="search" size={18} />
      </Styled.IconContainer>
    );
  }

  return (
    <Popover width={400} zIndex={200} position="bottom" opened={isOpenResult} onDismiss={onClose} onOpen={() => {}}>
      {isEnableReskin ? (
        <PopoverTarget>
          <div className={styles.searchInputWrapper} data-focusing={isExpand}>
            <SearchInput
              size="lg"
              width="100%"
              ref={inputRef}
              onFocus={onFocus}
              onBlur={onBlur}
              onChange={onTextChange}
              onKeyDown={onInputKeyDown}
              onClear={onClose}
              value={searchText}
              placeholder={placeholder}
              badgeProps={{
                active: isExpand,
                content: orgName,
                showTooltip: true,
              }}
            />
          </div>
        </PopoverTarget>
      ) : (
        <Styled.Container ref={inputWrapperRef}>
          <Styled.Input $maxWidth={INPUT_MAX_SIZE} $isExpanded={isExpand}>
            <Input
              /* @ts-ignore */
              icon={!isExpand ? 'search' : ''}
              placeholder={placeholder}
              value={searchText}
              onChange={onTextChange}
              onKeyDown={onInputKeyDown}
              ref={inputRef}
              onFocus={onFocus}
              onBlur={onBlur}
              showClearButton
              iconPostfix={renderWorkspace()}
              size={InputSize.SMALL}
            />
          </Styled.Input>
        </Styled.Container>
      )}
      {isOpenResult && (
        <SearchResult
          isOpen
          anchorEl={inputWrapperRef.current}
          onClose={onClose}
          searchResults={searchResults}
          loading={loading}
          selectedTarget={selectedTarget}
          isEnableReskin={isEnableReskin}
        />
      )}
    </Popover>
  );
};

export default SearchGroup;
