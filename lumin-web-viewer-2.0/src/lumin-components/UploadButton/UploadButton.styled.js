import styled from 'styled-components';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import Icomoon from 'lumin-components/Icomoon';

export const ButtonText = styled.span`
  font-size: 14px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 20px;
  letter-spacing: 0.34px;
  text-transform: none;
  display: inline-block;
  margin: 0 auto 0 10px;
`;

export const UploadSystemButton = styled(ButtonMaterial)`
  width: 160px;
  padding: 20px;
`;

export const IconDropdown = styled(Icomoon)`
  margin-left: 8px;
`;
