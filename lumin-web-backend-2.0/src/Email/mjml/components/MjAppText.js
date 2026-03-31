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

export default class MjAppText extends BodyComponent {
  static dependencies = {
    'mj-column': ['mj-app-text'],
    'mj-section': ['mj-app-text'],
    'mj-app-text': ['mj-raw', 'mj-app-link'],
  };

  static allowedAttributes = {
    color: 'color',
    'font-size': 'unit(px)',
    'font-weight': 'string',
    align: 'enum(left,right,center)',
    margin: 'unit(px)',
    size: 'enum(small,normal,large)',
    display: 'string',
    'text-decoration': 'string',
    type: 'enum(normal,highlight)',
  };

  static defaultAttributes = {
    color: '#101828',
    'font-size': '15px',
    'font-weight': '400',
    align: 'left',
    margin: '0',
    display: 'inline-block',
    'text-decoration': 'none',
    type: 'normal',
    size: 'normal',
  };

  getStyles() {
    const fontSize = SIZE_MAPPING[this.getAttribute('size')] || this.getAttribute('font-size');
    const fontWeight = WEIGHT_MAPPING[this.getAttribute('size')] || this.getAttribute('font-weight');
    const lineHeight = LINE_HEIGHT_MAPPING[this.getAttribute('size')] || this.getAttribute('line-height');
    const isHighlight = this.getAttribute('type') === 'highlight';
    return {
      'mj-app-text': {
        'font-family': 'Roboto, sans-serif',
        color: (isHighlight) ? '#F2385A' : this.getAttribute('color'),
        'font-weight': fontWeight,
        'font-size': fontSize,
        align: this.getAttribute('align'),
        'text-decoration': this.getAttribute('text-decoration'),
        display: this.getAttribute('display'),
        'margin-bottom': 0,
        'line-height': lineHeight,
        margin: this.getAttribute('margin'),
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

  getCssClass = () => this.getAttribute('css-class');

  render() {
    const isHighlight = this.getAttribute('type') === 'highlight';
    const fontSize = SIZE_MAPPING[this.getAttribute('size')] || this.getAttribute('font-size');
    const fontWeight = WEIGHT_MAPPING[this.getAttribute('size')]
      || this.getAttribute('font-weight');
    const lineHeight = LINE_HEIGHT_MAPPING[this.getAttribute('size')]
    || this.getAttribute('line-height');
    return this.renderMJML(`
      <mj-text
        font-family="Roboto, sans-serif"
        padding="0"
        ${this.htmlAttributes({
    'css-class': this.getCssClass(),
    color: (isHighlight) ? '#F2385A' : this.getAttribute('color'),
    'font-weight': fontWeight,
    'font-size': fontSize,
    align: this.getAttribute('align'),
    'text-decoration': this.getAttribute('text-decoration'),
    display: this.getAttribute('display'),
    'margin-bottom': 0,
    'line-height': lineHeight,
    margin: this.getAttribute('margin'),
  })}
      >
        ${this.renderChild()}
      </mj-text>
    `);
  }
}
