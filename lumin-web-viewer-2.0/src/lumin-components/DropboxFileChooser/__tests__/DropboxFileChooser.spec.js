import React from 'react';
import { shallow } from 'enzyme';
import { folderType } from 'constants/documentConstants';
import DropboxFileChooser from '../DropboxFileChooser';

beforeAll(() => {
  process.env = Object.assign(process.env, { DROPBOX_CLIENT_ID: 'value' });
});

afterAll(() => {
  jest.resetModules();
});

describe('<DropboxFileChooser />', () => {
  it('snapshot render', () => {
    const createDocuments = jest.fn();
    const wrapper = shallow(<DropboxFileChooser currentFolderType={folderType.INDIVIDUAL} />);
    expect(wrapper).toMatchSnapshot();
  });
});