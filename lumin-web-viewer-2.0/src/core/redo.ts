export default (docViewer: Core.DocumentViewer): Promise<void> => docViewer.getAnnotationHistoryManager().redo();
