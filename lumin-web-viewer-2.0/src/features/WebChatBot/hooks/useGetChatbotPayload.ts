import { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import {
  useGetCurrentFolder,
  useGetCurrentOrganization,
  useGetCurrentTeam,
  useGetFolderType,
  useHomeMatch,
} from 'hooks';

import logger from 'helpers/logger';

import { getLanguageAttr } from 'utils/getCommonAttributes';

import { DocumentTab, DocumentTabMapping, folderType } from 'constants/documentConstants';

import { ITeam } from 'interfaces/team/team.interface';

export const useGetChatbotPayload = () => {
  const currentOrganization = useGetCurrentOrganization();
  const currentTeam = useGetCurrentTeam() as ITeam;
  const currentFolder = useGetCurrentFolder();
  const currentFolderType = useGetFolderType();
  const { isRecentTab, isTrendingTab } = useHomeMatch();
  const { folderType: homeListType, selectedTeam: homeSelectedTeam } = useSelector(selectors.getTeamSelectorData);

  const [languageAttrs, setLanguageAttrs] = useState<{ LuminLanguage: string; browserLanguage: string | null } | null>(null);

  useEffect(() => {
    const fetchLanguageAttrs = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const attrs = (await getLanguageAttr()) as { LuminLanguage: string; browserLanguage: string | null };
        setLanguageAttrs(attrs);
      } catch (error) {
        logger.logError({
          message: 'Error fetching language attributes for chatbot payload',
          error: error as Error,
        });
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchLanguageAttrs();
  }, []);

  return useMemo(() => {
    const documentTab = DocumentTabMapping[currentFolderType as keyof typeof DocumentTabMapping];

    const metadata = {
      luminLanguage: languageAttrs?.LuminLanguage || null,
      browserLanguage: languageAttrs?.browserLanguage || null,
    };

    if (isRecentTab) {
      return {
        orgId: currentOrganization?._id,
        documentTab: DocumentTab.RECENT,
        metadata,
      };
    }
    if (isTrendingTab) {
      if (homeListType === folderType.ORGANIZATION) {
        return {
          orgId: currentOrganization?._id,
          documentTab: DocumentTab.TRENDING,
          metadata,
        };
      }
      return {
        orgId: currentOrganization?._id,
        currentTeamId: homeSelectedTeam?._id,
        documentTab: DocumentTab.TRENDING,
        metadata,
      };
    }
    return {
      orgId: currentOrganization?._id,
      currentTeamId: currentTeam?._id,
      folderId: currentFolder?._id,
      documentTab,
      metadata,
    };
  }, [
    currentFolderType,
    isRecentTab,
    isTrendingTab,
    currentOrganization,
    currentTeam,
    currentFolder,
    homeListType,
    homeSelectedTeam,
    languageAttrs,
  ]);
};
