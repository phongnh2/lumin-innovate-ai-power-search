export const activePrintButtonByHotKey = () => {
  const printButton = document.querySelector(`[data-cy="print_button"]`);
  if (printButton) {
    (printButton as HTMLElement).click();
  }
};
