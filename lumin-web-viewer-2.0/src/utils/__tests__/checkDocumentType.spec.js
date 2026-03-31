/* eslint-disable */
import checkDocumentType from '../checkDocumentType';
import { images, general } from '../../constants/documentType';

describe('check document type', () => {
  it('should be valid type', () => {
    expect(checkDocumentType(general.PDF)).toBe(true);
  });
  it('should be valid type', () => {
    expect(checkDocumentType(images.JPEG)).toBe(true);
  });
  it('shouldbe invalid type', () => {
    expect(checkDocumentType('xlsx')).toBe(false);
  });
});
