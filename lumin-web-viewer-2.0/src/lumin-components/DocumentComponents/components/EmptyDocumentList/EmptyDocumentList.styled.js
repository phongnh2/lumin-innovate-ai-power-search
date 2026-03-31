import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { Colors } from 'constants/styles';

export const Wrapper = styled.div`
  padding-top: 16px;
  ${mediaQuery.xl`
    padding-top: 32px;
  `}
`;
export const Circle = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  border-radius: 50%;
  background-color: ${Colors.PRIMARY_10};
  margin: auto;
  width: 288px;
  height: 288px;
  justify-content: center;
  align-items: center;
  ${mediaQuery.md`
    width: 440px;
    height: 440px;
  `}
`;
export const DragDropImg = styled.img`
  width: 108px;
  object-fit: cover;
  user-select: none;
  margin-bottom: 16px;
  ${mediaQuery.md`
    width: 138px;
    margin-bottom: 24px;
  `}
  ${mediaQuery.md`
    width: 142px;
    margin-bottom: 32px;
  `}
`;
export const MainText = styled.p`
  margin: 0 0 4px;
  font-weight: 600;
  color: ${Colors.NEUTRAL_100};
  font-size: 17px;
  line-height: 1.33;
  ${mediaQuery.md`
    margin-bottom: 8px;
    font-size: 24px;
  `}
`;

export const SubText = styled.p`
  margin: 0;
  font-weight: normal;
  font-size: 14px;
  line-height: 1.428;
  color: ${Colors.NEUTRAL_80};
  ${mediaQuery.md`
    font-size: 17px;
  `}
`;
export const NoDocumentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 16px;
  ${mediaQuery.md`
    margin-top: 24px;
  `}
`;
export const NoDocumentText = styled.p`
  margin: 0;
  font-weight: 400;
  color: ${Colors.NEUTRAL_80};
  font-size: 12px;
  line-height: 1.33;
  ${mediaQuery.md`
    font-size: 17px;
  `}
`;
export const NoDocumentImg = styled.img`
  margin-bottom: 8px;
  width: 120px;
  ${mediaQuery.md`
    width: 150px;
    margin-bottom: 16px;
  `}
`;
