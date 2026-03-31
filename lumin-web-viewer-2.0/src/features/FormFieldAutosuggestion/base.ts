/* eslint-disable class-methods-use-this */
import { BroadcastChannel } from 'broadcast-channel';
import orderBy from 'lodash/orderBy';

import indexedDBService from 'services/indexedDBService';

import { BROADCAST_CHANNEL_KEY } from 'constants/broadcastChannelKey';

import { FormFieldSuggestion } from './types';

export const MAXIMUM_SUGGESTIONS = 100;

export const PutSuggestionResult = {
  ADD: 'ADD',
  UPDATE: 'UPDATE',
} as const;
export type PutSuggestionResultType = typeof PutSuggestionResult[keyof typeof PutSuggestionResult];

class FormFieldAutocompleteBase {
  updateSuggestionChannel: BroadcastChannel<{ suggestion: FormFieldSuggestion; action: string }>;

  constructor() {
    this.updateSuggestionChannel = new BroadcastChannel<{ suggestion: FormFieldSuggestion; action: string }>(
      BROADCAST_CHANNEL_KEY.UPDATE_FORM_FIELD_SUGGESTION
    );
  }

  isEnabled(userId: string): Promise<boolean> {
    return indexedDBService.isEnabledAutoCompleteFormField(userId);
  }

  getAll(): Promise<FormFieldSuggestion[]> {
    return indexedDBService.getAllFormFieldSuggestions();
  }

  async put(suggestion: string): Promise<void> {
    const isExist = await this.isExist(suggestion);
    if (isExist) {
      await indexedDBService.addFormFieldSuggestion(suggestion);
      return;
    }
    const suggestionsQuantity = await indexedDBService.countFormFieldSuggestions();
    if (suggestionsQuantity >= MAXIMUM_SUGGESTIONS) {
      const leastFrequencySuggestion = await this.getLeastFrequencySuggestion();
      await this.delete(leastFrequencySuggestion.content);
    }
    const item = await indexedDBService.addFormFieldSuggestion(suggestion);
    await this.updateSuggestionChannel.postMessage({ suggestion: item, action: 'add' });
  }

  private async isExist(suggestion: string): Promise<boolean> {
    const item = await indexedDBService.getFormFieldSuggestion(suggestion);
    return Boolean(item);
  }

  private async getLeastFrequencySuggestion(): Promise<FormFieldSuggestion> {
    const listSuggestions = await indexedDBService.getAllFormFieldSuggestions();
    return orderBy(listSuggestions, ['count', 'dateStamp'], ['desc', 'desc']).pop();
  }

  async delete(suggestion: string): Promise<void> {
    const item = await indexedDBService.deleteFormFieldSuggestion(suggestion);
    await this.updateSuggestionChannel.postMessage({ suggestion: item, action: 'delete' });
  }

  async clear(): Promise<void> {
    await indexedDBService.clearFormFieldSuggestions();
  }
}

export const formFieldAutocompleteBase = new FormFieldAutocompleteBase();
