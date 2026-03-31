import core from 'core';

export default (position: number): void => {
  if (!position) {
    return;
  }
  core.refreshAll();
  core.updateView();
  const pageSection = window.document.getElementById(`pageContainer${position}`);
  if (pageSection) {
    pageSection.classList.remove('pageContainer-blocked');
  }
};
