import { BodyComponent } from 'mjml-core';

export default class MjAppButton extends BodyComponent {
  static dependencies = {
    'mj-column': ['mj-app-button'],
    'mj-section': ['mj-app-button'],
    'mj-app-button': ['span', 'div', 'a'],
  };

  static allowedAttributes = {
    margin: 'unit(px)',
    href: 'string',
    isFullWidth: 'enum(true, false)',
  };

  static defaultAttributes = {
    margin: '0',
    isFullWidth: 'false',
  };

  getHref = () => this.getAttribute('href');

  renderChild = () => {
    if (this.props.children.length) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return this.renderChildren(this.props.children, {
        // rawXML: true,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        renderer: (component) => component.render,
      });
    }
    return this.getContent();
  };

  render() {
    const href = this.getHref();
    const isFullWidth = this.getAttribute('isFullWidth') === true;
    return this.renderMJML(`
    <mj-button
      ${this.htmlAttributes({
    'css-class': this.getAttribute('css-class'),
    href,
    target: '_blank',
    style: 'mj-app-button',
    'box-sizing': 'border-box',
    'text-transform': 'capitalize',
    'text-decoration': 'none',
    display: isFullWidth ? 'block' : 'inline-block',
  })}
    height="48px"
    inner-padding="12px 16px"
    font-size="17px"
    background-color="#102D42"
    color="#fff"
    font-family="Roboto, sans-serif"
    border-radius="8px"
    font-weight="500"
    text-align="center"
    >
      ${this.renderChild()}
    </mj-button>
    `);
  }
}
