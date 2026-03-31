import { togglePresenterMode } from 'features/FullScreen/helpers/togglePresenterMode';

export const presenterToggleKeyDownHandler = (e: KeyboardEvent) => {
  if (!e.metaKey && !e.ctrlKey) {
    return;
  }

  // (Ctrl/Cmd + Enter)
  if (e.key === 'Enter') {
    togglePresenterMode();
  }
};
