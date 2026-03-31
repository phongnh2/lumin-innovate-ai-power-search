jest.mock('core', () => ({
  __esModule: true,
  default: {
    getAnnotationManager: jest.fn().mockReturnValue({
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }),
  },
}));

jest.mock('features/FormFieldAutosuggestion', () => ({
  formFieldAutocompleteBase: { put: jest.fn() },
  isAutocompleteItem: jest.fn(),
  MAX_CHARACTERS_LENGTH: 255,
  MIN_CHARACTERS_LENGTH: 3,
}));

import { renderHook } from '@testing-library/react';
import core from 'core';
import { useTextFieldChanged } from '../useTextFieldChanged';
import { formFieldAutocompleteBase, isAutocompleteItem } from 'features/FormFieldAutosuggestion';
import { WIDGET_TYPE } from 'constants/formBuildTool';

describe('useTextFieldChanged', () => {
  const props = {
    isMouseClickMenuRef: { current: false },
    highlightRef: { current: null as any },
    isEnabledRef: { current: true },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.Core = {
      Annotations: { WidgetFlags: { MULTILINE: 'multiline_flag' } }
    } as any;
  });

  it('should ignore non-text or multiline fields', async () => {
    renderHook(() => useTextFieldChanged(props));
    const handleFieldChange = (core.getAnnotationManager().addEventListener as jest.Mock).mock.calls[0][1];

    const multilineField = {
      type: WIDGET_TYPE.TEXT,
      flags: { get: jest.fn().mockReturnValue(true) }
    };

    await handleFieldChange(multilineField, 'some value');
    expect(formFieldAutocompleteBase.put).not.toHaveBeenCalled();
  });

  it('should ignore values that are too short or too long', async () => {
    renderHook(() => useTextFieldChanged(props));
    const handleFieldChange = (core.getAnnotationManager().addEventListener as jest.Mock).mock.calls[0][1];
    const mockField = { type: WIDGET_TYPE.TEXT, flags: { get: jest.fn().mockReturnValue(false) } };

    await handleFieldChange(mockField, 'ab'); // Too short
    await handleFieldChange(mockField, 'a'.repeat(256)); // Too long
    
    expect(formFieldAutocompleteBase.put).not.toHaveBeenCalled();
  });

  it('should ignore if user is currently interacting with the autocomplete menu', async () => {
    renderHook(() => useTextFieldChanged(props));
    const handleFieldChange = (core.getAnnotationManager().addEventListener as jest.Mock).mock.calls[0][1];
    const mockField = { type: WIDGET_TYPE.TEXT, flags: { get: jest.fn().mockReturnValue(false) } };

    (isAutocompleteItem as jest.Mock).mockReturnValue(true); // Focus is on menu
    await handleFieldChange(mockField, 'Valid Value');
    
    expect(formFieldAutocompleteBase.put).not.toHaveBeenCalled();
  });

  it('should put value when all conditions are met', async () => {
    renderHook(() => useTextFieldChanged(props));
    const handleFieldChange = (core.getAnnotationManager().addEventListener as jest.Mock).mock.calls[0][1];
    const mockField = { type: WIDGET_TYPE.TEXT, flags: { get: jest.fn().mockReturnValue(false) } };
    
    (isAutocompleteItem as jest.Mock).mockReturnValue(false);

    await handleFieldChange(mockField, '  Successful Put  ');
    expect(formFieldAutocompleteBase.put).toHaveBeenCalledWith('Successful Put');
  });
});