import React from 'react';

import Icomoon from 'lumin-components/Icomoon';
import PageTitlePortal from 'lumin-components/PortalElement/PageTitlePortal';
import Tooltip from 'lumin-components/Shared/Tooltip';

import { useDesktopMatch, useTranslation } from 'hooks';

import { Colors } from 'constants/styles';

import * as Styled from './HeaderSection.styled';

function HeaderSection() {
  const isDesktopUpMatch = useDesktopMatch();
  const { t } = useTranslation();

  const renderHeader = () => (
    <Styled.Container>
      <Styled.TitleWrapper>
        <Styled.Title>{t('common.teams')}</Styled.Title>
        <Tooltip
          title={t('listOrgs.tooltip')}
          placement="bottom-start"
          tooltipStyle={{ maxWidth: 327 }}
        >
          <Icomoon className="info" size={18} color={Colors.NEUTRAL_60} />
        </Tooltip>
      </Styled.TitleWrapper>
    </Styled.Container>
  );

  return isDesktopUpMatch ? (
    <PageTitlePortal.Element>
      {renderHeader()}
    </PageTitlePortal.Element>
  ) : renderHeader();
}

export default HeaderSection;
