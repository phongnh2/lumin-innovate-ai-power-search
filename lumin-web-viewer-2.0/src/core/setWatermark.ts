/**
 * https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html#setWatermark__anchor
 */

import { WatermarkOptions } from './type';

export default (docViewer: Core.DocumentViewer, watermarkOptions: WatermarkOptions): Promise<void> =>
  docViewer.setWatermark(watermarkOptions);
