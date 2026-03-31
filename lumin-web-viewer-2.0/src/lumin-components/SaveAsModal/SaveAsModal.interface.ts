import { PdfActionType } from 'features/EnableToolFromQueryParams/type';

export interface IFormatOptions {
  key: string;
  title: string;
  type: string;
  icon: string;
}

export interface ISaveAsModalLayoutProps {
  isWarningType: boolean;
  canSaveToGoogleDrive: boolean;
  isOpen: boolean;
  type: string;
  options: IFormatOptions[];
  optionsMapper: Record<string, Record<string, string>>;
  openedElementData: Record<string, unknown>;
  actionQuery: PdfActionType;
  handleClickItem: (selectionType: string, callback?: () => void) => void;
  handleCloseSaveAsModal: () => void;
  handleSaveOnComputer: () => void;
  setSyncFileTo: React.Dispatch<React.SetStateAction<string>>;
  handleResetData: () => void;
  flattenPdf: boolean;
  setFlattenPdf: (value: boolean) => void;
}
