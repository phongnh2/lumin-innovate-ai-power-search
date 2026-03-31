import { BroadcastChannel } from 'broadcast-channel';
import indexedDBService from 'services/indexedDBService';
import { BROADCAST_CHANNEL_KEY } from 'constants/broadcastChannelKey';

jest.mock('broadcast-channel', () => ({
  BroadcastChannel: jest.fn().mockImplementation(() => ({
    postMessage: jest.fn(),
  })),
}));

jest.mock('services/indexedDBService', () => ({
  default: {
    isEnabledAutoCompleteFormField: jest.fn(),
    getAllFormFieldSuggestions: jest.fn(),
    addFormFieldSuggestion: jest.fn(),
    countFormFieldSuggestions: jest.fn(),
    getFormFieldSuggestion: jest.fn(),
    deleteFormFieldSuggestion: jest.fn(),
    clearFormFieldSuggestions: jest.fn(),
  },
  __esModule: true,
}));

describe('FormFieldAutocompleteBase', () => {
  let formFieldAutocompleteBase: any;
  let MAXIMUM_SUGGESTIONS: number;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.isolateModules(() => {
      const baseModule = require('../base');
      formFieldAutocompleteBase = baseModule.formFieldAutocompleteBase;
      MAXIMUM_SUGGESTIONS = baseModule.MAXIMUM_SUGGESTIONS;
    });
  });

  describe('Initialization', () => {
    it('should initialize the broadcast channel with the correct key', () => {
      expect(BroadcastChannel).toHaveBeenCalledWith(BROADCAST_CHANNEL_KEY.UPDATE_FORM_FIELD_SUGGESTION);
    });
  });

  describe('isEnabled', () => {
    it('should call indexedDBService.isEnabledAutoCompleteFormField', async () => {
      (indexedDBService.isEnabledAutoCompleteFormField as jest.Mock).mockResolvedValue(true);
      const result = await formFieldAutocompleteBase.isEnabled('user-123');
      
      expect(indexedDBService.isEnabledAutoCompleteFormField).toHaveBeenCalledWith('user-123');
      expect(result).toBe(true);
    });
  });

  describe('getAll', () => {
    it('should return all suggestions from indexedDB', async () => {
      const mockList = [{ content: 'test', count: 1, dateStamp: 1 }];
      (indexedDBService.getAllFormFieldSuggestions as jest.Mock).mockResolvedValue(mockList);
      
      const result = await formFieldAutocompleteBase.getAll();
      expect(result).toEqual(mockList);
    });
  });

  describe('put', () => {
    const mockItem = { content: 'test', count: 1, dateStamp: 123 };

    it('should increment existing suggestion and NOT broadcast a message', async () => {
      // Branch: isExist is true
      (indexedDBService.getFormFieldSuggestion as jest.Mock).mockResolvedValue(mockItem);
      
      await formFieldAutocompleteBase.put('test');

      expect(indexedDBService.addFormFieldSuggestion).toHaveBeenCalledWith('test');
      expect(formFieldAutocompleteBase.updateSuggestionChannel.postMessage).not.toHaveBeenCalled();
    });

    it('should add new suggestion and broadcast "add" when count is under limit', async () => {
      // Branch: isExist is false, count < MAX
      (indexedDBService.getFormFieldSuggestion as jest.Mock).mockResolvedValue(null);
      (indexedDBService.countFormFieldSuggestions as jest.Mock).mockResolvedValue(5);
      (indexedDBService.addFormFieldSuggestion as jest.Mock).mockResolvedValue(mockItem);

      await formFieldAutocompleteBase.put('new-item');

      expect(indexedDBService.addFormFieldSuggestion).toHaveBeenCalledWith('new-item');
      expect(formFieldAutocompleteBase.updateSuggestionChannel.postMessage).toHaveBeenCalledWith({
        suggestion: mockItem,
        action: 'add',
      });
    });

    it('should delete the least frequency suggestion when limit is reached', async () => {
      // Branch: count >= MAXIMUM_SUGGESTIONS
      (indexedDBService.getFormFieldSuggestion as jest.Mock).mockResolvedValue(null);
      (indexedDBService.countFormFieldSuggestions as jest.Mock).mockResolvedValue(MAXIMUM_SUGGESTIONS);
      
      const mockList = [
        { content: 'keep', count: 10, dateStamp: 200 },
        { content: 'delete-me', count: 1, dateStamp: 100 },
      ];
      (indexedDBService.getAllFormFieldSuggestions as jest.Mock).mockResolvedValue(mockList);
      (indexedDBService.deleteFormFieldSuggestion as jest.Mock).mockResolvedValue(mockList[1]);
      (indexedDBService.addFormFieldSuggestion as jest.Mock).mockResolvedValue({ content: 'new' });

      await formFieldAutocompleteBase.put('new');

      // Verifies sorting logic: orderBy count desc, dateStamp desc, then pop()
      expect(indexedDBService.deleteFormFieldSuggestion).toHaveBeenCalledWith('delete-me');
      expect(formFieldAutocompleteBase.updateSuggestionChannel.postMessage).toHaveBeenCalledWith({
        suggestion: mockList[1],
        action: 'delete',
      });
    });
  });

  describe('delete', () => {
    it('should delete item and broadcast "delete" action', async () => {
      const mockItem = { content: 'del', count: 1, dateStamp: 1 };
      (indexedDBService.deleteFormFieldSuggestion as jest.Mock).mockResolvedValue(mockItem);

      await formFieldAutocompleteBase.delete('del');

      expect(indexedDBService.deleteFormFieldSuggestion).toHaveBeenCalledWith('del');
      expect(formFieldAutocompleteBase.updateSuggestionChannel.postMessage).toHaveBeenCalledWith({
        suggestion: mockItem,
        action: 'delete',
      });
    });
  });

  describe('clear', () => {
    it('should call indexedDBService.clearFormFieldSuggestions', async () => {
      await formFieldAutocompleteBase.clear();
      expect(indexedDBService.clearFormFieldSuggestions).toHaveBeenCalled();
    });
  });
});