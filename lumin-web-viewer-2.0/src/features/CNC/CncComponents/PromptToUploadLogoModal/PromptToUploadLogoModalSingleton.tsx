import React from 'react';

import { usePromptToUploadLogoStore } from './hooks/usePromptToUploadLogoStore';
import PromptToUploadLogoModal from './PromptToUploadLogoModal';

export default function PromptToUploadLogoModalSingleton() {
  const { isOpen, promptType, onChange } = usePromptToUploadLogoStore();

  if (!isOpen || !promptType) return null;

  return <PromptToUploadLogoModal promptType={promptType} onChange={onChange ?? (() => {})} />;
}
