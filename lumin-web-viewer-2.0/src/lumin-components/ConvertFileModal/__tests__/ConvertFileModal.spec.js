import React from 'react';
import { shallow } from 'enzyme';
import ConvertFileModal from '../ConvertFileModal';

beforeEach(() => {
  jest.resetModules();
});

describe('<ConvertFileModal />', () => {
  describe('render component', () => {
    it('snapshot render', () => {
      const props = {
        currentUser: {},
        currentDocument: {},
        openViewerModal: () => {},
        onClose: () => {},
      };
      const wrapper = shallow(<ConvertFileModal {...props} />);
      expect(wrapper).toMatchSnapshot();
    });
  });
});