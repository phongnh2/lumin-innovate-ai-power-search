import { TFunction } from 'react-i18next';

import { general } from 'constants/documentType';

import { CompressDpiOptions } from '../types';

export const getCompressedFile = (url: string) =>
  new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';

    const onLoad = () => {
      window.URL.revokeObjectURL(url);
      const blob = new Blob([xhr.response as ArrayBuffer], { type: general.PDF });
      resolve(blob);
      xhr.removeEventListener('load', onLoad);
    };

    xhr.addEventListener('load', onLoad);
    xhr.send();
  });

export const createCompressedSuffix = (fileName: string) => {
  const lastDotIndex = fileName.lastIndexOf('.');
  const file = fileName.slice(0, lastDotIndex);
  const pdfSuffix = fileName.slice(lastDotIndex);

  return `${file}_compressed${pdfSuffix}`;
};

export const getCompressDpiOptions = (t: TFunction): CompressDpiOptions[] => [
  {
    icon: 'ph-file-pdf',
    value: 72,
    title: t('viewer.compressPdf.options.dpiSettings.standard.title'),
    description: t('viewer.compressPdf.options.dpiSettings.standard.desc'),
  },
  {
    icon: 'ph-presentation',
    value: 96,
    title: t('viewer.compressPdf.options.dpiSettings.enhance.title'),
    description: t('viewer.compressPdf.options.dpiSettings.enhance.desc'),
  },
  {
    icon: 'ph-file-text',
    value: 150,
    title: t('viewer.compressPdf.options.dpiSettings.versatile.title'),
    description: t('viewer.compressPdf.options.dpiSettings.versatile.desc'),
  },
  {
    icon: 'ph-file-cloud',
    value: 200,
    title: t('viewer.compressPdf.options.dpiSettings.archiving.title'),
    description: t('viewer.compressPdf.options.dpiSettings.archiving.desc'),
  },
  {
    icon: 'ph-file-image',
    value: 300,
    title: t('viewer.compressPdf.options.dpiSettings.high.title'),
    description: t('viewer.compressPdf.options.dpiSettings.high.desc'),
  },
];
