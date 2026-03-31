import React from 'react';
import { shallow } from 'enzyme';
import { renderWithRedux } from 'utils/test-utils';
import ViewControlsOverlayLumin from '../ViewControlsOverlayLumin';

describe('<ViewControlsOverlayLumin />', () => {
  it('case1: render', () => {
    const props = {
      isDisabled: false,
      isOpen: false,
      totalPages: 5,
      displayMode: 'Single',
      fitMode: 'FitWidth',
      closeElements: jest.fn(),
      closeElement: jest.fn(),
      t: jest.fn(),
      handleWindowResize: jest.fn().mockReturnValue(undefined),
      getAnchorEl: jest.fn().mockReturnValue(undefined),
    };
    const { instance } = renderWithRedux(
      <div>
        <ViewControlsOverlayLumin {...props} />
      </div>,
      { initialState: {} },
    );
    global.dispatchEvent(new Event('resize'));

    expect(instance).toMatchSnapshot();
  });

  it('case2: component did update', () => {
    const props = {
      isDisabled: false,
      isOpen: false,
      totalPages: 5,
      displayMode: 'Single',
      fitMode: 'FitWidth',
      closeElements: jest.fn(),
      closeElement: jest.fn(),
      t: jest.fn(),
      handleWindowResize: jest.fn().mockReturnValue(undefined),
      getAnchorEl: jest.fn().mockReturnValue(undefined),
    };
    const wrapper = shallow(<ViewControlsOverlayLumin {...props} />);
    wrapper.setProps({ isOpen: true });
    wrapper.setState({ anchorEl: 'anchorEl' });
    global.dispatchEvent(new Event('resize'));
    expect(wrapper).toMatchSnapshot();
  });

  it('case3: component will unmount', () => {
    const props = {
      isDisabled: false,
      isOpen: false,
      totalPages: 5,
      displayMode: 'Single',
      fitMode: 'FitWidth',
      closeElements: jest.fn(),
      closeElement: jest.fn(),
      t: jest.fn(),
      handleWindowResize: jest.fn().mockReturnValue(undefined),
      getAnchorEl: jest.fn().mockReturnValue(undefined),
    };
    const wrapper = shallow(<ViewControlsOverlayLumin {...props} />);
    const spyRemoveEventListener = jest
      .spyOn(document, 'removeEventListener')
      .mockImplementation(() => {});
    wrapper.unmount();
    expect(spyRemoveEventListener).toBeDefined();
  });

  it('case3: handle click outside - viewControlsButton is exist', () => {
    const props = {
      isDisabled: false,
      isOpen: false,
      totalPages: 5,
      displayMode: 'Single',
      fitMode: 'FitWidth',
      closeElements: jest.fn(),
      closeElement: jest.fn(),
      t: jest.fn(),
      handleWindowResize: jest.fn().mockReturnValue(undefined),
      getAnchorEl: jest.fn().mockReturnValue(undefined),
    };
    const wrapper = shallow(<ViewControlsOverlayLumin {...props} />);
    wrapper.instance().handleClickOutside({
      target: {
        getAttribute() {
          return 'viewControlsButton';
        },
      },
    });
  });

  it("case4: handle click outside - viewControlsButton isn't exist", () => {
    const props = {
      isDisabled: false,
      isOpen: false,
      totalPages: 5,
      displayMode: 'Single',
      fitMode: 'FitWidth',
      closeElements: jest.fn(),
      closeElement: jest.fn(),
      t: jest.fn(),
      handleWindowResize: jest.fn().mockReturnValue(undefined),
      getAnchorEl: jest.fn().mockReturnValue(undefined),
    };
    const wrapper = shallow(<ViewControlsOverlayLumin {...props} />);
    wrapper.instance().handleClickOutside({
      target: {
        getAttribute() {
          return '';
        },
      },
    });
  });

  it('case5: component did update - pageTransitionButtons[1] - handleClick', () => {
    const props = {
      isDisabled: false,
      isOpen: false,
      totalPages: 5,
      displayMode: 'Single',
      fitMode: 'FitWidth',
      closeElements: jest.fn(),
      closeElement: jest.fn(),
      t: jest.fn(),
      handleWindowResize: jest.fn().mockReturnValue(undefined),
      getAnchorEl: jest.fn().mockReturnValue(undefined),
    };
    const wrapper = shallow(<ViewControlsOverlayLumin {...props} />);
    wrapper.setProps({ isOpen: true });
    wrapper.setState({ anchorEl: 'anchorEl' });
    const { onClick } = wrapper
      .find('.ViewControlsOverlayLumin__button')
      .first()
      .props();
    onClick({
      currentTarget: {
        value: '',
      },
    });
    expect(wrapper).toMatchSnapshot();
  });

  it('case6: component did update - pageTransitionButtons[2] - handleClick', () => {
    const props = {
      isDisabled: false,
      isOpen: false,
      totalPages: 5,
      displayMode: 'Single',
      fitMode: 'FitWidth',
      closeElements: jest.fn(),
      closeElement: jest.fn(),
      t: jest.fn(),
      handleWindowResize: jest.fn().mockReturnValue(undefined),
      getAnchorEl: jest.fn().mockReturnValue(undefined),
    };
    const wrapper = shallow(<ViewControlsOverlayLumin {...props} />);
    wrapper.setProps({ isOpen: true });
    wrapper.setState({ anchorEl: 'anchorEl' });
    const { onClick } = wrapper
      .find('.ViewControlsOverlayLumin__button')
      .at(1)
      .props();
    onClick({
      currentTarget: {
        value: '',
      },
    });
    expect(wrapper).toMatchSnapshot();
  });

  it('case7: component did update - layoutButtons[1] - handleClick', () => {
    const props = {
      isDisabled: false,
      isOpen: false,
      totalPages: 5,
      displayMode: 'Single',
      fitMode: 'FitWidth',
      closeElements: jest.fn(),
      closeElement: jest.fn(),
      t: jest.fn(),
      handleWindowResize: jest.fn().mockReturnValue(undefined),
      getAnchorEl: jest.fn().mockReturnValue(undefined),
    };
    const wrapper = shallow(<ViewControlsOverlayLumin {...props} />);
    wrapper.setProps({ isOpen: true });
    wrapper.setState({ anchorEl: 'anchorEl' });
    const { onClick } = wrapper
      .find('.ViewControlsOverlayLumin__button')
      .at(2)
      .props();
    onClick({
      currentTarget: {
        value: '',
      },
    });
    expect(wrapper).toMatchSnapshot();
  });

  it('case8: component did update - layoutButtons[1] - handleClick', () => {
    const props = {
      isDisabled: false,
      isOpen: false,
      totalPages: 5,
      displayMode: 'Single',
      fitMode: 'FitWidth',
      closeElements: jest.fn(),
      closeElement: jest.fn(),
      t: jest.fn(),
      handleWindowResize: jest.fn().mockReturnValue(undefined),
      getAnchorEl: jest.fn().mockReturnValue(undefined),
    };
    const wrapper = shallow(<ViewControlsOverlayLumin {...props} />);
    wrapper.setProps({ isOpen: true });
    wrapper.setState({ anchorEl: 'anchorEl' });
    const { onClick } = wrapper
      .find('.ViewControlsOverlayLumin__button')
      .at(3)
      .props();
    onClick({
      currentTarget: {
        value: '',
      },
    });
    expect(wrapper).toMatchSnapshot();
  });

  it('case9: component did update - layoutButtons[3] - handleClick', () => {
    const props = {
      isDisabled: false,
      isOpen: false,
      totalPages: 5,
      displayMode: 'Single',
      fitMode: 'FitWidth',
      closeElements: jest.fn(),
      closeElement: jest.fn(),
      t: jest.fn(),
      handleWindowResize: jest.fn().mockReturnValue(undefined),
      getAnchorEl: jest.fn().mockReturnValue(undefined),
    };
    const wrapper = shallow(<ViewControlsOverlayLumin {...props} />);
    wrapper.setProps({ isOpen: true });
    wrapper.setState({ anchorEl: 'anchorEl' });
    const { onClick } = wrapper
      .find('.ViewControlsOverlayLumin__button')
      .at(4)
      .props();
    onClick({
      currentTarget: {
        value: '',
      },
    });
    expect(wrapper).toMatchSnapshot();
  });
});
