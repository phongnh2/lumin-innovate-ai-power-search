import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import initialState from 'src/redux/initialState';
import StylePalette from 'luminComponents/StylePalette';
import ColorMocked from 'src/__mocks__/colorMock';
import AnnotationStylePopup from '../AnnotationStylePopup';

const mockStore = configureMockStore([thunk]);
const store = mockStore({
  ...initialState,
});

jest.mock('core', () => ({
  setAnnotationStyles: jest.fn(),
  getSelectedAnnotations: jest.fn().mockReturnValue([]),
  getToolMode: jest.fn().mockReturnValue({}),
}));

jest.mock('helpers/device', () => ({
  isMobile: jest.fn().mockReturnValueOnce(true)
    .mockReturnValueOnce(false),
  isWindow10: jest.fn().mockReturnValueOnce(false),
  getUserBrowserForAllDevices: jest.fn().mockReturnValueOnce('chrome'),
}));

class FreeTextAnnotationMock {
  static Intent = {
    FreeText: 'freetext',
  };

  get Subject() {
    return 'Signature';
  }

  getIntent() {
    return 'freetext';
  }
}

global.Core= {
  Annotations: {
    FreeTextAnnotation: jest.fn().mockReturnValue(true),
    StampAnnotation: jest.fn().mockReturnValue(true),
    FreeHandAnnotation: jest.fn(),
    LineAnnotation: jest.fn(),
    PolylineAnnotation: jest.fn(),
    PolygonAnnotation: jest.fn(),
    EllipseAnnotation: jest.fn(),
    TextHighlightAnnotation: jest.fn(),
    TextUnderlineAnnotation: jest.fn(),
    TextSquigglyAnnotation: jest.fn(),
    TextStrikeoutAnnotation: jest.fn(),
    RedactionAnnotation: jest.fn(),
    RectangleAnnotation: jest.fn(),
    StickyAnnotation: jest.fn(),
    FileAttachmentAnnotation: jest.fn(),
    CustomAnnotation: jest.fn(),
  }
}


describe('AnnotationStylePopup', () => {
  const Color = new ColorMocked();
  const spyColor = jest.spyOn(Color, 'toHexString').mockReturnValue(null);
  const props = {
    isDisabled: false,
    annotation: new FreeTextAnnotationMock(),
    closeElement: () => {},
    style: {
      TextColor: Color,
      StrokeColor: Color,
      FillColor: Color,
    },
  };
  describe('Test snapshot', () => {
    it('should render snapshot', () => {
      const component = mount(
        <Provider store={store}>
          <AnnotationStylePopup {...props} />
        </Provider>,
      );
      expect(component).toMatchSnapshot();
    });

    it('isDisabled', () => {
      const newProps = {
        ...props,
        isDisabled: true,
      };
      const component = mount(
        <Provider store={store}>
          <AnnotationStylePopup {...newProps} />
        </Provider>,
      );
      expect(component).toMatchSnapshot();
    });

    it('handleClick', () => {
      const component = mount(
        <Provider store={store}>
          <AnnotationStylePopup {...props} />
        </Provider>,
      );
      component.find('div').at(0).simulate('click', { target: 'text', currentTarget: 'text' });
    });

    it('handleStyleChange', () => {
      const component = mount(
        <Provider store={store}>
          <AnnotationStylePopup {...props} />
        </Provider>,
      );
      component.find(StylePalette).simulate('change', { target: { value: 'annotationPopup' } });
      expect(component).toMatchSnapshot();
    });
  });
});