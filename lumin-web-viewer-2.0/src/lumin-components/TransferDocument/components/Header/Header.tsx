/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PlainTooltip, Icomoon as KiwiIcomoon, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTransferDocumentContext } from 'lumin-components/TransferDocument/hooks';
import Icomoon from 'luminComponents/Icomoon';
import Tooltip from 'luminComponents/Shared/Tooltip';
import {
  Destination,
  ITransferDocumentContext,
} from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';

import { useEnableWebReskin, useTabletMatch, useTranslation } from 'hooks';

import { Colors } from 'constants/styles';

import { IOrganization } from 'interfaces/organization/organization.interface';

import SearchGroup from '../SearchGroup';

import * as Styled from './Header.styled';

const Header = ({
  setSearching,
  searching,
}: {
  setSearching: React.Dispatch<React.SetStateAction<boolean>>;
  searching: boolean;
}): JSX.Element => {
  const { getter, setter }: ITransferDocumentContext = useTransferDocumentContext();
  const { context, selectedTarget, personalData } = getter;
  const { setSelectedTarget, setDestination } = setter;
  const { t } = useTranslation();
  const isTabletMatch = useTabletMatch();
  const isHideTitle = !isTabletMatch && searching;
  const isShowSelectedTarget = !isTabletMatch && selectedTarget._id;
  const { isEnableReskin } = useEnableWebReskin();

  const goBack = (): void => {
    setSelectedTarget({} as IOrganization);
    setDestination({} as Destination);
  };

  if (isEnableReskin) {
    return (
      <Styled.HeaderContainerReskin>
        <Styled.HeaderContentReskin>
          <Text type="headline" size="lg" color="var(--kiwi-colors-surface-on-surface)">
            {t(context.title)}
          </Text>
          {context.isCopyModal && (
            <PlainTooltip content={t('modalMakeACopy.toolTipHeader')} w={210}>
              <KiwiIcomoon type="info-circle-lg" size="lg" />
            </PlainTooltip>
          )}
        </Styled.HeaderContentReskin>
        {selectedTarget._id && <SearchGroup setSearching={setSearching} isEnableReskin={isEnableReskin} />}
      </Styled.HeaderContainerReskin>
    );
  }

  return (
    <Styled.HeaderContainer>
      <Styled.Header>
        {!isHideTitle &&
          (isShowSelectedTarget ? (
            <Styled.TargetWrapper>
              {(context.isCopyModal || personalData.isOldProfessional) && (
                <Styled.Back onClick={goBack}>
                  <Icomoon className="arrow-left" size={16} color={Colors.NEUTRAL_80} />
                </Styled.Back>
              )}
              <Styled.TextWrapper>
                <Styled.Action>{t(context.action)}</Styled.Action>
                <Styled.Target>{selectedTarget.name}</Styled.Target>
              </Styled.TextWrapper>
            </Styled.TargetWrapper>
          ) : (
            <Styled.HeaderContent>
              <Styled.HeaderText>{t(context.title)}</Styled.HeaderText>
              {context.isCopyModal && (
                /* @ts-ignore */
                <Tooltip title={t('modalMakeACopy.toolTipHeader')} placement="bottom-start">
                  {/* @ts-ignore */}
                  <Icomoon className="info" size={18} color={Colors.NEUTRAL_60} />
                </Tooltip>
              )}
            </Styled.HeaderContent>
          ))}
        {selectedTarget._id && <SearchGroup setSearching={setSearching} />}
      </Styled.Header>
    </Styled.HeaderContainer>
  );
};

export default Header;
