export default (position: number): void => {
  if (!position) {
    return;
  }
  const pageSection = window.document.getElementById(`pageContainer${position}`);
  if (pageSection) {
    pageSection.classList.add('pageContainer-blocked');
    const auxiliary = pageSection.querySelector('.auxiliary');
    if (auxiliary) {
      auxiliary.parentElement.removeChild(auxiliary);
    }
  }
};
