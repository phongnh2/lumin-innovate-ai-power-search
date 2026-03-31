/// <reference path="./compressImage.d.ts" />

import Compressor from 'compressorjs';

const initCompressor = (...args) => new Compressor(...args);

export default (file, options) => new Promise((resolve, reject) => {
  if (!file) {
    reject(new Error('File not found'));
  }
  initCompressor(file, {
    ...options,
    success(result) {
      resolve(result);
    },
    error(err) {
      reject(err.message);
    },
  });
});

export const PRINT_QUALITY_PPI = 300;

// Refs: https://www.gdpicture.com/guides/gdpicture/About%20a%20PDF%20format.html#:~:text=In%20PDF%20documents%2C%20everything%20is,for%20DIN%20A4%20page%20size.
export const convertPDFPointToInch = (units) => units / 72;

export const convertDimensionToPixels = ({ width, height }) => ({
  width: convertPDFPointToInch(width) * PRINT_QUALITY_PPI,
  height: convertPDFPointToInch(height) * PRINT_QUALITY_PPI,
});