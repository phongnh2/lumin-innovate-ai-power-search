import React from 'react';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';

import Icomoon from 'lumin-components/Icomoon';
import Divider from 'luminComponents/GeneralLayout/general-components/Divider';

import RotateByPages from './component/RotateByPages';
import RotateByRange from './component/RotateByRange';

import * as Styled from './RotatePanel.styled';

const RotatePanel = () => (
  <Styled.Wrapper>
    <Styled.Desc as="p">
      <Trans
        i18nKey="viewer.leftPanelEditMode.descEditPanelRotate"
        components={{
          Icomoon: <Icomoon className="md_rotate_clockwise" />,
        }}
      >
        Click the rotate button <Icomoon className="md_rotate_clockwise" /> to rotate pages by 90°.
      </Trans>
    </Styled.Desc>

    <RotateByPages />

    <Styled.DividerWrapper>
      <Divider />
    </Styled.DividerWrapper>

    <RotateByRange />
  </Styled.Wrapper>
);

RotatePanel.propTypes = {};

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(RotatePanel);
