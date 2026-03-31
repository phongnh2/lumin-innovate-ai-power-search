import styled from 'styled-components';
import { spacings, typographies } from 'constants/styles/editor';
import UploadPopover from './components/UploadPopover';

export const EmptyViewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Image = styled.img`
  margin-top: ${spacings.le_gap_2}px;
  margin-bottom: ${spacings.le_gap_3}px;
  max-width: 130px;
`;

export const Title = styled.div`
  margin-bottom: ${spacings.le_gap_4}px;
  max-width: 60%;
  text-align: center;
  ${({...typographies.le_body_medium})}
  ${({theme}) => `
    color: ${theme.le_main_on_surface_variant};
  `}
`;
