import { Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { connect, useDispatch } from 'react-redux';

import PopoverHover from 'ui/PopoverHover';

import actions from 'actions';
import selectors from 'selectors';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';
import SvgElement from 'lumin-components/SvgElement';

import { useTranslation } from 'hooks';
import useDocumentTools from 'hooks/useDocumentTools';

import { toggleAutoSync, isOversizeToAutoSync } from 'helpers/autoSync';

import { DocumentCategory } from 'utils/Factory/DocumentCategory';

import { AUTO_SYNC_STATUS } from 'constants/autoSyncConstant';
import { STORAGE_TYPE } from 'constants/lumin-common';

import { getAutoSyncStatusInfo } from './utils';
import * as Styled from '../TitleBarRightSection.styled';

import styles from './LuminAutoSyncStatus.module.scss';

const LuminAutoSyncStatus = (props) => {
  const { autoSyncStatus, currentDocument } = props;
  const dispatch = useDispatch();
  const isSyncingIcon = autoSyncStatus === AUTO_SYNC_STATUS.SYNCING;
  const { handleDocStackForSyncExternalFile } = useDocumentTools();

  const { t } = useTranslation();
  const turnOnAutoSync = async () => {
    await handleDocStackForSyncExternalFile({
      callback: () => {
        toggleAutoSync(currentDocument._id, true);
        dispatch(actions.updateCurrentDocument({ enableGoogleSync: true }));
      },
      storage: STORAGE_TYPE.GOOGLE,
    });
  };

  const getDetail = (status) => {
    const buttonText = {
      [AUTO_SYNC_STATUS.NOT_SYNCED]: t('action.turnOnAutoSync'),
      [AUTO_SYNC_STATUS.FAILED]: t('viewer.tryAgain'),
    };
    return status in buttonText ? (
      <Button variant="tonal" onClick={turnOnAutoSync}>
        {buttonText[status]}
      </Button>
    ) : null;
  };
  const detail = getDetail(autoSyncStatus);

  const renderAutoSyncIcon = () => {
    const info = getAutoSyncStatusInfo({ t, autoSyncStatus, detail, currentDocument });
    if (
      !info ||
      isOversizeToAutoSync(currentDocument.size) ||
      !DocumentCategory.isGoogleDriveDocument({ type: currentDocument.service })
    ) {
      return null;
    }
    return (
      <PopoverHover
        width={260}
        position="bottom"
        radius="sm"
        closeDelay={1000}
        renderTarget={() => (
          <IconButton
            size="large"
            component={
              <Styled.ButtonWrapper>
                <SvgElement content="google" width={24} height={24} />
                <Styled.IconAutoSyncStatus
                  content={info.iconContent}
                  width={12}
                  height={12}
                  $hasRotateEffect={isSyncingIcon}
                />
              </Styled.ButtonWrapper>
            }
          />
        )}
        classNames={{
          dropdown: styles.dropdown,
        }}
        closeOnEscape
        closeOnClickOutside
        renderContent={() => (
          <div className={styles.popoverContainer}>
            {info.title && <h3 className={styles.popoverTitle}>{info.title}</h3>}
            {info.content && <div className={styles.popoverContent}>{info.content}</div>}
            {info.detail && <div className={styles.popoverDetail}>{info.detail}</div>}
          </div>
        )}
      />
    );
  };

  return renderAutoSyncIcon();
};

const mapStateToProps = (state) => ({
  autoSyncStatus: selectors.getAutoSyncStatus(state),
  currentDocument: selectors.getCurrentDocument(state),
});

LuminAutoSyncStatus.propTypes = {
  autoSyncStatus: PropTypes.oneOf(['', ...Object.values(AUTO_SYNC_STATUS)]),
  currentDocument: PropTypes.object,
};

LuminAutoSyncStatus.defaultProps = {
  autoSyncStatus: '',
  currentDocument: {},
};

export default connect(mapStateToProps)(LuminAutoSyncStatus);
