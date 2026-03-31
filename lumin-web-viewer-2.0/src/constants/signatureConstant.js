import defaultSignature__1 from 'assets/images/signature_freehand.png';
import defaultSignature__2 from 'assets/images/signature_image.png';
import defaultSignature__3 from 'assets/images/signature_text.png';

export const DEFAULT_SIGNATURES = [
    defaultSignature__1,
    defaultSignature__2,
    defaultSignature__3,
];

export const SIGNATURE_ACTIONS = {
  ADDED: 'ADDED',
  DELETED: 'DELETED',
  FETCHED_MORE: 'FETCHED_MORE',
  REORDERED: 'REORDERED',
};

export const DROP_ACTIONS = {
  DROP: 'DROP',
  CANCEL: 'CANCEL',
};

export const DEFAULT_SIGNATURE_MAXIMUM_DIMENSION = 200;