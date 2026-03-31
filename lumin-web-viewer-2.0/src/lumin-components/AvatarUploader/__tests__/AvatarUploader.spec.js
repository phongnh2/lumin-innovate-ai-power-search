jest.mock('utils/compressImage');

import React from 'react';
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';

import compressImage from 'utils/compressImage';
import PopperButton from 'luminComponents/PopperButton';

import fileMock from '../../../__mocks__/imageMock';
import AvatarUploader from '../AvatarUploader';
import { setupMountProvider } from 'helpers/jestTesting';

function setup(props) {
  const defaultProps = {
    onChange: jest.fn(),
    openModal: jest.fn(),
  };
  const mergedProps = { ...defaultProps, ...props };
  const instance = setupMountProvider(
    <AvatarUploader {...mergedProps} />
  );

  return { instance };
}

describe('AvatarUploader', () => {
  describe('Test snapshot', () => {
    it('should render snapshot', () => {
      const { instance } = setup();
      expect(instance).toMatchSnapshot();
    });

    it('should render PopperButton if exist avatarSource', () => {
      const { instance } = setup({ avatarSource: 'url' });
      expect(instance.find(PopperButton)).toHaveLength(1);
    });
  });

  describe('simulate onChange', () => {
    // it('simulate onChange with invalid image', () => {
    //   const openModal = jest.fn();
    //   const { instance } = setup({ openModal });
    //   const invalidFile = new File([''], 'filename.gif', { type: 'image/gif' });
    //   act(() => {
    //     instance
    //       .find('#file')
    //       .simulate('change', { target: { files: [invalidFile] } });
    //   });
    //   expect(openModal).toBeCalled();
    // });

    // it('simulate onChange with valid image', () => {
    //   compressImage.mockResolvedValue(fileMock);
    //   const onChange = jest.fn();
    //   const { instance } = setup({ onChange });
    //   act(() => {
    //     instance
    //       .find('#file')
    //       .simulate('change', { target: { files: [fileMock] } });
    //   });
    //   expect(compressImage).toBeCalled();
    // });

    it('simulate onChange with empty files', () => {
      const onChange = jest.fn();
      const { instance } = setup({ onChange });
      act(() => {
        instance.find('#file').simulate('change', { target: { files: [], dataset: { luminPurpose: '' } , closest: jest.fn(() => '')} });
      });
      expect(onChange).toHaveBeenCalledTimes(0);
    });
  });
});