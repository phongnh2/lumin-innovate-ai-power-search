import {
  FrontendApiGetFlowErrorRequest,
  FrontendApiGetLoginFlowRequest,
  FrontendApiGetRecoveryFlowRequest,
  FrontendApiGetRegistrationFlowRequest,
  FrontendApiGetSettingsFlowRequest,
  FrontendApiGetVerificationFlowRequest,
  LoginFlow,
  RecoveryFlow,
  RegistrationFlow,
  SettingsFlow,
  VerificationFlow,
  UpdateLoginFlowWithSamlMethod
} from '@ory/client';

import { OryLoginMethod, OryProvider, OryUpdateSettingsMethod } from './core';

export type OryGetFlowBody = { flowId: string; cookie?: string };
export type OryGetErrorFlowBody = { flowId: string };

export type GetSelfServiceFlowRequest =
  | FrontendApiGetFlowErrorRequest
  | FrontendApiGetLoginFlowRequest
  | FrontendApiGetRegistrationFlowRequest
  | FrontendApiGetSettingsFlowRequest
  | FrontendApiGetVerificationFlowRequest
  | FrontendApiGetRecoveryFlowRequest;

export type SelfServiceFlow = LoginFlow | RegistrationFlow | SettingsFlow | VerificationFlow | RecoveryFlow;

type OryUpdateLoginPasswordFlowBody = {
  method: OryLoginMethod.Password;
  csrf_token: string;
  identifier: string;
  password: string;
  transient_payload?: Record<string, unknown>;
};
type OryUpdateLoginOidcFlowBody = {
  method: OryLoginMethod.Oidc;
  csrf_token: string;
  provider: OryProvider | string;
  traits: Record<string, unknown>;
  transient_payload?: Record<string, unknown>;
};
type OryUpdateLoginSamlFlowBody = {
  method: OryLoginMethod.Saml;
  traits?: Record<string, unknown>;
} & UpdateLoginFlowWithSamlMethod;
type OryUpdateLoginFlowBody = OryUpdateLoginPasswordFlowBody | OryUpdateLoginOidcFlowBody | OryUpdateLoginSamlFlowBody;
type OryUpdateFlow<T> = {
  flowId: string;
  body: T;
  cookie?: string;
};
type OryUpdateRecoveryFlowBody = {
  csrf_token: string;
  email: string;
};
type OryUpdateRegistrationOidcFlowBody = {
  csrf_token: string;
  method: OryLoginMethod.Oidc;
  provider: OryProvider | string;
  traits: Record<string, unknown>;
  transient_payload?: Record<string, unknown>;
};
type OryUpdateRegistrationPasswordFlowBody = {
  csrf_token: string;
  method: OryLoginMethod.Password;
  password: string;
  traits: Record<string, unknown>;
  transient_payload?: Record<string, unknown>;
};
type OryUpdateRegistrationFlowBody = OryUpdateRegistrationPasswordFlowBody | OryUpdateRegistrationOidcFlowBody;

type OryUpdateSettingsProfileFlowBody = {
  csrf_token: string;
  method: OryUpdateSettingsMethod.Profile;
  traits: Record<string, unknown>;
};

type OryUpdateSettingsPasswordFlowBody = {
  csrf_token: string;
  method: OryUpdateSettingsMethod.Password;
  password: string;
};

type OryUpdateLinkBody = {
  csrf_token: string;
  method: OryUpdateSettingsMethod.Oidc;
  link: OryProvider;
  upstream_parameters: object;
};

type OryUpdateUnLinkBody = {
  csrf_token: string;
  method: OryUpdateSettingsMethod.Oidc;
  unlink: OryProvider;
};

type OryUpdateLinkSamlBody = {
  csrf_token: string;
  method: OryUpdateSettingsMethod.Saml;
  link: string;
};

type OryUpdateSettingsFlowBody =
  | OryUpdateSettingsProfileFlowBody
  | OryUpdateSettingsPasswordFlowBody
  | OryUpdateLinkBody
  | OryUpdateUnLinkBody
  | OryUpdateLinkSamlBody;
type OryUpdateVerificationFlowBody = {
  csrf_token: string;
  email: string;
};

export type OryUpdateLoginFlowRequest = OryUpdateFlow<OryUpdateLoginFlowBody>;
export type OryUpdateRecoveryFlowRequest = OryUpdateFlow<OryUpdateRecoveryFlowBody>;
export type OryUpdateRegistrationFlowRequest = OryUpdateFlow<OryUpdateRegistrationFlowBody>;
export type OryUpdateSettingsFlowRequest = OryUpdateFlow<OryUpdateSettingsFlowBody>;
export type OryUpdateVerificationFlowRequest = OryUpdateFlow<OryUpdateVerificationFlowBody>;
