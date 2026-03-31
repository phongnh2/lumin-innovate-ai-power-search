import cloneDeep from 'lodash/cloneDeep';
import {
  useEffect, useState, useMemo, useRef,
} from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { useSelector, shallowEqual } from 'react-redux';

import selectors from 'selectors';

import { useAvailablePersonalWorkspace, useFuseSearch, useTranslation } from 'hooks';

import logger from 'helpers/logger';

import { folderType, DOCUMENT_TYPE } from 'constants/documentConstants';
import { STORAGE_TYPE } from 'constants/lumin-common';
import { ORGANIZATION_TEXT } from 'constants/organizationConstants';

import utility from '../TransferDocumentUtility/utility';

const fuseOptions = {
  keys: ['content'],
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export const useDestination = ({ document, initialOrgOnly = false }) => {
  const { t } = useTranslation();
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual) || {};
  const isAvailablePersonalWorkspace = useAvailablePersonalWorkspace();
  const hasPersonalWorkspace = useAvailablePersonalWorkspace();
  const currentSource = useRef(null);
  const [loading, setLoading] = useState(true);
  const [expandedList, setExpandedList] = useState([]);
  const [breadcrumb, setBreadCrumb] = useState([]);
  const [activeDestinationSource, setActiveDestinationSource] = useState(0);

  const [tempExpandedList, searchList] = useMemo(() => expandedList.reduce(
    ([accExpanded, accSearch], {
      disabledSearch = false, sourceType, items, ...rest
    }) => {
      accExpanded[sourceType] = { ...rest, sourceType, items: disabledSearch ? items : [] };
      if (disabledSearch) {
        return [accExpanded, accSearch];
      }

      return [accExpanded, [...accSearch, items]];
    }, [{}, []],
  ), [expandedList]);

  const { searchText, onChange, results } = useFuseSearch({
    data: searchList.flat(), options: fuseOptions,
  });

  const getExpandedItems = (tempList, searchResult) => {
    const finalExpandedList = cloneDeep(tempList);
    searchResult.forEach((item) => finalExpandedList[item.source].items.push(item));
    return Object.values(finalExpandedList);
  };

  const getInitialDestination = () => {
    if (
      (!document.isPersonal && !document.isShared) ||
      document.service === STORAGE_TYPE.SYSTEM ||
      !hasPersonalWorkspace
    ) {
      return {
        initialSource: folderType.ORGANIZATION,
        initialDestination: {
          id: document.folderId || document.clientId,
          type: document.folderId ? DOCUMENT_TYPE.FOLDER : document.documentType,
        },
      };
    }
    return {
      initialSource: folderType.INDIVIDUAL,
      initialDestination: {
        id: document.folderId || currentUser._id,
        type: document.folderId ? DOCUMENT_TYPE.FOLDER : DOCUMENT_TYPE.PERSONAL,
      },
    };
  };

  const initValue = getInitialDestination();

  const changeToNewSource = async (newSource) => {
    currentSource.current = newSource;
    setLoading(true);
    const currentExpandedList = await utility.from(newSource).getAllExpandedList({
      t,
      user: currentUser,
      organizationOnly: true,
      src: document.clientId,
      initialOrgOnly,
    });
    const newBreadcrumb = utility.from(newSource).getBreadcrumb({ t });
    unstable_batchedUpdates(() => {
      setExpandedList(currentExpandedList);
      setBreadCrumb(newBreadcrumb);
      setActiveDestinationSource(0);
      setLoading(false);
    });
  };

  const navigateTo = async (refetch) => {
    if (refetch) {
      const newExpandedList = await refetch.newExpanded({ src: document.clientId, initialOrgOnly });
      unstable_batchedUpdates(() => {
        setExpandedList(newExpandedList);
        setBreadCrumb(refetch.newBreadcrumb());
        setActiveDestinationSource(newExpandedList[0].items.length ? 0 : 1);
      });
    }
  };

  const getSuccessMessage = (...rest) => utility.from(currentSource.current).getSuccessMessage(...rest);

  const getInfoOf = (destination = {}) =>
    utility.from(currentSource.current).getInfoOf({ user: currentUser, ...destination });

  const getTextSearchPlaceHolder = (text) => t('modalMakeACopy.searchByName', { text });

  const getSearchPlaceHolder = () => {
    if (currentSource.current === folderType.ORGANIZATION) {
      switch (breadcrumb.length) {
        case 1:
          return getTextSearchPlaceHolder(ORGANIZATION_TEXT);
        case 2:
          return activeDestinationSource ? getTextSearchPlaceHolder('team') : getTextSearchPlaceHolder('folder');
        default:
          break;
      }
    }

    return getTextSearchPlaceHolder('folder');
  };

  useEffect(() => {
    const getDestinationData = async () => {
      try {
        const { initialSource, initialDestination } = initValue;
        const isDocumentInFolder = initialDestination.type === DOCUMENT_TYPE.FOLDER;
        const isDocOrg = document.documentType === DOCUMENT_TYPE.ORGANIZATION;
        const isDocOrgTeam = document.documentType === DOCUMENT_TYPE.ORGANIZATION_TEAM;
        const selectedUtility = utility.from(initialSource);
        currentSource.current = initialSource;
        const isSharedDocOrgWorkspace = !isAvailablePersonalWorkspace && document.isShared;
        const isSystemFile = document.service === STORAGE_TYPE.SYSTEM;
        const currentExpandedList = await selectedUtility.getAllExpandedList({
          t,
          user: currentUser,
          organizationOnly: (!isDocumentInFolder && isDocOrg) || isSharedDocOrgWorkspace || isSystemFile,
          allOrgExpanded: (!isDocumentInFolder && isDocOrgTeam) || (isDocumentInFolder && isDocOrg),
          orgTeamOnly: isDocumentInFolder && isDocOrgTeam,
          src: document.clientId,
          initialOrgOnly,
        });
        const currentBreadcrumb = selectedUtility.getBreadcrumb({
          t,
          inOrg:
            !isSharedDocOrgWorkspace && ((isDocumentInFolder && isDocOrg) || (!isDocumentInFolder && isDocOrgTeam)),
          inTeam: !isSharedDocOrgWorkspace && isDocumentInFolder && isDocOrgTeam,
          src: document.clientId,
        });
        unstable_batchedUpdates(() => {
          setBreadCrumb(currentBreadcrumb);
          setExpandedList(currentExpandedList);
          setActiveDestinationSource(isDocumentInFolder ? 0 : 1);
          setLoading(false);
        });
      } catch (e) {
        logger.logError({ error: e });
      }
    };
    getDestinationData();

    return () => utility.reset();
  }, []);

  return {
    ...initValue,
    loading,
    expandedList: getExpandedItems(tempExpandedList, results),
    expandedStatus: {
      expandedAll: breadcrumb.length !== 2,
      activeDestinationSource,
      activeSourceName: activeDestinationSource === 0 ? DOCUMENT_TYPE.FOLDER : DOCUMENT_TYPE.ORGANIZATION_TEAM,
      setActiveDestinationSource,
    },
    changeToNewSource,
    navigateTo,
    breadcrumb,
    search: {
      text: searchText,
      onChange,
      placeholder: getSearchPlaceHolder(),
    },
    getSuccessMessage,
    getInfoOf,
  };
};
