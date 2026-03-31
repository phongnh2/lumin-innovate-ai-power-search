/* eslint-disable no-await-in-loop */
import core from 'core';

import { extensions, images } from 'constants/documentType';
import { LOGGER } from 'constants/lumin-common';

import logger from './logger';
import { getFlattenedPdfDoc } from '../utils/getFileService';

interface ExportImageByPageProps {
  pageNumber: number;
  convertType: keyof typeof images;
  pdfDoc: Core.PDFNet.PDFDoc;
  pdfDraw: Core.PDFNet.PDFDraw;
}

const RESOLUTION = 92;

const getConvertType = (downloadType: string) => {
  const convertType = Object.keys(extensions).find(
    (key: keyof typeof extensions) => extensions[key] === downloadType
  ) as keyof typeof images;

  if (!convertType) {
    throw new Error(`Unsupported download type: ${downloadType}`);
  }

  return convertType;
};

const exportImageByPage = async ({
  pageNumber,
  convertType,
  pdfDoc,
  pdfDraw,
}: ExportImageByPageProps): Promise<ReadableStream | null> => {
  try {
    const page = await pdfDoc.getPage(pageNumber);
    const imageType = extensions[convertType];
    const buffer = await pdfDraw.exportBuffer(page, imageType);

    return new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(buffer));
        controller.close();
      },
    });
  } catch (error) {
    logger.logError({
      reason: LOGGER.Service.CONVERT_TO_IMAGES,
      error: error as Error,
    });
    return null;
  }
};

export const convertToImages = async (downloadType: string) => {
  const { ZipWriter, BlobWriter } = await import('@zip.js/zip.js');
  const zipWriter = new ZipWriter(new BlobWriter('application/zip'));

  const totalPages = core.getTotalPages();
  const convertType = getConvertType(downloadType);

  const pdfDoc = await getFlattenedPdfDoc();
  const pdfDraw = await window.Core.PDFNet.PDFDraw.create(RESOLUTION);

  /**
   * Document has only one page
   * Download as single file
   */
  if (totalPages === 1) {
    const stream = await exportImageByPage({ pageNumber: 1, convertType, pdfDoc, pdfDraw });

    if (!stream) {
      return null;
    }

    await pdfDraw.destroy();
    return new Blob([await new Response(stream).arrayBuffer()], { type: images[convertType] });
  }

  /**
   * Document has multiple pages
   * Stream to Zip
   */
  for (let page = 1; page <= totalPages; page++) {
    const stream = await exportImageByPage({
      pageNumber: page,
      convertType,
      pdfDoc,
      pdfDraw,
    });

    if (stream) {
      await zipWriter.add(`page-${page}.${downloadType}`, stream);
    }
  }

  await pdfDraw.destroy();
  return zipWriter.close();
};
