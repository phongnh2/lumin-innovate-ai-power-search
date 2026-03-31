/**
 * Fix non-responsive issue action buttons in Google Drive Picker when displayed within modal dialogs
 */

const hideOpeningModals = () => {
  const dialogs = document.querySelectorAll('.mantine-Modal-root');
  if (dialogs.length > 0) {
    dialogs.forEach((dialog) => {
      (dialog as HTMLElement).style.display = 'none';
    });
  }
};

const showOpeningModals = () => {
  const dialogs = document.querySelectorAll('.mantine-Modal-root');
  if (dialogs.length > 0) {
    dialogs.forEach((dialog) => {
      (dialog as HTMLElement).style.display = 'block';
    });
  }
};

export const toggleMantineModals = {
  show: showOpeningModals,
  hide: hideOpeningModals,
};
