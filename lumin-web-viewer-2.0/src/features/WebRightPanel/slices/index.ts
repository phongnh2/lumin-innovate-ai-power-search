import { RIGHT_PANEL_VALUES } from '../constants';

export interface RightPanelStore {
  activePanel: RIGHT_PANEL_VALUES | null;
  setActivePanel: (panel: RIGHT_PANEL_VALUES | null) => void;
}
