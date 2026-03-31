import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useDocumentSelectionStore } from 'luminComponents/Document/hooks/useDocumentSelectionStore';

import { MiniAppTrackingProps, TRACKING_INCLUDE_KEYS } from 'utils/miniAppTrackings';
import { eventTracking } from 'utils/recordUtil';

import { useMiniAppsStore } from 'features/MiniApps/hooks/useMiniAppsStore';

import { CUSTOM_EVENT } from 'constants/customEvent';

import { IDocumentBase } from 'interfaces/document/document.interface';

type AttributeProvider = () => Record<string, unknown>;
type AttributeProviders = Record<string, AttributeProvider>;

type BuildTrackingAttributesProps = {
  baseAttributes: Record<string, unknown>;
  includeKeys: string[];
  providers: AttributeProviders;
};

type CreateTrackingProvidersProps = {
  appInfo: { appId: string; appName: string };
  documentId?: string;
  selectedDocuments?: IDocumentBase[];
};

const buildTrackingAttributes = (props: BuildTrackingAttributesProps): Record<string, unknown> => {
  const { baseAttributes, includeKeys, providers } = props;
  const includeKeyData = includeKeys.reduce((acc, attr) => {
    const provider = providers[attr];
    return provider ? { ...acc, ...provider() } : acc;
  }, {});

  return {
    ...baseAttributes,
    ...includeKeyData,
  };
};

const createTrackingProviders = ({
  appInfo,
  documentId,
  selectedDocuments,
}: CreateTrackingProvidersProps): AttributeProviders => ({
  [TRACKING_INCLUDE_KEYS.APP_INFO]: () => appInfo,
  [TRACKING_INCLUDE_KEYS.DOCUMENT_ID]: () => {
    if (documentId) {
      return { documentId };
    }

    return { documentId: selectedDocuments.map((doc) => doc._id) ?? '' };
  },
});

export const useMiniAppTracking = () => {
  const currentDocument = useSelector(selectors.getCurrentDocument);

  useEffect(() => {
    const handleMiniAppTracking = (event: CustomEvent<MiniAppTrackingProps>) => {
      const { eventName, attributes, includeKeys } = event.detail;

      const { activeApp } = useMiniAppsStore.getState();
      const { selectedDocuments } = useDocumentSelectionStore.getState();

      const appInfo = {
        appId: activeApp.appId,
        appName: activeApp.appName,
      };

      const providers = createTrackingProviders({
        appInfo,
        selectedDocuments,
        documentId: currentDocument?._id,
      });
      const allAttributes = buildTrackingAttributes({ baseAttributes: attributes, includeKeys, providers });

      eventTracking(eventName, allAttributes).catch(() => {});
    };

    window.addEventListener(CUSTOM_EVENT.MINIAPP_TRACKING, handleMiniAppTracking);

    return () => {
      window.removeEventListener(CUSTOM_EVENT.MINIAPP_TRACKING, handleMiniAppTracking);
    };
  }, []);
};
