import dayjs from 'dayjs';
import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router';

import { useGetCurrentUser, useRestrictedUser, useGetCurrentOrganization, useHomeMatch, useDesktopMatch } from 'hooks';
import useTemplatesPageMatch from 'hooks/useTemplatesPageMatch';

import { getRedirectOrgUrl } from 'utils/orgUrlUtils';

import { ORG_ROUTES } from 'constants/Routers';
import { PROMOTE_TEMPLATES_EXPIRY } from 'constants/urls';

import { usePromoteTemplatesStore } from './usePromoteTemplatesStore';
import { promoteTemplatesLocalStorage } from '../utils/localStorage';
import { promoteTemplatesController } from '../utils/promoteTemplatesController';

const MAX_DISMISS_COUNT = 3;

const usePromoteTemplates = () => {
  const currentUser = useGetCurrentUser();
  const navigate = useNavigate();
  const currentOrganization = useGetCurrentOrganization();

  const { templateManagementEnabled } = useRestrictedUser();
  const { isTemplatesPage } = useTemplatesPageMatch();
  const { isHomePage } = useHomeMatch();
  const isDesktopMatch = useDesktopMatch();

  const { opened, setOpened } = usePromoteTemplatesStore();
  const [isOpenPopover, setOpenPopover] = useState(true);
  const [isHoveringPopover, setIsHoveringPopover] = useState(false);

  const isPromoteTemplatesExpired = dayjs().isAfter(dayjs(PROMOTE_TEMPLATES_EXPIRY));

  const hasNotVisitedTemplateList =
    !isPromoteTemplatesExpired && !promoteTemplatesController.getState().visited && templateManagementEnabled;

  const shouldOpenPopover = useCallback(
    async () =>
      (await promoteTemplatesLocalStorage.getDismissCount(currentUser?._id)) < MAX_DISMISS_COUNT &&
      !promoteTemplatesController.getState().hasShownPopover &&
      isDesktopMatch &&
      hasNotVisitedTemplateList,
    [currentUser?._id, hasNotVisitedTemplateList, isDesktopMatch]
  );

  const setVisited = useCallback(() => {
    promoteTemplatesController.setVisited(true);
    promoteTemplatesLocalStorage.setVisitedStatus(currentUser?._id).catch(() => {});
  }, [currentUser?._id]);

  const handleClosePopover = useCallback(() => {
    if (!opened) {
      return;
    }
    setOpenPopover(false);
    promoteTemplatesController.setHasShownPopover(true);
    promoteTemplatesLocalStorage.incrementDismissCount(currentUser?._id).catch(() => {});
  }, [currentUser?._id, opened]);

  const onClickTryItNow = useCallback(() => {
    setOpenPopover(false);
    navigate(getRedirectOrgUrl({ orgUrl: currentOrganization?.url, path: ORG_ROUTES.TEMPLATES }));
  }, [currentOrganization?.url, navigate]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isOpenPopover) {
      timeoutId = setTimeout(() => {
        handleClosePopover();
      }, 12000); // 12 seconds
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isOpenPopover, isHoveringPopover, handleClosePopover]);

  useEffect(() => {
    const checkShouldOpenPopover = async () => {
      const shouldOpen = Boolean(await shouldOpenPopover());
      setOpened(isHomePage && shouldOpen && (isOpenPopover || isHoveringPopover));
    };
    checkShouldOpenPopover();
  }, [isHomePage, shouldOpenPopover, isOpenPopover, isHoveringPopover, setOpened]);

  useEffect(() => {
    if (isHomePage) {
      setOpenPopover(true);
    }
  }, [isHomePage]);

  useEffect(() => {
    const checkVisitedStatus = async () => {
      if (currentUser?._id) {
        if (isTemplatesPage) {
          promoteTemplatesController.setVisited(true);
          promoteTemplatesLocalStorage.setVisitedStatus(currentUser?._id).catch(() => {});
          return;
        }
        try {
          const visited = await promoteTemplatesLocalStorage.getHasVisitedStatus(currentUser._id);
          promoteTemplatesController.setVisited(Boolean(visited));
        } catch (error) {
          promoteTemplatesController.setVisited(false);
        }
      }
    };

    checkVisitedStatus();
  }, [currentUser?._id, isTemplatesPage]);

  return {
    hasNotVisitedTemplateList,
    setVisited,
    onClickLater: handleClosePopover,
    setIsHoveringPopover,
    isOpenPopover: opened,
    onClickTryItNow,
  };
};

export default usePromoteTemplates;
