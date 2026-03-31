import styled from 'styled-components';

const getColor = ({ type }) => ({
  error: {
    primary: 'var(--color-secondary-10)',
    secondary: 'var(--color-secondary-50)',
  },
}[type]);

const getPrimaryColor = (props) => getColor(props).primary;

const getSecondaryColor = (props) => getColor(props).secondary;

export const Container = styled.div`
  padding: 8px 16px;
  position: relative;
  background: ${getPrimaryColor};
  border-radius: var(--border-radius-primary);
  &:before {
    content: '';
    display: block;
    width: 2px;
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    height: calc(100% - 16px);
    border-radius: 99px;
    background: ${getSecondaryColor};
  }
`;

export const Content = styled.p`
  font-size: 12px;
  line-height: 16px;
`;
