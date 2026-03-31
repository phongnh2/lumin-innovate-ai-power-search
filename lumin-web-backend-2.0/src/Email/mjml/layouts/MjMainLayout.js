import { BodyComponent } from 'mjml-core';

export default class MjMainLayout extends BodyComponent {
  /*
    Notice we don't put "static endingTag = true" here,
    because we want this tag's content to be parsed as mjml.
    Examples of non-endingTags are mj-section, mj-column, etc.
  */
  constructor(initialDatas = {}) {
    super(initialDatas);
  }

  static dependencies = {
    'mj-main-layout': [],
    'mj-body': ['mj-main-layout'],
  };

  headStyle = () => `
    .mj-main-pager {
      background: #FFFFFF;
      border: 1px solid #FAB1A5;
      font-size: 15px;
    }
  `;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  renderChild = () => this.renderChildren(this.props.children, {
    rawXML: true,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    renderer: (component) => component.render,
  });

  render() {
    return this.renderMJML(`
      <mj-base-layout>
        <mj-wrapper css-class="mj-main-pager" padding="0" full-width="660px" border-radius="8px">
          <mj-section padding="24px">
            <mj-column>
              <mj-image align="left" padding="0" width="118px" src="{{assetUrl}}/images/lumin-email-logo.png" />
            </mj-column>
          </mj-section>
          <mj-section>
            <mj-column>
              <mj-divider border-color="#DAE4EC" border-width="1px" padding="0" />
            </mj-column>
          </mj-section>
          <mj-wrapper padding="32px 16px 24px 16px">
            ${this.renderChild()}
          </mj-wrapper>
        </mj-wrapper>
      </mj-base-layout>
    `);
  }
}
