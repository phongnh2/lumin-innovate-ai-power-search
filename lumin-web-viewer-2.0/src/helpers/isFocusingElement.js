import core from 'core';

export default () => {
  const freetextAnnots = core
    .getAnnotationsList()
    .filter((annot) => annot instanceof window.Core.Annotations.FreeTextAnnotation);
  const isEditingFreetext = freetextAnnots.some((annot) => annot.getEditor()?.hasFocus());

  const { activeElement } = document;
  const isInContentEditMode = core.getContentEditManager().isInContentEditMode();
  const isUsingPasteFromHotkey =
    activeElement.hasAttribute('contenteditable') && activeElement.classList.contains('ql-clipboard');
  const isEdittingRichText =
    activeElement.hasAttribute('contenteditable') && activeElement.classList.contains('ql-editor');
  const isFocusingChatBotInput = activeElement.id === 'chatBotInput';
  return (
    activeElement instanceof window.HTMLInputElement ||
    activeElement instanceof window.HTMLTextAreaElement ||
    isUsingPasteFromHotkey ||
    isEdittingRichText ||
    isEditingFreetext ||
    isInContentEditMode ||
    isFocusingChatBotInput
  );
};
