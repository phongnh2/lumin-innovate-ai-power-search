
import styled from 'styled-components';
import SharedTabs from 'lumin-components/Shared/Tabs';
import { Colors } from 'constants/styles';
import { makeStyles } from '@mui/styles';

interface ProgressProp {
  $width: number;
}

export const Container = styled.div`
  height: 320px;
  width: 480px;
  border-radius: var(--border-radius-primary);
`;

export const HeaderContainer = styled.div`
`

export const TabsContainer = styled.div`
  padding: 0px 16px;
`

export const Tabs = styled(SharedTabs)`
  display: inline-flex;
`;

export const Divider = styled.div<{$empty?: boolean}>`
  width: 100%;
  height: 1px;
  background-color: var(--color-neutral-20);
  display: block;
  ${({ $empty }) => $empty && `
    display: none;
  `}
`;

export const ResultList = styled.div`
  padding: 4px 0px 8px 0px;
`;


export const ContainerEmpty = styled.div`
  display: flex;
  padding-top: 50px;
`;

export const useTabStyles = makeStyles({
  tab: {
    width: '120px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 375,
  },
  tabActive: {
    fontWeight: 375,
  }
});

export const Badge = styled.div`
  height: 18px;
  width: 18px;
  background-color: ${Colors.SECONDARY_50};
  border-radius: 50%;
  font-size: 10px;
  color: ${Colors.NEUTRAL_10};
  text-align: center;
  font-weight: 600;
  line-height: 18px;
  margin-left: 8px;
`;

