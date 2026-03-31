import { BroadcastChannel } from 'broadcast-channel';
import Fuse from 'fuse.js';
import React, { useEffect } from 'react';

import { BROADCAST_CHANNEL_KEY } from 'constants/broadcastChannelKey';

import { FormFieldSuggestion } from '../types';

type BroadCastEvent = {
  suggestion: FormFieldSuggestion;
  action: string;
};

type Props = {
  fuseSearchRef: React.MutableRefObject<Fuse<FormFieldSuggestion>>;
  setIsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  initTrieSearch: () => Promise<void>;
};
export const useBroadcastChannel = ({ fuseSearchRef, setIsEnabled, initTrieSearch }: Props): void => {
  const onUpdateSuggestion = ({ suggestion, action }: BroadCastEvent): void => {
    if (fuseSearchRef.current) {
      switch (action) {
        case 'add': {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (fuseSearchRef.current && !(fuseSearchRef.current._docs as string[]).includes(suggestion)) {
            fuseSearchRef.current.add(suggestion);
          }
          break;
        }
        case 'delete': {
          if (fuseSearchRef.current) {
            fuseSearchRef.current.remove((item) => item.content === suggestion.content);
          }
          break;
        }
        default:
          break;
      }
    }
  };

  const onToggleAutoComplete = async (enabled: boolean): Promise<void> => {
    setIsEnabled(enabled);
    if (enabled && !fuseSearchRef.current) {
      await initTrieSearch();
    }
  };

  useEffect(() => {
    const updateSuggestionChannel = new BroadcastChannel<BroadCastEvent>(
      BROADCAST_CHANNEL_KEY.UPDATE_FORM_FIELD_SUGGESTION
    );
    const toggleFeatureChannel = new BroadcastChannel<boolean>(BROADCAST_CHANNEL_KEY.TOGGLE_FORM_FIELD_SUGGESTION);
    updateSuggestionChannel.onmessage = onUpdateSuggestion;
    toggleFeatureChannel.onmessage = onToggleAutoComplete;
    return () => {
      updateSuggestionChannel.close() as unknown;
      toggleFeatureChannel.close() as unknown;
    };
  }, []);
};
