import { WatermarkOptions } from './type';

export default (docViewer: Core.DocumentViewer): Promise<WatermarkOptions> => docViewer.getWatermark();
