import styled from 'styled-components';
import { Colors } from 'constants/styles';
import { mediaQuery, mediaQueryDown } from 'utils/styles/mediaQuery';
import { TEMPLATE_RATIO } from 'constants/templateConstant';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import ButtonMoreBase from 'lumin-components/ButtonMore';
import * as ButtonMoreStyled from 'lumin-components/ButtonMore/ButtonMore.styled';

export const ThumbnailFrame = styled.div`
  position: relative;
  width: 100%;
  padding-top: ${() => `calc(100% * ${TEMPLATE_RATIO})`};
  overflow: hidden;
  border-radius: var(--border-radius-primary);
`;
export const ThumbnailContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  border-radius: var(--border-radius-primary);
  border: var(--border-secondary);
  overflow: hidden;
`;

export const Thumbnail = styled(img)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
`;

export const ButtonPreview = styled(ButtonMaterial)`
  opacity: 0;
  visibility: hidden;
`;

export const Name = styled.p`
  margin-top: 12px;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
  font-weight: 400;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: break-word;
  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
    margin-top: 16px;
  `}
  ${mediaQuery.xl`
    margin-top: 12px;
  `}
`;

export const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  background-color: transparent;
  opacity: 1;
  transition: transform 0.25s ease, opacity 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border-radius: var(--border-radius-primary);
  /* stylelint-disable-next-line property-no-vendor-prefix */
  -webkit-filter: blur(0px);
  @media (hover: hover) {
    background-color: rgba(16, 45, 66, 0.8);
    opacity: 0;
  }

  ${mediaQuery.md`
    padding: 0 24px;
  `}
  ${mediaQuery.xl`
    padding: 0 16px;
  `}
`;
const activeOverlay = `
  ${Name} {
    text-decoration: underline;
  }
  ${Overlay} {
    opacity: 1;
    @media (hover: hover) {
      ${ButtonPreview} {
        opacity: 1;
        visibility: visible;
      }
    }
  }
`;
export const Container = styled.div`
  width: 100%;
  cursor: pointer;
  ${(props) => (props.$disabled
    ? `
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  `
    : `
    @media (hover: hover) {
      &:hover {
        ${activeOverlay}
      }
    }
  `)}

  ${(props) => props.$openedMoreButton && activeOverlay}
`;
export const ButtonMoreContainer = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
  
  ${ButtonMoreStyled.CustomPopperButton} {
    width: 32px;
    height: 32px;
    min-width: 32px;
  }

  ${mediaQueryDown.md`
    top: 12px;
    right: 12px;
    ${ButtonMoreStyled.CustomPopperButton} {
      width: 24px;
      height: 24px;
      min-width: 24px;
      background-color: ${Colors.NEUTRAL_10};
      border-radius: var(--border-radius-dense);
    }
  `}
`;

export const DefaultThumbnail = styled.img`
  width: 34%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  object-fit: cover;
  z-index: 1;
`;

export const ButtonMore = styled(ButtonMoreBase)`
  .icon {
    &:before {
      color: ${Colors.NEUTRAL_80};
      @media (hover: hover) {
        color: white;
      }
    }
  }
`;
