export default (docViewer: Core.DocumentViewer, type: string | number, data?: unknown): unknown => docViewer.trigger(type, data);
