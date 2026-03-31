import React from 'react';
import { mount } from 'enzyme';
import Icon from '../Icon';

describe('<InputForm />', () => {
  const props = {
    className: '',
    glyph: '',
  };

  describe('Icon', () => {
    it('Icon render', () => {
      const wrapper = mount(<Icon {...props} />);
      expect(wrapper).toMatchSnapshot();
    });
  });
});
