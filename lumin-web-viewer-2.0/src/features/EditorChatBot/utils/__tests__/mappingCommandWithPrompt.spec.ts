import { TFunction } from 'react-i18next';

import { CHATBOT_AUTO_COMMANDS } from '../../constants';
import { mappingCommandWithPrompt } from '../mappingCommandWithPrompt';

describe('mappingCommandWithPrompt', () => {
  const mockT = jest.fn() as jest.MockedFunction<TFunction>;

  beforeEach(() => {
    mockT.mockClear();
  });

  it('should return summarize prompt for SUMMARIZE command', () => {
    const expectedPrompt = 'Summarize this document for me';
    mockT.mockReturnValue(expectedPrompt);

    const result = mappingCommandWithPrompt(CHATBOT_AUTO_COMMANDS.SUMMARIZE, mockT);

    expect(mockT).toHaveBeenCalledWith('viewer.quickActions.ask.items.0.prompt');
    expect(result).toBe(expectedPrompt);
  });

  it('should return ask about document prompt for ASK_ABOUT_DOCUMENT command', () => {
    const expectedPrompt = 'What questions can I ask about this document?';
    mockT.mockReturnValue(expectedPrompt);

    const result = mappingCommandWithPrompt(CHATBOT_AUTO_COMMANDS.ASK_ABOUT_DOCUMENT, mockT);

    expect(mockT).toHaveBeenCalledWith('viewer.quickActions.ask.items.1.prompt');
    expect(result).toBe(expectedPrompt);
  });

  it('should return redact sensitive info prompt for REDACT_SENSITIVE_INFO command', () => {
    const expectedPrompt = 'Help me redact sensitive information';
    mockT.mockReturnValue(expectedPrompt);

    const result = mappingCommandWithPrompt(CHATBOT_AUTO_COMMANDS.REDACT_SENSITIVE_INFO, mockT);

    expect(mockT).toHaveBeenCalledWith('viewer.quickActions.edit.items.0.prompt');
    expect(result).toBe(expectedPrompt);
  });

  it('should return empty string for unknown command', () => {
    const result = mappingCommandWithPrompt('unknown_command', mockT);

    expect(mockT).not.toHaveBeenCalled();
    expect(result).toBe('');
  });

  it('should return empty string for empty command', () => {
    const result = mappingCommandWithPrompt('', mockT);

    expect(mockT).not.toHaveBeenCalled();
    expect(result).toBe('');
  });

  it('should handle null/undefined translation result gracefully', () => {
    mockT.mockReturnValue(undefined as any);

    const result = mappingCommandWithPrompt(CHATBOT_AUTO_COMMANDS.SUMMARIZE, mockT);

    expect(mockT).toHaveBeenCalledWith('viewer.quickActions.ask.items.0.prompt');
    expect(result).toBeUndefined();
  });

  it('should pass through any translation result type', () => {
    const expectedPrompt = 'Custom translation result';
    mockT.mockReturnValue(expectedPrompt);

    const result = mappingCommandWithPrompt(CHATBOT_AUTO_COMMANDS.ASK_ABOUT_DOCUMENT, mockT);

    expect(result).toBe(expectedPrompt);
  });

  describe('constants verification', () => {
    it('should use correct CHATBOT_AUTO_COMMANDS constants', () => {
      expect(CHATBOT_AUTO_COMMANDS.SUMMARIZE).toBeDefined();
      expect(CHATBOT_AUTO_COMMANDS.ASK_ABOUT_DOCUMENT).toBeDefined();
      expect(CHATBOT_AUTO_COMMANDS.REDACT_SENSITIVE_INFO).toBeDefined();
    });
  });
});
