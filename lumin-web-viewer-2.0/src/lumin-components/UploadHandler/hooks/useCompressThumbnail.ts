import { compressImage } from 'utils';

import { MAX_THUMBNAIL_SIZE } from 'constants/lumin-common';

type Image = File | Blob;

const useCompressThumbnail = (): [(image: Image) => Promise<Image>] => {
  const compress = (image: Image): Promise<Image> =>
    compressImage(image, {
      convertSize: MAX_THUMBNAIL_SIZE,
      maxWidth: 800,
      maxHeight: 400,
    });

  return [compress];
};
export default useCompressThumbnail;
