/* eslint-disable */
import Compressor from 'compressorjs';
import compressImage from '../compressImage';

const success = jest.fn();
jest.mock('compressorjs', () =>
  jest.fn().mockImplementation((file, { success }) => {
    success();
  })
);
const fileMock = new File([''], 'filename.png', { type: 'image/png' });
describe('compressImage', () => {
  it('Compressor should be called', async () => {
    await compressImage(fileMock);
    expect(Compressor).toBeCalled();
  });
});
