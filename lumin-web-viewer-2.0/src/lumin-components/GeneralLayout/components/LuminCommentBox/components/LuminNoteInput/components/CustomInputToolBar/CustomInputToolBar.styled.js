import styled from 'styled-components';
export const Wrapper = styled.div`
  ${({ disableToolBar }) =>
    disableToolBar &&
    `
      cursor: not-allowed;
      pointer-events: none
  `}
`;

export const StyleItem = styled.button`
  margin-right: 6px;
  border-radius: 4px;
  padding: 7px;
  width: 20px;
  height: 20px;

  ${({ disableToolBar, theme }) =>
    disableToolBar
      ? `
        pointer-events: none;
      `
      : `
        cursor: pointer;
        &.ql-active {
          background-color: ${theme.le_main_primary_container} !important;
          .ql-stroke {
            stroke: ${theme.le_main_on_surface} !important;
          }
      
          .ql-fill {
            fill: ${theme.le_main_on_surface} !important;
          }
        }

        .ql-stroke {
          stroke: ${theme.le_main_on_surface} !important;
        }
    
        .ql-fill {
          fill: ${theme.le_main_on_surface} !important;
        }
  
        &:hover {
          background-color: ${theme.le_state_layer_on_surface_variant_hovered} !important;
          .ql-fill {
            fill: ${theme.le_main_on_surface} !important;
          }
    
          .ql-stroke {
            stroke: ${theme.le_main_on_surface} !important;
          }
        }  
      `
    }
`;
