import { BodyComponent } from 'mjml-core';

export default class MjBaseLayout extends BodyComponent {
  /*
    Notice we don't put "static endingTag = true" here,
    because we want this tag's content to be parsed as mjml.
    Examples of non-endingTags are mj-section, mj-column, etc.
  */
  constructor(initialDatas = {}) {
    super(initialDatas);
  }

  static dependencies = {
    'mj-base-layout': [],
    'mj-body': ['mj-base-layout'],
  };

  headStyle = () => `
    .app-container tbody {
      vertical-align: top;
    }
    .app-container {
      width: 100%;
      max-width: 660px;
      margin: 0 auto;
    }
  `;

  renderChild =() => this.renderChildren(this.props.children, {
    rawXML: true,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    renderer: (component) => component.render,
  })

  render() {
    return this.renderMJML(`
      <mj-section>
        <mj-column>
          <mj-spacer height="32px" />
        </mj-column>
      </mj-section>
      ${this.renderChild()}
      <mj-app-footer />
    `);
  }
}
