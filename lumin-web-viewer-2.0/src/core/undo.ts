export default (docViewer: Core.DocumentViewer): Promise<void> => docViewer.getAnnotationHistoryManager().undo();
