import React from 'react';
import { shallow } from 'enzyme';
import DragDropToast from './DragDropToast';

describe('DragDropToast', () => {
  describe('Test snapshot', () => {
    it('should render snapshot', () => {
      const component = shallow(
        <DragDropToast />
      );
      expect(component).toMatchSnapshot();
    });
  });
});