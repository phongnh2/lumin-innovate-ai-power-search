import selectors from 'selectors';
import { store } from 'store';

import { print } from 'helpers/print';

export async function printPdf() {
  const printOptions = {
    allPages: true,
    includeAnnotations: true,
    printQuality: 3,
    maintainPageOrientation: true,
  };
  await print(store.dispatch, selectors.isEmbedPrintSupported(store.getState()), printOptions);
  return 'Print success';
}
