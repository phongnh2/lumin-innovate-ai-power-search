import { useEffect, useRef } from 'react';
import { UseFormWatch } from 'react-hook-form';

import logger from 'helpers/logger';

import { getOAuth2ClientLogo } from 'features/DeveloperApi/apis/oauth2';
import { OAUTH2_LOGO_MOCK_URI } from 'features/DeveloperApi/constants/url';
import { useApiAppContext } from 'features/DeveloperApi/hooks/useApiAppContext';

const isLogoExpired = (expiresAt?: number): boolean => {
  if (!expiresAt) {
    return true;
  }

  return Date.now() >= expiresAt;
};

export const useSetupAppLogoEditMode = ({ watch }: { watch: UseFormWatch<{ file?: File }> }) => {
  const file = watch('file' as keyof typeof watch) as unknown as File | string;
  const { setAppScreenState, appScreenState, updateOAuthClient } = useApiAppContext();
  const previewLogoFileId = appScreenState.type === 'editting' ? appScreenState?.payload?.previewLogo?.fileId : null;
  const previewLogoUrl = appScreenState.type === 'editting' ? appScreenState?.payload?.previewLogo?.src : null;
  const previewLogoExpiresAt =
    appScreenState.type === 'editting' ? appScreenState?.payload?.previewLogo?.expiresAt : null;
  const appId = appScreenState.type === 'editting' ? appScreenState?.payload?.id : null;
  const fetchedFileIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (previewLogoUrl || file instanceof File) {
      return;
    }

    if (appScreenState.type !== 'editting' || typeof file !== 'string' || !file.startsWith(OAUTH2_LOGO_MOCK_URI)) {
      return;
    }

    const url = new URL(file);
    const fileRemoteId = url.searchParams.get('ref');
    if (!fileRemoteId) {
      return;
    }

    const hasValidCachedLogo =
      previewLogoUrl && previewLogoFileId === fileRemoteId && !isLogoExpired(previewLogoExpiresAt);

    if (hasValidCachedLogo) {
      return;
    }

    if (fetchedFileIdRef.current === fileRemoteId && !isLogoExpired(previewLogoExpiresAt)) {
      return;
    }

    fetchedFileIdRef.current = fileRemoteId;
    const abortController = new AbortController();
    let isStale = false;

    async function fetchPreviewLogoUrl() {
      try {
        const logoUrl = await getOAuth2ClientLogo({ fileId: fileRemoteId, signal: abortController.signal });
        if (isStale) {
          return;
        }

        updateOAuthClient({
          id: appId,
          previewLogo: {
            fileId: fileRemoteId,
            src: logoUrl.url,
            expiresAt: logoUrl.expiresAt,
          },
        });
        setAppScreenState((prev) => ({
          ...prev,
          ...(prev.type === 'editting' && {
            payload: {
              ...prev.payload,
              previewLogo: { fileId: fileRemoteId, src: logoUrl.url, expiresAt: logoUrl.expiresAt },
            },
          }),
        }));
      } catch (error) {
        if ((error as Error).name === 'AbortError' || (error as Error).name === 'CanceledError' || isStale) {
          return;
        }

        fetchedFileIdRef.current = null;

        logger.logError({
          message: 'Error fetching client app logo',
          error: error as Error,
        });
      }
    }

    fetchPreviewLogoUrl().catch(() => {});

    return () => {
      isStale = true;
      abortController.abort();
    };
  }, [previewLogoFileId, previewLogoUrl, file, appScreenState.type, appId, previewLogoExpiresAt]);
};
