import { Colors, Shadows } from 'constants/styles';
import styled from 'styled-components';

const BaseItem = styled.div`
  background-color: ${Colors.WHITE};
  width: 176px;
  height: 44px;
  padding: 0 0 0 12px;
  box-shadow: ${Shadows.SHADOW_XS};
  border-radius: var(--border-radius-primary);
  border: 1px solid ${Colors.NEUTRAL_20};
  box-sizing: border-box;
`;
export const DragPreviewContainer = styled(BaseItem)`
  display: flex;
  position: relative;
  align-items: center;
`;
export const ImgContainer = styled.div`
  min-width: 32px;
  width: 32px;
  height: 32px;
  border: 1px solid ${Colors.NEUTRAL_20};
  border-radius: 6px;
  box-sizing: border-box;
  overflow: hidden;
`;
export const DragPreviewImage = styled.img`
  object-fit: cover;
  width: 100%;
  height: 100%;
`;
export const NameWrapper = styled.div`
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  margin-left: 12px;
  overflow: hidden;
  white-space: nowrap;
  min-width: 0;
  color: ${Colors.NEUTRAL_100};
`;
export const CountItemMove = styled.div`
  border-radius: 50%;
  width: 20px;
  height: 20px;
  color: ${Colors.WHITE};
  background-color: ${Colors.SECONDARY_50};
  position: absolute;
  top: -10px;
  left: -10px;
  display: ${(props) => (props.countFileMove !== 1 ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
`;
export const DocumentLayer = styled(BaseItem)`
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  transform: translate(4px, 4px);
`;
