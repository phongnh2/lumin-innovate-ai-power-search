import { Colors } from "constants/styles";
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export const Title = styled.h3`
  margin-bottom: 8px;
  color: ${Colors.NEUTRAL_80};
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  padding: 3px;

  span {
    margin-left: 12px;
  }
`

export const Description = styled.p`
  color: ${Colors.NEUTRAL_60};
  font-size: 12px;
  line-height: 16px;

  span {
    font-weight: 600;
    text-decoration: underline;
    color: ${Colors.SECONDARY_50};
    cursor: pointer;
  }
`