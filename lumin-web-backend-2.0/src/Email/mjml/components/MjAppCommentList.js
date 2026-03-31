import { BodyComponent } from 'mjml-core';

export default class MjAppCommentList extends BodyComponent {
  static endingTag = true;

  static dependencies = {
    'mj-app-comment-list': [],
  };

  static allowedAttributes = {};

  static defaultAttributes = {};

  headStyle = () => `

  `;

  renderComments = () => `
    <mj-section>
      <mj-column
        background-color="#F9FAFA"
        padding="16px"
        border-bottom="1px solid #fff"
        border-radius="8px"
        css-class="wrapper-child {{class}}">
        <mj-text>
          <b>{{userName}}</b>
          <mj-raw>{{#if isNew}}</mj-raw>
            <span class="new-badge">New</span>
          <mj-raw>
            {{else}}
          </mj-raw>
            <span class="format-time">• {{formatedTime}}</span>
          <mj-raw>
            {{/if}}
          </mj-raw>
        </mj-text>
        <mj-text margin="4px 0 0 0">
          <mj-raw>
          {{{comment}}}
          </mj-raw>
        </mj-text>
      </mj-column>
    </mj-section>
  `;

  render() {
    return this.renderMJML(`
      <mj-raw>
        {{#renderDocumentComments comments}}
      </mj-raw>
        ${this.renderComments()}
      <mj-raw>
        {{/renderDocumentComments}}
      </mj-raw>
    `);
  }
}
