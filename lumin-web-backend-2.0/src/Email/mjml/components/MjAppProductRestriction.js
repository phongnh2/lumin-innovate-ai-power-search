import { BodyComponent } from 'mjml-core';

export default class MjAppProductRestriction extends BodyComponent {
  static endingTag = true;

  static dependencies = {
    'mj-app-product-restriction': [],
  };

  render() {
    return this.renderMJML(`
      <mj-raw>{{#if (eq products.length 1)}}</mj-raw>
      <mj-section>
        <mj-column>
          <mj-text padding="0">
            <ul class="list">
              <mj-raw>{{#each products}}</mj-raw>
                <mj-raw>{{#if (eq productName "PDF")}}</mj-raw>
                  <li>You will only be able to store 2 signatures</li>
                  <li>You will only be able to complete 3 documents per month</li>
                  <li>Premium tools, like redact and edit PDF text, will no longer be accessible</li>
                <mj-raw>{{/if}}</mj-raw>
                <mj-raw>{{#if (eq productName "SIGN")}}</mj-raw>
                  <li>You will only be able to send 5 agreements for signatures</li>
                  <li>You no longer have access to the Certificate of completion on your completed agreements</li>
                <mj-raw>{{/if}}</mj-raw>
              <mj-raw>{{/each}}</mj-raw>
            </ul>
          </mj-text>
        </mj-column>
      </mj-section>
      <mj-raw>{{else}}</mj-raw>
      <mj-section>
        <mj-column>
          <mj-text padding="0">
            <ul class="list">
              <mj-raw>{{#each products}}</mj-raw>
                <mj-raw>{{#if (eq productName "PDF")}}</mj-raw>
                  <li>You will only be able to complete 3 documents per month without premium tools, like redact and edit PDF text.</li>
                <mj-raw>{{/if}}</mj-raw>
                <mj-raw>{{#if (eq productName "SIGN")}}</mj-raw>
                  <li>You will only be able to send 5 agreements, without access to the Certificate of completion on completed agreements.</li>
                <mj-raw>{{/if}}</mj-raw>
              <mj-raw>{{/each}}</mj-raw>
            </ul>
          </mj-text>
        </mj-column>
      </mj-section>
      <mj-raw>{{/if}}</mj-raw>
    `);
  }
}
