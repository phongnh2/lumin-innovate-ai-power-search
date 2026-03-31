import i18next from 'i18next';

export const DRIVE_CONTENT_DATA = {
  DRIVE: {
    referrerType: 'drive.google',
    title: i18next.t('openDrive.needsAccessGoogleDrive', { text: 'Lumin' }),
    svgSrc: 'icon-googledrive',
  },
  GMAIL: {
    referrerType: 'mail.google',
    title: i18next.t('openDrive.needsAccessGoogleMail', { text: 'Lumin' }),
    svgSrc: 'gmail-icon',
  },
  CLASSROOM: {
    referrerType: 'classroom.google',
    title: i18next.t('openDrive.needsAccessGoogleClassroom', { text: 'Lumin' }),
    svgSrc: 'classroom-icon',
  },
};

export const OPEN_DRIVE_STEPS = {
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  GETTING_FILE: 'getting_file',
};

export const OPEN_DRIVE_ERROR_CODES = {
  MISSING_PERMISSIONS: 'missing_permissions',
  WRONG_ACCOUNT: 'wrong_account',
  FILE_NOT_FOUND: 'file_not_found',
};
