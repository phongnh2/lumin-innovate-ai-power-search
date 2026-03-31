import styled from 'styled-components';
import { Link } from 'react-router-dom';

import { Fonts, Colors } from 'constants/styles';

export const Container = styled.div`
  text-align: left;
`;

export const TitleContainer = styled.div`
  display: flex;
  margin-bottom: 8px;
`;

export const Title = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  margin-left: 12px;
`;

export const Description = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: ${Colors.NEUTRAL_70};
  span {
    font-weight: 600;
    line-height: 16px;
    color: ${Colors.NEUTRAL_100};
  }
`;

export const Close = styled.button``;

export const Image = styled.img`
  width: 40px;
  height: 40px;
`;

export const ItemContainer = styled.ul`
  list-style: none;
  padding-left: 16px;

  li::before {
    content: "";
    width: 8px;
    height: 8px;
    background-color: ${Colors.PRIMARY_80};
    display: inline-block;
    margin-right: 8px;
    border-radius: 50%;
  }
`;
export const Item = styled.li`
  margin: 0;
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: ${Colors.NEUTRAL_70};
  text-indent: -16px;
  span {
    font-weight: 600;
    line-height: 16px;
    color: ${Colors.NEUTRAL_100};
  }
`;

export const Notify = styled.p`
  margin-top: 16px;
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: ${Colors.NEUTRAL_70};
`;

export const CustomLink = styled(Link)`
  color: ${Colors.NEUTRAL_100};
  text-decoration: underline;
`;

