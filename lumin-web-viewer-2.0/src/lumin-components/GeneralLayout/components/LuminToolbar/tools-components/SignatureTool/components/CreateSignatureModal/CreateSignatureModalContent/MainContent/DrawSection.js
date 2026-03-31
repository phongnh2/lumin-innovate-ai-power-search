/* eslint-disable import/no-cycle */
/* eslint-disable arrow-body-style */
import React, { useContext } from 'react';

import Icomoon from 'lumin-components/Icomoon';

import { useTranslation } from 'hooks';

import { CreateSignatureModalContentContext } from './CreateSignatureModalContentContext';
import { SIGNATURE_TYPE } from './MainContent';

import * as Styled from './MainContent.styled';

const DrawSection = () => {
  const { t } = useTranslation();
  const { selectedSignatureType, isStartDrawSignature } = useContext(CreateSignatureModalContentContext);

  return (
    <Styled.DrawingSection>
      {selectedSignatureType === SIGNATURE_TYPE.DRAW && (
        <Styled.Placeholder>
          {!isStartDrawSignature && (
            <>
              <Icomoon className="md_pen" size={24} />
              {t('viewer.signatureModal.drawYourSignatureHere')}
            </>
          )}
        </Styled.Placeholder>
      )}
    </Styled.DrawingSection>
  );
};

export default DrawSection;
