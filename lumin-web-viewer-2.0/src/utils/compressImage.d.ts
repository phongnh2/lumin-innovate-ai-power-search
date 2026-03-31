import Compressor from 'compressorjs';

export default function compressImage(image: File | Blob, options: Compressor.Options): Promise<File>;

export function convertDimensionToPixels({ width, height }: { width: number; height: number }): { width: number; height: number };

export function convertPDFPointToInch(units: number): number;