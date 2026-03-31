import React from 'react';

import Tooltip from '@new-ui/general-components/Tooltip';

import getBackButtonTooltip from 'lumin-components/HeaderLumin/helpers/getBackButtonTooltip';
import useGetParentListUrl from 'lumin-components/HeaderLumin/hooks/useGetParentListUrl';
import useMatchPathLastLocation from 'lumin-components/HeaderLumin/hooks/useMatchPathLastLocation';
import Icomoon from 'luminComponents/Icomoon';
import SvgElement from 'luminComponents/SvgElement';

import { useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import useExitFromViewer from './useExitFromViewer';
import * as Styled from '../TitleBarLeftSection.styled';

const Logo = () => {
  const backUrl = useGetParentListUrl();
  const lastLocationText = useMatchPathLastLocation(backUrl);
  const { t } = useTranslation();

  const { handleNavigateFromViewer } = useExitFromViewer({ backUrl });

  return (
    <Tooltip title={getBackButtonTooltip({ documentLocation: lastLocationText, t })}>
      <Styled.LogoContainer onClick={handleNavigateFromViewer} data-lumin-btn-name={ButtonName.LUMIN_HOME_PAGE}>
        <Styled.LogoButton id="new-lumin-logo-btn">
          <SvgElement content="new-ui-lumin-logo" width={48} height={48} />
        </Styled.LogoButton>

        <Styled.BackBtn>
          <Icomoon className="md_arrow_back" size={24} />
        </Styled.BackBtn>
        <Styled.DummyOverlay />
      </Styled.LogoContainer>
    </Tooltip>
  );
};

export default React.memo(Logo);
