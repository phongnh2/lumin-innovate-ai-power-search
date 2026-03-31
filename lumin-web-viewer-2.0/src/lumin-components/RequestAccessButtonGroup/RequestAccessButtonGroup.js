import { Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import { ButtonColor, ButtonSize } from 'lumin-components/ButtonMaterial';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { Colors } from 'constants/styles';

import * as Styled from './RequestAccessButtonGroup.styled';

import styles from './RequestAccessButtonGroup.module.scss';

const RequestAccessButtonGroup = (props) => {
  const { loading, handleReject, handleAccept } = props;
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  if (isEnableReskin) {
    return (
      <div className={styles.container}>
        <Button
          colorType="error"
          variant="text"
          size="md"
          disabled={loading}
          onClick={handleReject}
          data-cy="reject_button"
        >
          {t('common.reject')}
        </Button>
        <Button
          colorType="info"
          variant="text"
          size="md"
          disabled={loading}
          onClick={handleAccept}
          data-cy="accept_button"
        >
          {t('common.accept')}
        </Button>
      </div>
    );
  }

  return (
    <Styled.Container>
      <Styled.ButtonRequest
        size={ButtonSize.XXS}
        color={ButtonColor.HYPERLINK}
        disabled={loading}
        onClick={handleReject}
        labelColor={Colors.SECONDARY_50}
        $reject
      >
        {t('common.reject')}
      </Styled.ButtonRequest>
      <Styled.ButtonRequest
        size={ButtonSize.XXS}
        color={ButtonColor.HYPERLINK}
        disabled={loading}
        onClick={handleAccept}
        labelColor={Colors.SUCCESS_60}
      >
        {t('common.accept')}
      </Styled.ButtonRequest>
    </Styled.Container>
  );
};

RequestAccessButtonGroup.propTypes = {
  loading: PropTypes.bool,
  handleAccept: PropTypes.func.isRequired,
  handleReject: PropTypes.func.isRequired,
};

RequestAccessButtonGroup.defaultProps = {
  loading: false,
};

export default RequestAccessButtonGroup;
