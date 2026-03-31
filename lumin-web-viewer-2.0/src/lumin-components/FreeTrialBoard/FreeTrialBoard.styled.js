import styled from 'styled-components';

import TrackedForm from 'lumin-components/Shared/TrackedForm';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Billing = styled(TrackedForm)`
  display: grid;
  gap: 24px;
  margin-top: 16px;
  ${mediaQuery.md`
    max-width: 632px;
    width: 100%;
    margin: 24px auto 0;
  `}
  ${mediaQuery.xl`
    max-width: none;
    width: auto;
    grid-template-columns: 632px 480px;
    justify-content: center;
  `}
`;

export const BillingNewUI = styled(TrackedForm)`
  display: grid;
  gap: 24px;
  margin-top: 16px;
  ${mediaQuery.md`
    max-width: 632px;
    width: 100%;
    margin: 24px auto 0;
  `}
  ${mediaQuery.xl`
    max-width: none;
    width: auto;
    grid-template-columns: 640px 360px;
    justify-content: center;
  `}
`;

export const BillingReskin = styled(TrackedForm)`
  display: grid;
  gap: var(--kiwi-spacing-3);
  ${mediaQuery.md`
    width: 100%;
  `}
  ${mediaQuery.xl`
    max-width: none;
    width: auto;
    grid-template-columns: 640px 440px;
    justify-content: center;
  `}
`;
