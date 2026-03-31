/* eslint-disable no-restricted-globals */
import { COLOR_IMAGE_RESOLUTION, JPEG_QUALITY } from 'features/CompressPdf/constants';

import ghostscript from './gs.js';

function processPDFCompression({ data: { fileUrl, resolution, documentPassword }, responseCallback }) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', fileUrl);
  xhr.responseType = 'arraybuffer';
  const onLoad = async () => {
    self.URL.revokeObjectURL(fileUrl);

    const wasmModule = await ghostscript();
    const { FS: fileSystem } = wasmModule;

    fileSystem.writeFile = (path, content) => {
      const stream = fileSystem.open(path, 'w');
      const contentArray = content instanceof Uint8Array ? content : new Uint8Array(content);
      fileSystem.write(stream, contentArray, 0, contentArray.length, 0);
      fileSystem.close(stream);
    };
    fileSystem.readFile = (path, options = { encoding: 'utf8' }) => {
      const stream = fileSystem.open(path, 'r');
      const buffer = new Uint8Array(fileSystem.stat(path).size);
      fileSystem.read(stream, buffer, 0, buffer.length, 0);
      fileSystem.close(stream);

      return options.encoding === 'utf8' ? new TextDecoder('utf8').decode(buffer) : buffer;
    };
    fileSystem.writeFile('input.pdf', new Uint8Array(xhr.response));

    const commonArgs = [
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.5',
      '-dPDFSETTINGS=/default',
      '-dDownsampleColorImages=true',
      '-dColorImageDownsampleType=/Bicubic',
      '-dAutoFilterColorImages=false',
      '-dColorImageFilter=/DCTEncode',
      `-dColorImageResolution=${COLOR_IMAGE_RESOLUTION[resolution]}`,
      `-dJPEGQ=${JPEG_QUALITY[resolution]}`,
      '-DNOPAUSE',
      '-dQUIET',
      '-dBATCH',
    ];

    if (documentPassword) {
      wasmModule.callMain([
        ...commonArgs,
        `-sPDFPassword=${documentPassword}`,
        '-sOutputFile=decrypted.pdf',
        'input.pdf',
      ]);

      wasmModule.callMain([
        ...commonArgs,
        `-sOwnerPassword=${documentPassword}`,
        `-sUserPassword=${documentPassword}`,
        '-sOutputFile=output.pdf',
        'decrypted.pdf',
      ]);
    } else {
      wasmModule.callMain([...commonArgs, '-sOutputFile=output.pdf', 'input.pdf']);
    }
    const contentArray = fileSystem.readFile('output.pdf', { encoding: 'binary' });
    const blob = new Blob([contentArray], { type: 'application/octet-stream' });
    const pdfDataURL = self.URL.createObjectURL(blob);
    responseCallback({ pdfDataURL, url: fileUrl });
    xhr.removeEventListener('load', onLoad);
  };

  xhr.addEventListener('load', onLoad);
  xhr.send();
}

self.addEventListener('message', async ({ data: e }) => {
  if (e.target !== 'wasm') {
    return;
  }
  processPDFCompression({
    data: e.data,
    responseCallback: ({ pdfDataURL }) => self.postMessage(pdfDataURL),
  });
});
