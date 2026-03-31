import { create } from 'zustand';

import { RightPanelStore } from '../slices';

export const useRightPanelStore = create<RightPanelStore>((set) => ({
  activePanel: null,
  setActivePanel: (panel) => set({ activePanel: panel }),
}));
