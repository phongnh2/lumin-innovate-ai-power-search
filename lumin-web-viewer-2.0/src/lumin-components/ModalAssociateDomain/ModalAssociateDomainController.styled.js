import styled from 'styled-components';
import { Colors, Fonts } from 'constants/styles';

export const Title = styled.h2`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  color: ${Colors.NEUTRAL_100};
  text-align: center;
`;

export const ErrorWrapper = styled.div`
  display: flex;
  margin-top: 16px;
  padding: 8px 16px 8px 0;
  background-color: ${Colors.SECONDARY_10};
  border-radius: var(--border-radius-primary);
`;

export const Error = styled.div`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
  padding-left: 16px;
  position: relative;

  &:before{
    display: block;
    content: '';
    width: 2px;
    height: 90%;
    max-height: 24px;
    background-color: ${Colors.SECONDARY_50};
    border-radius: var(--border-radius-primary);
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
  }
`;

export const NoteWrapper = styled.div`
  margin-top: 16px;
  padding: 16px;
  background-color: ${Colors.PRIMARY_10};
  border-radius: var(--border-radius-primary);
`;

export const NoteTitle = styled.h5`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.PRIMARY_90};
  margin-bottom: 8px;
`;

export const NoteList = styled.ul`
  list-style-type: disc;
  padding-left: 20px;
`;

export const ListItem = styled.li`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
`;

export const InputWrapper = styled.div`
  margin-top: 16px;
`;

export const ButtonWrapper = styled.div`
  margin-top: 16px;
`;
