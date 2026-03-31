import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { SignedUrlConstants } from 'Common/constants/SignedUrlConstants';

import { EnvironmentService } from 'Environment/environment.service';

import { HttpSignedUrl } from './http.signedUrl';
// import { WsSignedUrl } from './ws.signedUrl';

@Injectable()
export class SignedUrlFactory {
  private readonly host?: string;

  private readonly pathPrefix: string;

  private readonly publicKey?: string;

  private readonly protocol?: string;

  // private readonly websocketHost?: string;

  // private readonly websocketProtocol?: string;

  constructor(private readonly environmentService: EnvironmentService) {
    const editorBackendUrl = this.environmentService.getByKey(
      EnvConstants.EDITOR_BACKEND_BASEURL,
    );
    // const editorBackendWebSocketUrl = this.environmentService.getByKey(
    //   EnvConstants.EDITOR_BACKEND_WEBSOCKET_BASEURL,
    // );
    const editorPublicKey = this.environmentService.getByKey(
      EnvConstants.EDITOR_PUBLIC_KEY,
    );

    if (editorBackendUrl) {
      const url = new URL(editorBackendUrl);
      this.host = url.host;
      this.pathPrefix = url.pathname === '/' ? '' : url.pathname;
      this.protocol = url.protocol;
      // const websocketUrl = new URL(editorBackendWebSocketUrl);
      // this.websocketHost = websocketUrl.host;
      // this.websocketProtocol = websocketUrl.protocol;
    }
    this.publicKey = editorPublicKey;
  }

  private isEnabledEditorServer = (): boolean => Boolean(this.host) && Boolean(this.publicKey);

  private createSignature = (stringToSign: string) => {
    const signature = crypto.publicEncrypt(
      {
        key: this.publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(stringToSign),
    );
    return signature.toString('hex');
  };

  createSignedUrl = (params: {
    path: string;
    expire?: number;
    method?: string;
    headers?: Record<string, string>;
  }): string => {
    const {
      path, expire = 900, method = 'GET', headers = {},
    } = params;
    if (!this.isEnabledEditorServer()) {
      return '';
    }
    const httpSignedUrl = new HttpSignedUrl(this.host, path, method, expire);
    httpSignedUrl.setCanonicalHeader({
      ...headers,
      host: this.host,
    });
    const canonicalQuery = httpSignedUrl.getCanonicalQuery();
    const stringToSign = httpSignedUrl.createStringToSign();
    const signature = this.createSignature(stringToSign);
    return `${this.protocol}//${this.host}${this.pathPrefix}${path}?${canonicalQuery}&${SignedUrlConstants.SIGNATURE_QUERY_PARAM}=${signature}`;
  };

  // createWebsocketSignedUrl = (params: {
  //   expire: number;
  //   patterns: string[];
  //   headers?: Record<string, string>;
  // }): string => {
  //   const { expire, patterns, headers = {} } = params;
  //   if (!this.isEnabledEditorServer()) {
  //     return '';
  //   }
  //   const wsSignedUrl = new WsSignedUrl(this.websocketHost, patterns, expire);
  //   wsSignedUrl.setCanonicalHeader({
  //     ...headers,
  //     host: this.websocketHost,
  //   });
  //   const canonicalQuery = wsSignedUrl.getCanonicalQuery();
  //   const stringToSign = wsSignedUrl.createStringToSign();
  //   const signature = this.createSignature(stringToSign);

  //   return `${this.websocketProtocol}//${this.websocketHost}?${canonicalQuery}&${SignedUrlConstants.SIGNATURE_QUERY_PARAM}=${signature}`;
  // };
}
