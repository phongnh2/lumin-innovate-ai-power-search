import styled from "styled-components";

import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { Colors, Fonts } from 'constants/styles';
import ButtonIcon from "luminComponents/Shared/ButtonIcon";

interface ProgressProp {
  $width: number;
}

export const DocumentStackContainer = styled.div`
  padding: 0;
  cursor: pointer;
`;

export const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
`

export const Status = styled.p`
  color: ${Colors.NEUTRAL_80};
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  margin-right: 12px;
  user-select: none;
`;

export const Progress = styled.div<ProgressProp>`
  background-color: ${Colors.NEUTRAL_20};
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  height: 8px;
  width: 100%;
  margin: 4px 0 0;
  &::before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    will-change: width;
    width: ${(props) => props.$width}%;
    background-color: ${Colors.PRIMARY_70};
  }
`;

export const PopperContainer = styled.div`
  padding: 16px;
  position: relative;
`;

export const PopperImgContainer = styled.div`
  position: relative;
  padding-top: 41%; // height/width * width/container_width
  height: 0;
  width: 62.5%;
  margin: 0 auto;
`;

export const PopperImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  object-fit: cover;
`;

export const CloseButton = styled(ButtonIcon)`
  position: absolute;
  top: 10px;
  right: 6px;
`;

export const Title = styled.h2`
  margin-top: 16px ;
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  color: ${Colors.NEUTRAL_100};
`;

export const Description = styled.p`
  margin-top: 4px;
  font-family: ${Fonts.PRIMARY};
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  color: ${Colors.NEUTRAL_80};
`;

export const ButtonLink = styled(ButtonMaterial)`
  margin-top: 16px;
`;