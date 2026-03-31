import PropTypes from 'prop-types';
import React from 'react';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';

import { useTabletMatch, useTranslation } from 'hooks';

import InfoModalSkeleton from './components/InfoModalSkeleton';
import { useGetFieldModal } from './hooks/useGetFieldModal';

import * as Styled from './InfoModal.styled';

const InfoModal = ({
  closeDialog,
  currentTarget,
  modalType,
  onErrorCallback,
}) => {
  const { t } = useTranslation();
  const isTabletUp = useTabletMatch();
  const { modalFields, isLoading } = useGetFieldModal({
    modalType, currentTarget, onErrorCallback,
  });

  const renderRow = () => (
    modalFields.data?.map((section, index) => {
      const isLastSection = modalFields.data && index === modalFields.data.length - 1;
      return (
        <React.Fragment key={index}>
          <Styled.RowWrapper>
            {section.map((item, i) => (
              <Styled.RowContainer key={i}>
                <Styled.RowItem>
                  <Styled.FieldTitle>
                    {item.field}
                  </Styled.FieldTitle>
                </Styled.RowItem>
                <Styled.RowItem>
                  <Styled.FieldDesc>
                    {item.value}
                  </Styled.FieldDesc>
                </Styled.RowItem>
              </Styled.RowContainer>
            ))}
          </Styled.RowWrapper>
          {!isLastSection && <Styled.Divider />}
        </React.Fragment>
      );
    })
  );

  const renderContent = () => {
    if (isLoading) {
      return <InfoModalSkeleton />;
    }

    return (
      <>
        {renderRow()}
        <Styled.Button
          onClick={closeDialog}
          size={isTabletUp ? ButtonSize.XL : ButtonSize.MD}
        >
          {t('common.ok')}
        </Styled.Button>
      </>
    );
  };

  return (
    <>
      {modalFields.title && <Styled.Title>{modalFields.title}</Styled.Title>}
      {renderContent()}
    </>
  );
};

InfoModal.propTypes = {
  closeDialog: PropTypes.func.isRequired,
  onErrorCallback: PropTypes.func,
  modalType: PropTypes.string,
  currentTarget: PropTypes.object,
};

InfoModal.defaultProps = {
  modalType: '',
  currentTarget: {},
  onErrorCallback: undefined,
};

export default InfoModal;
