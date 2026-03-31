import styled from 'styled-components';
import { spacings, typographies } from 'constants/styles/editor';
import SingleButton from 'luminComponents/ViewerCommonV2/ToolButton/SingleButton';

export const Wrapper = styled.div``;
export const DrawingCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
`;

const BaseSection = styled.div`
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.le_main_outline_variant};
`;

export const DrawingSection = styled(BaseSection)`
  background-color: ${({ theme }) => theme.le_signature_signature_container};
  cursor: crosshair;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

export const Placeholder = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  user-select: none;
  cursor: crosshair;
  color: ${({ theme }) => theme.le_signature_on_signature_container_variant};
  padding: 8px 0;
  margin: 0 40px 48px;
  ${{ ...typographies.le_headline_small }}
  border-bottom: 1px solid ${({ theme }) => theme.le_main_outline_variant};
`;

export const ColorPickerWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacings.le_gap_0_5}px;
  padding: 0 ${spacings.le_gap_1}px;
`;

export const ChangeColor = styled.span`
  ${{ ...typographies.le_label_large }}
  color: ${({ theme }) => theme.le_main_on_surface};
`;

export const ButtonChangeColor = styled(SingleButton)`
  .icon-md_circle_filled {
    border: 1px solid ${props => props.theme.le_main_outline};
    border-radius: 999px;
  }
`;

export const FontAndColorPickerWrapper = styled.div`
  display: flex;
`;

export const ActionWrapper = styled.div`
  display: flex;
  margin-bottom: ${spacings.le_gap_0_5}px;
`;

export const RemoveBtnWrapper = styled.div`
  margin-left: auto;
`;

export const TabsWrapper = styled.div`
  margin-bottom: ${spacings.le_gap_1}px;
  background-color: ${({ theme }) => {
    return theme.le_main_surface_container_high;
  }};
  height: 40px;
  border-radius: 999999px;
`;

export const BaseLine = styled.span`
  ${{ ...typographies.le_body_medium }}
  color: ${({ theme }) => theme.le_signature_on_signature_container_variant};
`;

export const Anchor = styled(BaseLine)`
  color: ${({ theme }) => theme.le_main_on_primary_fixed_variant};
  text-decoration: underline;
  cursor: pointer;
`;
export const UploadImgEmptyContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${spacings.le_gap_0_5}px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.le_signature_on_signature_container_variant};;


  .SvgElement {
    margin-bottom: 4px;
    fill: ${({ theme }) => theme.le_signature_on_signature_container_variant}!important;
  }
`;

export const UploadImgSection = styled(BaseSection)`
  height: 236px;
  user-select: none;
  padding: 24px 48px;
  position: relative;
  background-color: ${({ theme }) => theme.le_signature_signature_container};
  ${({ $haveImgcontent, theme }) =>
    $haveImgcontent
      ? `
      height: 200px;
      background-image: linear-gradient(45deg, ${theme.le_main_surface_container_highest} 25%, transparent 25%),
        linear-gradient(-45deg, ${theme.le_main_surface_container_highest} 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, ${theme.le_main_surface_container_highest} 75%),
        linear-gradient(-45deg, transparent 75%, ${theme.le_main_surface_container_highest} 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    `
      : ''}
`;

export const DemoImg = styled.img`
  object-fit: contain;
  width: 100%;
  height: 100%;
  ${({ $visible }) => ($visible ? '' : 'display: none;')}
`;

export const TypingSection = styled(BaseSection)`
  padding: 0px 40px 48px 40px;
  background: ${({ theme }) => theme.le_signature_signature_container};
`;
export const Input = styled.input`
  border: none;

  padding: 0;
  top: 50%;
  background: transparent;
  font-size: var(--placeholder-font-size);
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  text-align: center;
  width: 100%;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${({ theme }) => theme.le_signature_on_signature_container_variant};;
    opacity: 1; /* Firefox */
  }
`;

export const InputWrapper = styled.div`
  --left: 48px;
  --right: 48px;
  position: absolute;
  left: var(--left);
  right: var(--right);
  max-width: calc(100% - var(--left) - var(--right));
  bottom: calc(${spacings.le_gap_6}px + 13px);

  &::after {
    position: absolute;
    content: '';
    bottom: 6px;
    left: 0;
    right: 0;
    height: 1px;
    background: ${({ theme }) => theme.le_main_outline_variant};
  }
`;

export const MsgWraper = styled.div`
  position: absolute;
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

const BaseMsg = styled.span`
  ${{ ...typographies.le_body_small }}
`;

export const ErrorMsg = styled(BaseMsg)`
  color: ${({ theme }) => theme.le_error_error};
`;
export const Desc = styled(BaseMsg)`
  color: ${({ theme }) => theme.le_main_on_surface_variant};
`;

export const CheckboxWrapper = styled.div`
  height: 32px;

  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  margin-bottom: 16px;
`;

export const CheckboxTitle = styled.span`
  ${{ ...typographies.le_body_small }}
  color: ${({ theme }) => theme.le_main_on_surface};
`;

export const FooterWrapper = styled.div`
  display: flex;
  justify-content: end;
  gap: ${spacings.le_gap_1}px;
`;

export const DropIndicator = styled.div`
  position: absolute;
  inset: 0;
  /* background-color: ${({ theme }) => theme.le_state_layer_on_surface_hovered}; */
  .SvgElement {
    fill: ${({ theme }) => theme.le_main_inverse_on_surface}!important;
  }
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: ${spacings.le_gap_1}px;
  align-items: center;
  justify-content: center;
`;

export const DropIndicatorBackDrop = styled.div`
  position: absolute;
  inset: 0;
  background-color: ${({ theme }) => theme.le_main_scrim};
  z-index: 1;
  opacity: 0.68;
`;

export const DropIndicatorText = styled.span`
  ${{ ...typographies.le_body_medium }}
  color: ${({ theme }) => theme.le_main_inverse_on_surface};
`;

export const ContentWrapper = styled.div`
  display: flex;
  padding: ${spacings.le_gap_1}px;
  gap: ${spacings.le_gap_1}px;
  flex-direction: column;
  width: 270px;
  background-color: ${({ theme }) => theme.le_main_surface};
`;
