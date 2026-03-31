import Grid from '@mui/material/Grid';
import { Text, Textarea } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import { useEnableWebReskin, useTranslation } from 'hooks';

import './AddMessage.scss';

const propTypes = {
  shareMessage: PropTypes.string,
  setShareMessage: PropTypes.func,
  classNames: PropTypes.string,
};

const defaultProps = {
  shareMessage: '',
  setShareMessage: () => {},
  classNames: '',
};

const AddMessage = (props) => {
  const { shareMessage, setShareMessage, classNames } = props;
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  if (isEnableReskin) {
    return (
      <div className={`AddMessageReskin__wrapper ${classNames}`}>
        <div className="AddMessageReskin__header">
          <Text type="label" size="sm" component="label" color="var(--kiwi-colors-surface-on-surface)">
            {t('modalShare.addMessage')}{' '}
            <Text type="body" size="sm" component="span" color="var(--kiwi-colors-surface-on-surface-low)">
              ({t('common.optional')})
            </Text>
          </Text>
          <Text type="body" size="sm" component="label" color="var(--kiwi-colors-surface-on-surface-variant)">
            {`${shareMessage.length}/3000`}
          </Text>
        </div>
        <Textarea
          className="AddMessageReskin__textarea"
          placeholder={t('modalShare.yourTextHere')}
          maxLength={3000}
          cols={6}
          rows={6}
          onChange={(e) => setShareMessage(e.target.value)}
          value={shareMessage}
        />
      </div>
    );
  }

  return (
    <div className={`AddMessage__wrapper ${classNames}`}>
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item className="AddMessage__title">
          {t('modalShare.addMessage')} <span className="AddMessage__optionalText">({t('common.optional')})</span>
        </Grid>
        <Grid item className="AddMessage__counting">
          {`${shareMessage.length}/3000`}
        </Grid>
      </Grid>
      <textarea
        className="AddMessage__textarea"
        placeholder={t('modalShare.yourTextHere')}
        maxLength={3000}
        cols={6}
        rows={6}
        onChange={(e) => setShareMessage(e.target.value)}
        value={shareMessage}
      />
    </div>
  );
};

AddMessage.propTypes = propTypes;
AddMessage.defaultProps = defaultProps;

export default AddMessage;
