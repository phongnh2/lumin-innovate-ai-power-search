export default async (docViewer: Core.DocumentViewer): Promise<void> => {
  const formFieldCreationManager = docViewer.getAnnotationManager().getFormFieldCreationManager();
  if (formFieldCreationManager.isInFormFieldCreationMode()) {
    await new Promise((resolve) => {
      window.addEventListener('formFieldCreationModeEnded', () => resolve(1), { once: true });
    });
  }
};
