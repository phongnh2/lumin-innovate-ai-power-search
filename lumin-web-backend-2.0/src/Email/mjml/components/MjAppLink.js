import { BodyComponent } from 'mjml-core';

const SIZE_MAPPING = {
  small: '12px',
  normal: '15px',
  large: '22px',
};
const WEIGHT_MAPPING = {
  small: '400',
  normal: '400',
  large: '500',
};
const LINE_HEIGHT_MAPPING = {
  small: '16px',
  normal: '22px',
  large: '28px',
};

export default class MjAppLink extends BodyComponent {
  static dependencies = {
    'mj-column': ['mj-app-link'],
    'mj-section': ['mj-app-link'],
  };

  static allowedAttributes = {
    color: 'color',
    'font-size': 'unit(px)',
    'font-weight': 'string',
    align: 'enum(left,right,center)',
    'text-align': 'enum(left,right,center,justify)',
    margin: 'unit(px)',
    size: 'enum(small,normal,large)',
    href: 'string',
    display: 'string',
    'text-decoration': 'string',
  };

  static defaultAttributes = {
    color: '#F2385A',
    'font-size': '15px',
    'font-weight': '400',
    align: 'left',
    'text-align': 'left',
    margin: '0',
    display: 'block',
    'text-decoration': 'none',
    size: 'normal',
  };

  getStyles() {
    const fontSize = SIZE_MAPPING[this.getAttribute('size')] || this.getAttribute('font-size');
    const fontWeight = WEIGHT_MAPPING[this.getAttribute('size')] || this.getAttribute('font-weight');
    const lineHeight = LINE_HEIGHT_MAPPING[this.getAttribute('size')] || this.getAttribute('line-height');
    return {
      'mj-app-link': {
        'font-family': 'Roboto, sans-serif',
        color: this.getAttribute('color'),
        'font-weight': fontWeight,
        'font-size': fontSize,
        align: this.getAttribute('align'),
        'text-align': this.getAttribute('text-align'),
        'text-decoration': this.getAttribute('text-decoration'),
        display: this.getAttribute('display'),
        'margin-bottom': 0,
        'line-height': lineHeight,
        margin: this.getAttribute('margin'),
        'letter-spacing': '0.4px',
      },
    };
  }

  renderChild = () => {
    if (this.props.children.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return this.renderChildren(this.props.children, {
        rawXML: true,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        renderer: (component) => component.render,
      });
    }
    return this.getContent();
  };

  getCssClass = () => [this.getAttribute('css-class'), 'mj-app-link'].filter(Boolean).join(' ');

  render() {
    const fontSize = SIZE_MAPPING[this.getAttribute('size')] || this.getAttribute('font-size');
    const fontWeight = WEIGHT_MAPPING[this.getAttribute('size')]
      || this.getAttribute('font-weight');
    const lineHeight = LINE_HEIGHT_MAPPING[this.getAttribute('size')]
    || this.getAttribute('line-height');
    return this.renderMJML(`
      <mj-button
        font-family="Roboto, sans-serif"
        padding="0"
        ${this.htmlAttributes({
    'css-class': this.getCssClass(),
    color: this.getAttribute('color') || '#F2385A',
    target: this.getAttribute('target'),
    title: this.getAttribute('title'),
    width: this.getAttribute('width'),
    href: this.getAttribute('href'),
    'font-weight': fontWeight,
    'font-size': fontSize,
    align: this.getAttribute('align'),
    'text-align': this.getAttribute('text-align'),
    'text-decoration': this.getAttribute('text-decoration'),
    display: this.getAttribute('display'),
    'margin-bottom': 0,
    'line-height': lineHeight,
    margin: this.getAttribute('margin'),
    'letter-spacing': '0.4px',
    'background-color': 'transparent',
    border: 'none',
    'inner-padding': '0px 0px',
    padding: '0px 0px',
  })}
      >
        ${this.renderChild()}
      </mj-button>
    `);
  }
}
