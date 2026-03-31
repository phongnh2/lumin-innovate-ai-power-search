import { PrintablePdfResult } from './type';

export default (docViewer: Core.DocumentViewer): Promise<PrintablePdfResult> | null =>
  docViewer.getDocument().getPrintablePDF();
