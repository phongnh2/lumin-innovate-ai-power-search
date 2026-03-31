import Button from '@mui/material/Button';
import { typographies } from 'constants/styles/editor';
import SvgElement from 'lumin-components/SvgElement';
import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const LoadingContainer = styled.div`
  position: absolute;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

export const IntegrationAlertModal = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  width: 750px;
  ${mediaQuery.lg`
    width: 100%;
  `}
`;

export const SkeletonBar = styled.span`
  display: inline-block;
  height: 18px;
  position: relative;
  overflow: hidden;
  background-color: var(--color-other-12);
  border-radius: 12px;
  width: 340px;
  margin: 0 40px;

  &::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    transform: translateX(-100%);
    background: var(--color-blue);
    border-radius: 12px;
    animation: shimmer 4s infinite;
    content: "";
  }

  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
`;

export const Title = styled.p`
  font-style: normal;
  line-height: 32px;
  ${({ formLabel, forSign, forRedirect }) => `
    font-size: ${formLabel ? '16px' : '24px'};
    font-weight: ${forRedirect || formLabel ? '600' : '700'};
    margin-top: ${formLabel ? '6px' : '0px'};
    color:  ${forSign ? 'var(--color-primary-100)' : 'var(--color-lumin-sign-primary)'};
    font-family: ${forRedirect ? 'var(--font-sign-primary)' : formLabel ? 'var(--font-secondary)' : 'var(--font-sign-primary)'};
  `}
  span.required-dot {
    color: var(--color-lumin-sign-error);
  }
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 40px 0;
`;

export const Description = styled.p`
  ${typographies.le_body_large}
`;

export const ModalHeader = styled.div`
  position: relative;
  justify-content: space-between;
  display: flex;
  height: 72px;
  align-items: center;
  padding: 24px 0;
  background-color: white;
  border-bottom: 1px solid var(--color-lumin-sign-outline);
`;

export const ModalHeaderRight = styled.div`
  display: flex;
  align-items: center;
`;

export const ModalContent = styled.div`
  width: 65%;
  max-width: 929px;
  height: auto;
  border-radius: 8px;
  padding: 40px 0;
  margin: 0 auto;
`;

export const ModalFooter = styled.div`
  display: inline-flex;
  height: auto;
  width: auto;
  position: fixed;
  bottom: 32px;
  right: 36px;
  font-weight: 500;
  font-size: 12px;
  line-height: 18px;
  color: var(--color-lumin-sign-primary);
  font-family: var(--font-secondary);
`;

export const MainWrapper = styled.div`
  background: white;
  display: grid;
  grid-template-columns: auto 2fr;
  gap: 32px 24px;
  height: auto;
  border-radius: 8px;
  padding: 24px 24px 24px 80px;
  margin-top: 16px;
  animation: zoom-out 0.5s ease;
  @keyframes zoom-out {
    0% {
      transform: scale(0, 0);
    }
    100% {
      transform: scale(1, 1);
    }
  }
`;

export const AddUserWrapper = styled.div`
  width: 80%;
`;

export const UserList = styled.div`
  overflow: auto;
  max-height: 250px;
  border-bottom: solid 1px var(--color-lumin-sign-outline);
  margin-bottom: 16px;
  &:first-child {
    padding-top: 0px;
  }
`;

export const UserMember = styled.div`
  overflow: scroll;
  max-height: 250px;
  border-bottom: solid 1px var(--color-other-6);
  margin-bottom: 12px;
`;

export const AddButton = styled(Button)`
  font-family: var(--font-secondary);
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  text-transform: none;
  color: var(--color-lumin-sign-primary);
  border-radius: 8px;
  border: 1.5px solid var(--color-lumin-sign-outline);
  background: var(--color-neutral-0);
  padding: 5px 30px;
  height: 40px;
  span {
    margin-left: 8px;
  }
`;

export const NextButton = styled(Button)`
  font-family: var(--font-secondary);
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  text-transform: none;
  color: var(--color-neutral-10);
  border-radius: 8px;
  background: var(--color-lumin-sign-primary);
  text-align: center;
  height: 48px;
  width: 200px;
  grid-column: 2;
  margin-left: auto;
  float: right;
  right: 5px;

  &:hover {
    background: var(--color-lumin-sign-primary);
    opacity: 0.8;
  }

  &.MuiButton-root.Mui-disabled {
    opacity: 0.6;
    color: var(--color-neutral-10);
    cursor: not-allowed;
  }
`;

export const FooterLogo = styled(SvgElement)`
  width: 81px;
  height: 16px;
  margin-left: 4px;
`;
