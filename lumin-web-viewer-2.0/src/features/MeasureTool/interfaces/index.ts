import { PaperUnit, DisplayUnit } from '../constants';

export interface ScaleInfo {
  scale: Core.Scale;
  title: string;
  precision: number;
}
export interface MeasureToolState {
  configModal: {
    isOpen: boolean;
    action?: 'create' | 'edit';
    scaleInfo?: ScaleInfo;
    calibrationScale?: Core.Scale;
    callback?: (newScale: Core.Scale) => void;
  };
  isActive: boolean;
  scales: ScaleInfo[];
  selectedScale: ScaleInfo | null;
}

export interface MeasureToolProps {
  icon: string;
  label: string;
  toolName: string;
}

export interface ScaleUnits {
  displayUnit: DisplayUnit;
  paperUnit: PaperUnit;
}

export interface ScaleDistances {
  paperDistance: string;
  displayDistance: string;
}
