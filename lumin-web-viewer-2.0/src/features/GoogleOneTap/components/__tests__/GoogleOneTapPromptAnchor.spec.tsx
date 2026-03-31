import React from 'react';
import { render } from '@testing-library/react';

import GoogleOneTapPromptAnchor from '../GoogleOneTapPromptAnchor';
import { GOOGLE_PROMPT_WIDTH, PROMPT_ANCHOR_ID } from '../../constants';

describe('GoogleOneTapPromptAnchor', () => {
  describe('rendering', () => {
    it('should render a div element', () => {
      const { container } = render(<GoogleOneTapPromptAnchor />);

      const divElement = container.querySelector('div');
      expect(divElement).not.toBeNull();
    });

    it('should have the correct id', () => {
      const { container } = render(<GoogleOneTapPromptAnchor />);

      const divElement = container.querySelector(`#${PROMPT_ANCHOR_ID}`);
      expect(divElement).not.toBeNull();
    });
  });

  describe('styling', () => {
    it('should have fixed positioning', () => {
      const { container } = render(<GoogleOneTapPromptAnchor />);

      const divElement = container.querySelector('div');
      expect(divElement?.style.position).toBe('fixed');
    });

    it('should be positioned at top 64px', () => {
      const { container } = render(<GoogleOneTapPromptAnchor />);

      const divElement = container.querySelector('div');
      expect(divElement?.style.top).toBe('64px');
    });

    it('should have correct right positioning based on GOOGLE_PROMPT_WIDTH', () => {
      const { container } = render(<GoogleOneTapPromptAnchor />);

      const divElement = container.querySelector('div');
      expect(divElement?.style.right).toBe(`calc(${GOOGLE_PROMPT_WIDTH}px + 16px)`);
    });

    it('should have zero width', () => {
      const { container } = render(<GoogleOneTapPromptAnchor />);

      const divElement = container.querySelector('div');
      expect(divElement?.style.width).toBe('0px');
    });

    it('should have zero height', () => {
      const { container } = render(<GoogleOneTapPromptAnchor />);

      const divElement = container.querySelector('div');
      expect(divElement?.style.height).toBe('0px');
    });

    it('should have high z-index', () => {
      const { container } = render(<GoogleOneTapPromptAnchor />);

      const divElement = container.querySelector('div');
      expect(divElement?.style.zIndex).toBe('9999');
    });
  });

  describe('accessibility', () => {
    it('should not have any visible content', () => {
      const { container } = render(<GoogleOneTapPromptAnchor />);

      const divElement = container.querySelector('div');
      expect(divElement?.innerHTML).toBe('');
    });
  });

  describe('constants usage', () => {
    it('should use PROMPT_ANCHOR_ID constant for id', () => {
      const { container } = render(<GoogleOneTapPromptAnchor />);

      const divElement = container.querySelector('div');
      expect(divElement?.id).toBe(PROMPT_ANCHOR_ID);
    });

    it('should use GOOGLE_PROMPT_WIDTH constant in right calculation', () => {
      const { container } = render(<GoogleOneTapPromptAnchor />);

      const divElement = container.querySelector('div');
      const style = divElement?.getAttribute('style');
      expect(style).toContain(`${GOOGLE_PROMPT_WIDTH}px`);
    });
  });

  describe('multiple renders', () => {
    it('should render consistently across multiple renders', () => {
      const { container: container1 } = render(<GoogleOneTapPromptAnchor />);
      const { container: container2 } = render(<GoogleOneTapPromptAnchor />);

      const div1 = container1.querySelector('div');
      const div2 = container2.querySelector('div');

      expect(div1?.id).toBe(div2?.id);
      expect(div1?.getAttribute('style')).toBe(div2?.getAttribute('style'));
    });
  });
});
