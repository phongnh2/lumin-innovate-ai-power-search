/* eslint-disable max-len */
import { BodyComponent } from 'mjml-core';

import { CommonConstants } from '../../../Common/constants/CommonConstants';

export default class MjAppFooter extends BodyComponent {
  static endingTag = true;

  static dependencies = {
    'mj-app-footer': [],
  };

  static allowedAttributes = {

  };

  static defaultAttributes = {

  };

  render() {
    return this.renderMJML(`
      <mj-wrapper css-class="footer-wrapper">

        <mj-section padding="0">
            <mj-column>
              <mj-spacer height="24px" />
            </mj-column>
        </mj-section>

        <mj-section padding="24px 16px" css-class="download" background-color='white' border-radius='8px'>
          <mj-column width="332px" css-class="download-text-wrapper">
            <mj-text align="left" padding="0px" size="normal" css-class="download-text" padding-bottom="14px" color="#101828">
              Get notified of comments and updates on the go.
            </mj-text>
          </mj-column>
          <mj-group width="280px" css-class="download-logo">
            <mj-column padding-right="24px" width="144px" css-class="download-ios">
              <mj-raw>
                <a href="{{mobileUrl}}/email-download-link-ios?$ios_passive_deepview=false&$android_passive_deepview=false&$fallback_url={{mobileUrl}}/email-download-link-ios" deeplink="true">
                  <img src="${CommonConstants.LUMIN_ASSETS_URL}/images/app-store.png"
                    style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;"
                    width="120" height="auto" />
                </a>
              </mj-raw>
            </mj-column>
            <mj-column width="136px">
              <mj-raw>
                <a href="{{mobileUrl}}/email-download-link-android?$ios_passive_deepview=false&$android_passive_deepview=false&$fallback_url={{mobileUrl}}/email-download-link-android" deeplink="true">
                  <img src="${CommonConstants.LUMIN_ASSETS_URL}/images/google-play.png"
                  style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;"
                  width="136" height="auto" />
                </a>
              </mj-raw>
            </mj-column>
          </mj-group>
        </mj-section>
      
        <mj-section padding="0">
          <mj-column>
            <mj-spacer height="40px" />
          </mj-column>
        </mj-section>

        <mj-section padding="0px" css-class="social">
          <mj-column padding="0px" width="432px" css-class="address-text-wrapper">
            <mj-app-text align="left" size="small" padding="0px" css-class="address-text" padding-bottom="16px" color="#667085">
              Lumin 101/210 Armagh Street, Christchurch, New Zealand
            </mj-app-text>
          </mj-column>
          <mj-group padding="0" width="224px" css-class="social-logo">
            <mj-column css-class="logo-item">
              <mj-image height="24px" width="24px" padding="0" src="${CommonConstants.LUMIN_ASSETS_URL}/images/facebook-logo.png"
              href="https://www.facebook.com/luminpdf/"/>
            </mj-column>
            <mj-column  css-class="logo-item">
              <mj-image height="24px" width="24px" padding="0" src="${CommonConstants.LUMIN_ASSETS_URL}/images/linkedin-logo.png"
              href="https://www.linkedin.com/company/lumin-pdf/"/>
            </mj-column>
            <mj-column  css-class="logo-item">
              <mj-image height="24px" width="24px" padding="0" src="${CommonConstants.LUMIN_ASSETS_URL}/images/instagram-logo.png"
              href="https://instagram.com/lumin.pdf?igshid=j3rda8ed0wba"/>
            </mj-column>
            <mj-column css-class="logo-item">
              <mj-image height="24px" width="24px" padding="0" src="${CommonConstants.LUMIN_ASSETS_URL}/images/youtube-logo.png"
              href="https://www.youtube.com/channel/UCbTsMqXJ5AGqapXaBhzPw8g"/>
            </mj-column>
          </mj-group>
        </mj-section>

        <mj-section padding="0">
          <mj-column>
            <mj-spacer height="24px" />
          </mj-column>
        </mj-section>

        <mj-section padding-bottom="32px">
          <mj-column width="100%" padding="0">
            <mj-text font-size="12px" color="#667085" padding="0px" align="left" line-height="16px">
              You received this email because you recently created an account on Lumin.
              To stop receiving these emails, you can <a class="link-secondary text-bold" href="{{baseUrl}}/settings/preferences">
                change your email preferences
              </a>
            </mj-text>
          </mj-column>
        </mj-section>

      </mj-wrapper>
    `);
  }
}
