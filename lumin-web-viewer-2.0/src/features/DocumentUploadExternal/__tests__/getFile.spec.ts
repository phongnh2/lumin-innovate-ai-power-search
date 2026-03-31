import { office } from 'constants/documentType';
import { DownloadType } from 'constants/downloadPdf';

import { convertToImages } from 'helpers/convertToImages';
import convertToOfficeFile from 'helpers/convertToOfficeFile';
import { getLinearizedDocumentFile } from 'utils/getFileService';

import getFile from '../getFile';

jest.mock('helpers/convertToImages', () => ({
  convertToImages: jest.fn(),
}));

jest.mock('helpers/convertToOfficeFile', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('utils/getFileService', () => ({
  getLinearizedDocumentFile: jest.fn(),
}));

describe('getFile', () => {
  const mockSignal = new AbortController().signal;
  const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
  const mockBuffer = new ArrayBuffer(8);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the file directly if provided in input', async () => {
    const result = await getFile({
      name: 'test.pdf',
      downloadType: DownloadType.PDF,
      file: mockFile,
      signal: mockSignal,
    });

    expect(result).toBe(mockFile);
    expect(getLinearizedDocumentFile).not.toHaveBeenCalled();
  });

  it('should call getLinearizedDocumentFile when downloadType is PDF', async () => {
    (getLinearizedDocumentFile as jest.Mock).mockResolvedValue(mockFile);

    const result = await getFile({
      name: 'test.pdf',
      downloadType: DownloadType.PDF,
      signal: mockSignal,
      flattenPdf: true,
    });

    expect(getLinearizedDocumentFile).toHaveBeenCalledWith(
      'test.pdf',
      { flattenPdf: true },
      { signal: mockSignal }
    );
    expect(result).toBe(mockFile);
  });

  it('should call getLinearizedDocumentFile when downloadType is undefined', async () => {
    (getLinearizedDocumentFile as jest.Mock).mockResolvedValue(mockFile);

    const result = await getFile({
      name: 'test.pdf',
      downloadType: undefined as unknown as string,
    });

    expect(getLinearizedDocumentFile).toHaveBeenCalledWith(
      'test.pdf',
      { flattenPdf: undefined },
      { signal: undefined }
    );
    expect(result).toBe(mockFile);
  });

  it('should call convertToImages when downloadType is PNG', async () => {
    const mockImageBlob = new Blob(['image'], { type: 'image/png' });
    (convertToImages as jest.Mock).mockResolvedValue(mockImageBlob);

    const result = await getFile({
      name: 'test.png',
      downloadType: DownloadType.PNG,
    });

    expect(convertToImages).toHaveBeenCalledWith(DownloadType.PNG);
    expect(result).toBe(mockImageBlob);
  });

  it('should call convertToImages when downloadType is JPG', async () => {
    const mockImageBlob = new Blob(['image'], { type: 'image/jpeg' });
    (convertToImages as jest.Mock).mockResolvedValue(mockImageBlob);

    const result = await getFile({
      name: 'test.jpg',
      downloadType: DownloadType.JPG,
    });

    expect(convertToImages).toHaveBeenCalledWith(DownloadType.JPG);
    expect(result).toBe(mockImageBlob);
  });

  it('should return a DOCX file when downloadType is DOCX', async () => {
    (convertToOfficeFile as jest.Mock).mockResolvedValue(mockBuffer);

    const result = (await getFile({
      name: 'test.docx',
      downloadType: DownloadType.DOCX,
    })) as File;

    expect(convertToOfficeFile).toHaveBeenCalledWith(DownloadType.DOCX);
    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('test.docx');
    expect(result.type).toBe(office.DOCX);
  });

  it('should return an XLSX file when downloadType is XLSX', async () => {
    (convertToOfficeFile as jest.Mock).mockResolvedValue(mockBuffer);

    const result = (await getFile({
      name: 'test.xlsx',
      downloadType: DownloadType.XLSX,
    })) as File;

    expect(convertToOfficeFile).toHaveBeenCalledWith(DownloadType.XLSX);
    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('test.xlsx');
    expect(result.type).toBe(office.XLSX);
  });

  it('should return a PPTX file when downloadType is PPTX', async () => {
    (convertToOfficeFile as jest.Mock).mockResolvedValue(mockBuffer);

    const result = (await getFile({
      name: 'test.pptx',
      downloadType: DownloadType.PPTX,
    })) as File;

    expect(convertToOfficeFile).toHaveBeenCalledWith(DownloadType.PPTX);
    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('test.pptx');
    expect(result.type).toBe(office.PPTX);
  });

  it('should throw an error for invalid download types', async () => {
    (convertToOfficeFile as jest.Mock).mockResolvedValue(mockBuffer);

    await expect(
      getFile({
        name: 'test',
        downloadType: 'INVALID_TYPE',
      })
    ).rejects.toThrow('Invalid download type');
  });
});