import { ReactNode } from 'react';

interface UploadDropZoneProps {
  children: ReactNode;
  highlight?: boolean;
  isOffline?: boolean;
  disabled?: boolean;
}

declare const UploadDropZone: (props: UploadDropZoneProps) => JSX.Element;

export default UploadDropZone;
