/* eslint-disable */
import React from 'react';
// keep warning `act` removed
import { act } from 'react-dom/test-utils';
import { shallow } from 'enzyme';
import ToolButton from 'luminComponents/ToolButton';
import ToolGroupButton from 'luminComponents/ToolGroupButton';
import ToggleElementButton from 'luminComponents/ToggleElementButton';
import ActionButton from 'luminComponents/ActionButton';
import StatefulButton from 'luminComponents/StatefulButton';
import CustomElement from 'luminComponents/CustomElement';
import CustomizablePopup from '../CustomizablePopup';

// A helper to update wrapper
const waitForComponentToPaint = async (wrapper) => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve));
    wrapper.update();
  });
};

function ChildMocked(props) {
  return <div></div>;
}

function setup(props) {
  const defaultProps = {
    dataElement: '',
    items: [],
    children: [ChildMocked],
  };
  const mergedProps = {
    ...defaultProps,
    ...props,
  };
  const wrapper = shallow(<CustomizablePopup {...mergedProps} />);
  return {
    wrapper,
  };
}

describe('<CustomizablePopup />', () => {
  describe('default render', () => {
    it('should match snapshot', () => {
      const { wrapper } = setup({ items: [{ dataElement: 'copyTextButton' }] , dataElement: 'copyTextButton' });
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('dataElement is undefined', () => {
    it('should match snapshot', () => {
      const { wrapper } = setup({ items: [{ dataElement: 'copyTextButton' }], dataElement: '' });
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('type is toolButton', async () => {
    const { wrapper } = setup({ items: [{ type: 'toolButton' }], dataElement: '' });
    await waitForComponentToPaint(wrapper);
    it('should match snapshot', () => {
      expect(wrapper).toMatchSnapshot();
    });
    it('should have ToolButton component', () => {
      expect(wrapper.find(ToolButton).exists()).toBeTruthy();
    });
  });

  describe('type is toolGroupButton', async () => {
    const { wrapper } = setup({ items: [{ type: 'toolGroupButton' }], dataElement: '' });
    await waitForComponentToPaint(wrapper);

    it('should match snapshot', () => {
      expect(wrapper).toMatchSnapshot();
    });
    it('should have ToolGroupButton component', () => {
      expect(wrapper.find(ToolGroupButton).exists()).toBeTruthy();
    });
  });

  describe('type is toggleElementButton', async () => {
    const { wrapper } = setup({ items: [{ type: 'toggleElementButton' }], dataElement: '' });
    await waitForComponentToPaint(wrapper);

    it('should match snapshot', () => {
      expect(wrapper).toMatchSnapshot();
    });
    it('should have ToggleElementButton component', () => {
      expect(wrapper.find(ToggleElementButton).exists()).toBeTruthy();
    });
  });

  describe('type is actionButton', async () => {
    const { wrapper } = setup({ items: [{ type: 'actionButton' }], dataElement: '' });
    await waitForComponentToPaint(wrapper);

    it('should match snapshot', () => {
      expect(wrapper).toMatchSnapshot();
    });
    it('should have ActionButton component', () => {
      expect(wrapper.find(ActionButton).exists()).toBeTruthy();
    });
  });

  describe('type is statefulButton', async () => {
    const { wrapper } = setup({ items: [{ type: 'statefulButton' }], dataElement: '' });
    await waitForComponentToPaint(wrapper);

    it('should match snapshot', () => {
      expect(wrapper).toMatchSnapshot();
    });
    it('should have StatefulButton component', () => {
      expect(wrapper.find(StatefulButton).exists()).toBeTruthy();
    });
  });

  describe('type is customElement', async () => {
    const { wrapper } = setup({ items: [{ type: 'customElement' }], dataElement: '' });
    await waitForComponentToPaint(wrapper);

    it('should match snapshot', () => {
      expect(wrapper).toMatchSnapshot();
    });
    it('should have CustomElement component', () => {
      expect(wrapper.find(CustomElement).exists()).toBeTruthy();
    });
  });

  describe('type is spacer', async () => {
    const { wrapper } = setup({ items: [{ type: 'spacer' }], dataElement: '' });
    await waitForComponentToPaint(wrapper);

    it('should match snapshot', () => {
      expect(wrapper).toMatchSnapshot();
    });
    it('should have spacer class name', () => {
      expect(wrapper.find('.spacer').exists()).toBeTruthy();
    });
  });

  describe('component is defined', () => {
    const { wrapper } = setup({
      items: [{ type: 'copyTextButton' }],
      dataElement: 'copyTextButton',
      children: [<ChildMocked dataElement="copyTextButton" />],
    });
    it('should match snapshot', () => {
      expect(wrapper).toMatchSnapshot();
    });
  });
});