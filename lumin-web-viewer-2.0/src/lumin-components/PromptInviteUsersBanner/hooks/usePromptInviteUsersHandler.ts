import { isNull } from 'lodash';
import shuffle from 'lodash/shuffle';
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useWarningBannerController } from 'luminComponents/WarningBanner/hooks';

import { useRestrictedUser, useTabletMatch } from 'hooks';
import useGetOrganizationData from 'hooks/useGetOrganizationData';

import { googleServices, documentServices, organizationServices } from 'services';
import type {
  PromptInviteUsersBannerResponse,
  PromptInviteGoogleUsersParams,
} from 'services/types/documentServices.types';

import logger from 'helpers/logger';

import { hotjarUtils, avatar } from 'utils';

import { CNC_LOCAL_STORAGE_KEY } from 'features/CNC/constants/customConstant';

import { WarningBannerType } from 'constants/banner';
import { HOTJAR_EVENT } from 'constants/hotjarEvent';
import { LOGGER } from 'constants/lumin-common';
import { InviteUsersSetting } from 'constants/organization.enum';
import { InviteBannerType, ORG_TEXT } from 'constants/organizationConstants';

import { IOrganization } from 'interfaces/organization/organization.interface';

import { cachingHandlers, localStorageHandlers, TrackBannerEventHandlers } from '../handlers';
import {
  CloseBannerReason,
  PromptInviteGoogleUsersHandlerProps,
  CreateRequestPayloadProps,
  InviteUserAvatar,
} from '../PromptInviteUsersBanner.types';

export type UsePromptInviteUsersBannerHandlerData = {
  isFetching: boolean;
  isShowBanner: boolean;
  setIsShowBanner: React.Dispatch<React.SetStateAction<boolean>>;
  isShowAddMembersModal: boolean;
  canShowBanner: boolean;
  bannerContent: {
    multiLanguageKey: string;
    attributes?: Record<string, string | number>;
  };
  promptUsersData: PromptInviteUsersBannerResponse;
  setPromptUsersData: React.Dispatch<React.SetStateAction<PromptInviteUsersBannerResponse>>;
  getCurrentOrgId(): string;
  setCurrentOrgId(orgId: string): void;
  handlePreviewBanner(): void;
  handleCloseBanner(closeReason: CloseBannerReason): void;
  handleToggleAddMembersModal(): void;
  getPromptGoogleUsersHandler(params: PromptInviteGoogleUsersHandlerProps): Promise<void>;
  actionButtonText: string;
  isManager: boolean;
  inviteUserAvatars: InviteUserAvatar[];
  currentOrganization: IOrganization;
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>;
};

const defaultValue: PromptInviteUsersBannerResponse = {
  orgId: '',
  bannerType: '',
  inviteUsers: [],
};
const usePromptInviteUsersBannerHandler = (): UsePromptInviteUsersBannerHandlerData => {
  const navigate = useNavigate();
  const isTabletMatch = useTabletMatch();

  const canShowBannerRef = useRef<boolean>(false);
  const currentOrganizationId = useRef<string>('');
  const abortControllerRef = useRef<AbortController>();

  const { isHidePromptDriveUsersBanner } = useRestrictedUser();

  const [isFetching, setIsFetching] = useState(true);
  const [isShowBanner, setIsShowBanner] = useState(false);
  const [isShowAddMembersModal, setIsShowAddMembersModal] = useState(false);
  const [promptUsersData, setPromptUsersData] = useState<PromptInviteUsersBannerResponse>(defaultValue);

  const currentOrganization = useGetOrganizationData();

  const controller = useWarningBannerController();

  const isManager = useMemo(() => organizationServices.isManager(currentOrganization?.userRole), [currentOrganization]);

  const bannerContent = useMemo((): {
    multiLanguageKey: string;
    attributes?: Record<string, string | number>;
  } => {
    const { bannerType, inviteUsers } = promptUsersData;
    switch (bannerType) {
      case InviteBannerType.PENDING_REQUEST:
        return {
          multiLanguageKey:
            inviteUsers?.length > 1
              ? 'banner.promptInviteUsersBanner.contentMultiplesPendingRequest'
              : 'banner.promptInviteUsersBanner.contentSinglePendingRequest',
          attributes: {
            amount: inviteUsers?.length,
            orgName: currentOrganization?.name || '',
          },
        };
      case InviteBannerType.GOOGLE_CONTACT:
        return {
          multiLanguageKey:
            inviteUsers?.length > 1
              ? 'banner.promptInviteUsersBanner.contentMultiples'
              : 'banner.promptInviteUsersBanner.contentSingle',
          attributes: {
            amount: inviteUsers?.length,
            orgName: currentOrganization?.name || '',
          },
        };
      case InviteBannerType.INVITE_MEMBER:
        return {
          multiLanguageKey: 'banner.promptInviteUsersBanner.inviteMember',
          attributes: {
            orgName: currentOrganization?.name || '',
          },
        };
      default:
        break;
    }
  }, [currentOrganization?.name, promptUsersData]);

  const canShowBanner = useMemo((): boolean => {
    const orgHasBeenDeactivated = Boolean(currentOrganization?.deletedAt);
    if (!currentOrganization || orgHasBeenDeactivated) return false;

    const memberCanInvite = currentOrganization?.settings?.inviteUsersSetting === InviteUsersSetting.ANYONE_CAN_INVITE;
    const value = isTabletMatch && (memberCanInvite || isManager);

    canShowBannerRef.current = value;
    return value;
  }, [currentOrganization, isTabletMatch]);

  const abortRequest = (): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = undefined;
    }
  };

  const getCurrentOrgId = (): string => currentOrganizationId.current;

  const setCurrentOrgId = (orgId: string): void => {
    currentOrganizationId.current = orgId;
  };

  const handleCloseBanner = (closeReason: CloseBannerReason): void => {
    const orgId = getCurrentOrgId();

    abortRequest();
    cachingHandlers.remove(orgId);
    localStorageHandlers.setExpirationTime({ orgId, show: false, closeReason });

    const { bannerType } = promptUsersData;
    if (closeReason === CloseBannerReason.CLICK_CLOSE_BTN && bannerType) {
      const trackBannerEventHandlers = new TrackBannerEventHandlers(bannerType);
      trackBannerEventHandlers.dismiss().finally(() => {});
    }

    setIsShowBanner(false);
    controller.setBannerClosed(
      bannerType === InviteBannerType.INVITE_MEMBER
        ? 'prompt_invite_users'
        : WarningBannerType.ACCEPT_PENDING_REQUEST.value
    );
  };

  const handleToggleAddMembersModal = (): void => {
    setIsShowAddMembersModal((prevState) => {
      if (!prevState) {
        hotjarUtils.trackEvent(HOTJAR_EVENT.MODAL_VIEWED_INVITE_CIRCLE_MEMBER);
      }
      if (prevState) {
        handleCloseBanner(CloseBannerReason.CLICK_CTA_BTN);
      }
      return !prevState;
    });
  };

  const handlePreviewBanner = (): void => {
    const { bannerType } = promptUsersData;
    if (isFetching || !bannerType) return;

    const trackBannerEventHandlers = new TrackBannerEventHandlers(bannerType);
    trackBannerEventHandlers.confirm().finally(() => {});

    switch (bannerType) {
      case InviteBannerType.PENDING_REQUEST: {
        navigate(`/${ORG_TEXT}/${currentOrganization.url}/dashboard/people#requesting-access`);
        handleCloseBanner(CloseBannerReason.CLICK_CTA_BTN);
        break;
      }
      case InviteBannerType.GOOGLE_CONTACT:
      case InviteBannerType.INVITE_MEMBER:
        handleToggleAddMembersModal();
        break;
      default:
        break;
    }
  };

  const actionButtonText = useMemo((): string => {
    const { bannerType } = promptUsersData;
    switch (bannerType) {
      case InviteBannerType.PENDING_REQUEST:
      case InviteBannerType.GOOGLE_CONTACT:
        return 'banner.promptInviteUsersBanner.previewBtnText';
      case InviteBannerType.INVITE_MEMBER:
        return 'banner.promptInviteUsersBanner.inviteBtnText';
      default:
        break;
    }
  }, [promptUsersData]);

  const createRequestPayload = ({ orgId, forceUpdate }: CreateRequestPayloadProps): PromptInviteGoogleUsersParams => {
    const googleImplicitAccessToken = googleServices.getImplicitAccessToken();

    return {
      orgId,
      forceUpdate,
      accessToken: googleImplicitAccessToken?.access_token || '',
      googleAuthorizationEmail: googleImplicitAccessToken?.email || '',
    };
  };

  const getPromptGoogleUsersHandler = async ({
    orgId,
    forceUpdate = false,
  }: PromptInviteGoogleUsersHandlerProps): Promise<void> => {
    // Abort request when new request is sent and previous request it not completed
    abortRequest();

    const authorizedUserHasPopularDomain = await googleServices.checkAuthorizedUserHasPopularDomain();

    if (authorizedUserHasPopularDomain || !canShowBannerRef.current || isHidePromptDriveUsersBanner) {
      canShowBannerRef.current = false;

      cachingHandlers.remove(orgId);
      localStorageHandlers.removeItemByOrg(orgId);

      setIsShowBanner(false);
      setPromptUsersData(defaultValue);
      setIsFetching(false);
      return;
    }

    const closeReason = localStorageHandlers.getCloseBannerReason(orgId);
    const isRefetchingTimeExpired = localStorageHandlers.checkExpirationTimeExpired(orgId);

    if (!isRefetchingTimeExpired && (!forceUpdate || closeReason === CloseBannerReason.CLICK_CLOSE_BTN)) {
      setIsFetching(false);
      return;
    }

    const requestPayload = createRequestPayload({ orgId, forceUpdate });
    abortControllerRef.current = new AbortController();

    try {
      setIsFetching(true);

      const response = await documentServices.getPromptInviteUsersBanner(requestPayload, {
        signal: abortControllerRef.current.signal,
      });
      if (!response) return;

      const hasData = Boolean(response);

      if (hasData) {
        cachingHandlers.set(orgId, { ...response, orgId });
        if (response.inviteUsers.length) {
          localStorage.setItem(
            CNC_LOCAL_STORAGE_KEY.DRIVE_USERS_CAN_INVITE_TO_WORKSPACE,
            JSON.stringify(response.inviteUsers)
          );
        }
      } else {
        cachingHandlers.remove(orgId);
      }

      localStorageHandlers.setExpirationTime({
        orgId,
        show: hasData,
        closeReason: hasData ? undefined : CloseBannerReason.HAS_NO_DATA,
      });

      setPromptUsersData({ ...response, orgId });
      setIsShowBanner(hasData);
    } catch (error: unknown) {
      logger.logError({
        error,
        reason: LOGGER.Service.GET_PROMPT_INVITE_USERS_ERROR,
      });
      cachingHandlers.remove(orgId);

      setIsShowBanner(false);
      setPromptUsersData(defaultValue);
    } finally {
      abortControllerRef.current = undefined;
      setIsFetching(false);
    }
  };

  const inviteUserAvatars = useMemo(() => {
    const { inviteUsers } = promptUsersData;
    const withAvatar = inviteUsers.filter((user) => !!user.avatarRemoteId);
    const withoutAvatar = inviteUsers.filter((user) => !user.avatarRemoteId);

    const shuffledWithAvatar = shuffle(withAvatar);

    return [...shuffledWithAvatar, ...withoutAvatar].map((user) => ({
      src: user.avatarRemoteId ? avatar.getAvatar(user.avatarRemoteId) : '',
      name: user.name,
    }));
  }, [promptUsersData]);

  return {
    isFetching: isFetching && !isNull(currentOrganization),
    setIsFetching,
    isShowBanner,
    setIsShowBanner,
    isShowAddMembersModal,
    canShowBanner,
    bannerContent,
    promptUsersData,
    setPromptUsersData,
    getCurrentOrgId,
    setCurrentOrgId,
    handleCloseBanner,
    handlePreviewBanner,
    handleToggleAddMembersModal,
    getPromptGoogleUsersHandler,
    actionButtonText,
    isManager,
    inviteUserAvatars,
    currentOrganization,
  };
};

export default usePromptInviteUsersBannerHandler;
