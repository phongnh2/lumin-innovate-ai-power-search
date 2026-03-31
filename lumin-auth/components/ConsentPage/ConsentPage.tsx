import { Select, Divider } from '@kiwi-ui';
import { OAuth2Client } from '@ory/client';
import Image from 'next/image';
import { Fragment, useState } from 'react';

import { environment } from '@/configs/environment';
import { ButtonName } from '@/constants/buttonEvent';
import { ElementName } from '@/constants/common';
import { CookieStorageKey } from '@/constants/cookieKey';
import { Scope, Scopes } from '@/constants/oauth2Scopes';
import { getOAuth2Ref } from '@/constants/ref';
import { closeElement, openElement } from '@/features/visibility-slice';
import { useAppDispatch } from '@/lib/hooks';
import CaretUpDown from '@/public/assets/caret-up-down.svg';
import ConsentLogo from '@/public/assets/consent-logo.svg';
import ConsentPDF from '@/public/assets/consent-pdf.svg';
import ConsentSign from '@/public/assets/consent-sign.svg';
import DefaultWorkspaceAvatar from '@/public/assets/default-org-avatar.png';
import { Icomoon } from '@/ui';
import { ButtonColor } from '@/ui/Button';
import CookieUtils from '@/utils/cookie.utils';

import useClickLogout from '../ProfileDropdown/useClickLogout';

import styles from './ConsentPage.module.scss';

import * as Styled from './ConsentPage.styled';

type ConsentPageProps = {
  skipConsent: boolean;
  challenge: string;
  requestedScopes?: string[];
  user: {
    email: string;
    subject: string | null;
    avatarRemoteId: string | null;
    name: string;
  };
  requestUrl: string;
  client: OAuth2Client;
  workspaces: {
    workspaceId: string;
    workspaceName: string;
    workspaceAvatarRemoteId: string;
  }[];
  lastAccessWorkspaceId: string;
};

const ConsentPrefix = {
  pdf: <ConsentPDF />,
  sign: <ConsentSign />
};

function ConsentPage({ challenge, requestUrl, user, requestedScopes, client, workspaces, lastAccessWorkspaceId }: ConsentPageProps) {
  const dispatch = useAppDispatch();
  const [logout] = useClickLogout();

  const { client_name: clientName, logo_uri: logoUri, policy_uri: policyUri, tos_uri: tosUri } = client;

  const [currentWorkspace, setCurrentWorkspace] = useState<string>(lastAccessWorkspaceId);

  const isFromFirstPartyApp = !Boolean(policyUri); // First party app has no policy uri

  const isProductionOrDevelopment = environment.public.common.environment === 'production' || environment.public.common.environment === 'development';

  const getWorkspaceAvatarUrl = (workspaceId: string) => {
    const workspaceAvatarRemoteId = workspaces.find(workspace => workspace.workspaceId === workspaceId)?.workspaceAvatarRemoteId;
    const workspaceAvatarUrl = workspaceAvatarRemoteId ? `${environment.public.host.backendUrl}/user/getAvatar?remoteId=${workspaceAvatarRemoteId}` : null;
    if (!workspaceAvatarUrl) {
      return <Image src={DefaultWorkspaceAvatar} alt='Workspace Avatar' width={24} height={24} className={styles.workspaceAvatar} />;
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={workspaceAvatarUrl} alt='Workspace Avatar' className={styles.workspaceAvatar} />;
  };

  const onLogOut = async () => {
    dispatch(openElement(ElementName.LUMIN_LOADING));
    CookieUtils.delete(
      isProductionOrDevelopment ? CookieStorageKey.GOOGLE_ACCESS_TOKEN : `${CookieStorageKey.GOOGLE_ACCESS_TOKEN}_${environment.public.common.environment}`
    );
    const reqUrl = new URL(requestUrl);
    const ref = reqUrl.searchParams.get('ref');
    const from = getOAuth2Ref(ref);
    const returnToQuery = `return_to=${encodeURIComponent(requestUrl + '&from=' + from)}`;
    await logout(returnToQuery);
    dispatch(closeElement(ElementName.LUMIN_LOADING));
  };

  const renderScope = (scope: Scope, { isLastItem = false }: { isLastItem: boolean }) => {
    const scopeInfo = Scopes[scope];
    return (
      <Styled.ScopeWrapper defaultExpanded emotion={{ $isLastItem: isLastItem }} disableGutters>
        <Styled.ScopeSummary
          expandIcon={<Icomoon type='arrow-right-alt' size={12} />}
          sx={{
            '& .MuiAccordionSummary-expandIconWrapper': {
              '&.Mui-expanded': {
                transform: 'rotate(90deg)'
              }
            },
            '& .MuiAccordionSummary-content': {
              margin: 0
            }
          }}
        >
          <Styled.ScopeDetailWrapper>
            {ConsentPrefix[scopeInfo.context]}
            <p style={{ marginLeft: 8 }}>{scopeInfo.title}</p>
          </Styled.ScopeDetailWrapper>
        </Styled.ScopeSummary>
        <Styled.ScopeDetail>
          {clientName} will be able to {scopeInfo.description}
        </Styled.ScopeDetail>
      </Styled.ScopeWrapper>
    );
  };
  const renderedScopes = requestedScopes?.filter(s => !['openid', 'offline_access'].includes(s));
  return (
    <main style={{ background: '#FCF0EE', minHeight: '100vh', padding: 32 }}>
      <section css={Styled.sectionCss}>
        <form action='/api/oauth2/consent' method='POST'>
          <input type='hidden' name='challenge' value={challenge} readOnly />
          {requestedScopes?.map(scope => (
            <input key={scope} type='hidden' name='grant_scope' value={scope} readOnly />
          ))}
          <input type='hidden' name='workspace_id' value={currentWorkspace} readOnly />
          <Styled.ConnectedLogoWrapper>
            <Styled.ClientImage src={logoUri} />
            <div style={{ marginLeft: 6, marginRight: 6 }} />
            <Styled.LinkIcon type='link' size={18} />
            <ConsentLogo />
          </Styled.ConnectedLogoWrapper>
          <Styled.MainTitle>
            <strong>{clientName}&nbsp;</strong>
            <span>is requesting access to</span>
            <b>&nbsp;Lumin</b>
          </Styled.MainTitle>
          <Styled.UserEmail>{user.email}</Styled.UserEmail>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Styled.NotYou onClick={onLogOut}>Not you?</Styled.NotYou>
          </div>
          <Select
            size='lg'
            classNames={{
              root: styles.container,
              label: styles.label,
              input: styles.input,
              dropdown: styles.dropdown
            }}
            renderOption={({ option: { label, value } }: { option: { label: string; value: string } }) => (
              <div key={value} className={styles.option}>
                {getWorkspaceAvatarUrl(value)}
                <span className={styles.optionLabel}>{label}</span>
              </div>
            )}
            label='Select a Workspace'
            comboboxProps={{ position: 'bottom-start' }}
            leftSection={getWorkspaceAvatarUrl(currentWorkspace)}
            rightSection={<CaretUpDown style={{ width: 14, height: 14 }} />}
            data={workspaces.map(workspace => ({
              value: workspace.workspaceId,
              label: workspace.workspaceName
            }))}
            value={currentWorkspace}
            onChange={(value: string | null) => setCurrentWorkspace(value!)}
          />
          <Divider className={styles.divider} />
          <Styled.Title>{clientName} will be able to:</Styled.Title>
          <Styled.Scopes>
            {renderedScopes?.map((scope, index) => (
              <Fragment key={scope}>{renderScope(scope as Scope, { isLastItem: index === renderedScopes.length - 1 })}</Fragment>
            ))}
          </Styled.Scopes>
          <Styled.ButtonGroup>
            <Styled.AllowButton
              type='submit'
              data-lumin-btn-name={ButtonName.ALLOW_CONSENT}
              name='submit'
              value='allow'
              onClick={() => {
                dispatch(openElement(ElementName.LUMIN_LOADING));
              }}
            >
              Allow access
            </Styled.AllowButton>
            <Styled.DenyButton
              color={ButtonColor.GHOST}
              type='submit'
              data-lumin-btn-name={ButtonName.DENY_CONSENT}
              name='submit'
              value='deny'
              onClick={() => {
                dispatch(openElement(ElementName.LUMIN_LOADING));
              }}
            >
              Cancel
            </Styled.DenyButton>
          </Styled.ButtonGroup>
          <Styled.NoteWrapper>
            <Styled.NoteTitle>Make sure you trust {clientName}</Styled.NoteTitle>
            {isFromFirstPartyApp ? (
              <Styled.NoteDescription>
                If you continue, you may be sharing sensitive information. Lumin does not review third party integrations like {clientName}.
              </Styled.NoteDescription>
            ) : (
              <Styled.NoteDescription>
                By continuing, you’re granting <b>{clientName}</b> access to your Lumin account data as described above. You can learn more about how{' '}
                <b>{clientName}</b> uses and protects your information in its{' '}
                <a href={policyUri} target='_blank' rel='noreferrer'>
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href={tosUri} target='_blank' rel='noreferrer'>
                  Terms of Use
                </a>
                . Please make sure you trust this app before proceeding.
              </Styled.NoteDescription>
            )}
          </Styled.NoteWrapper>
        </form>
      </section>
    </main>
  );
}

export default ConsentPage;
