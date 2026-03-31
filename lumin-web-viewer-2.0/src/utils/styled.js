import { css } from 'styled-components';
import { isArray } from 'lodash';
import { THEME_MODE } from 'constants/lumin-common';

export const styledPropConfigs = (props = ['loading']) => ({
  shouldForwardProp: (prop, defaultValidationFn) => {
    const canValidate = isArray(props) ? !props.includes(prop) : props !== prop;
    return canValidate && defaultValidationFn(prop);
  },
});

export const isUsingLightMode = (props) => props.theme.mode === THEME_MODE.LIGHT;

export const stretchParent = css`
  display: flex;
  flex-direction: column;
`;

export const stretchChildren = css`
  flex: 1;
`;
