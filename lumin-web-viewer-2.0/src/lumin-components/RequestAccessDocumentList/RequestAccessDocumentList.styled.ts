import styled, { css } from 'styled-components';

import ShareListItem from 'lumin-components/ShareListItem';
import MemberItem from 'lumin-components/MemberItem';
import { mediaQuery } from 'utils/styles/mediaQuery';

type PersonalItemProps = { $fullList: boolean } & Record<string, unknown>;

export const Title = styled.span`
  font-weight: 375;
  b {
    font-weight: 600;
  }
  white-space: pre-wrap;
`;

const baseItemStyles = css`
  margin-left: ${({ $fullList }: { $fullList: boolean }) => $fullList && `-4px`};
`;

export const PersonalItem = styled(ShareListItem)<PersonalItemProps>`
  ${baseItemStyles}
`;

export const OrgItem = styled(MemberItem)`
  ${baseItemStyles}
`;

export const List = styled.ul`
  ${({ $fullList, $isReskin }: { $fullList: boolean, $isReskin?: boolean }) => {
    if ($isReskin) {
      return css`
        display: flex;
        flex-direction: column;
        gap: var(--kiwi-spacing-0-5);
        ${$fullList && 'padding-left: var(--kiwi-spacing-0-25);'}
        ${!$fullList && 'align-self: stretch;'}
      `;
    }
    return css`
      padding: ${$fullList && '0 16px 8px'};
      ${mediaQuery.md`
        padding: ${$fullList && '0 24px 8px'};
      `}
    `;
  }}
`
