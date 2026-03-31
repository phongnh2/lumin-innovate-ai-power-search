import { spacings, typographies } from 'constants/styles/editor';
import styled from 'styled-components';
const GAP = spacings.le_gap_2;

export const Row = styled.div`
  display: flex;
  flex-flow: row wrap;
  min-width: 0;
  gap: ${GAP}px;
`;

const BaseCol = styled.div`
  display: block;
`;

const BaseFakeTracker = styled.div`

  top: 50%;
  height: 12px;
  position: absolute;

  transform: translateY(calc(-50% - 2px));
  border-radius: 999999px;
  width: 100%;
`;

export const FakeTrackerBg = styled(BaseFakeTracker)`
  background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADFJREFUOE9jZGBgEGHAD97gk2YcNYBhmIQBgWSAP52AwoAQwJvQRg1gACckQoC2gQgAIF8IscwEtKYAAAAASUVORK5CYII=")
    left center;
  border: 1px solid ${({ theme }) => theme.le_main_outline_variant};
`;
export const FakeTrackerFg = styled(BaseFakeTracker)`
  background: linear-gradient(90deg, rgba(255,255,255) 0%, #000 100%);
`;

export const LeftCol = styled(BaseCol)`
  flex-grow: 1;
  position: relative;
  .MuiSlider-rail,
  .MuiSlider-track {
    opacity: 0;
  }

  .MuiSlider-thumb {
    border: 1px solid ${({ theme }) => theme.le_main_outline};
    background-color: ${({ theme }) => theme.le_main_surface};
  }
`;

export const RightCol = styled(BaseCol)`
  flex: 0 0 60px;
  max-width: 60px;
`;

export const Title = styled.div`
  ${{ ...typographies.le_title_small }}
  color: ${({ theme }) => theme.le_main_on_surface};
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.le_gap_0_5}px;
`;
