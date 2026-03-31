/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Button, Icomoon } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';

import Divider from '@new-ui/general-components/Divider';
import PlainTooltip from '@new-ui/general-components/Tooltip/PlainTooltip';

import actions from 'actions';
import { AppDispatch } from 'store';

import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { OutlineEvent } from 'features/Outline/types';

import * as Styled from './OutlineBottom.styled';

interface IOutlineBottomProps {
  canModifyOutline: boolean;
  setOutlineEvent: (outlineEvent: OutlineEvent) => void;
}

const OutlineBottom = (props: IOutlineBottomProps): JSX.Element => {
  const { canModifyOutline, setOutlineEvent } = props;
  const { t } = useTranslation();

  const handleAddClick = () => {
    setOutlineEvent(OutlineEvent.ADD);
  };

  if (!canModifyOutline) {
    return null;
  }

  return (
    <Styled.OutlineBottomContainer>
      <Divider />
      <Styled.OutlineBottomWrapper>
        <PlainTooltip title={t('outlines.tooltip.add')} location="top-end">
          <Button
            data-lumin-btn-name={ButtonName.ADD_OUTLINE}
            data-lumin-btn-purpose={ButtonPurpose.ADD_OUTLINE_FROM_BOTTOM_BUTTON}
            onClick={handleAddClick}
            startIcon={<Icomoon type="ph-plus" />}
            size="md"
            variant='text'
            style={{ width: '100%' }}
          >
            {t('outlines.actions.add')}
          </Button>
        </PlainTooltip>
      </Styled.OutlineBottomWrapper>
    </Styled.OutlineBottomContainer>
  );
};

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  setOutlineEvent: (data: string) => dispatch(actions.setOutlineEvent(data) as AnyAction),
});

export default connect(mapStateToProps, mapDispatchToProps)(OutlineBottom);
