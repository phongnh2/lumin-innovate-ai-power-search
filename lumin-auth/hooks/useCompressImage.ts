import Compressor from 'compressorjs';
import { useCallback, useEffect, useRef } from 'react';

const useCompressImage = () => {
  const compressorRef = useRef<Compressor>();
  const compressor = useCallback(
    (file: File | Blob, options: Compressor.Options): Promise<File | Blob> =>
      new Promise((resolve, reject) => {
        if (!file) {
          reject(new Error('File not found'));
        }
        compressorRef.current = new Compressor(file, {
          ...options,
          success(result) {
            resolve(result);
          },
          error(err) {
            reject(err.message);
          }
        });
      }),
    []
  );

  const abortCompress = useCallback(() => {
    if (compressorRef.current) {
      compressorRef.current.abort();
    }
  }, []);

  useEffect(() => {
    return () => {
      abortCompress();
    };
  }, [abortCompress]);

  return {
    abortCompress,
    compressor
  };
};

export default useCompressImage;
