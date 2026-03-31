import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import Icomoon from 'lumin-components/Icomoon';
import Tooltip from 'lumin-components/Shared/Tooltip';
import { DocumentContext } from 'luminComponents/Document/context';
import { DocumentListContext } from 'luminComponents/DocumentList/Context';

import { useGetFolderType, useTranslation } from 'hooks';

import { MultipleDownLoadButton } from 'features/MultipleDownLoad';

import { folderType } from 'constants/documentConstants';
import { Colors } from 'constants/styles';

import MoveDocumentsButton from './MoveDocumentsButton';

import {
  StyledWrapper,
  StyledText,
  StyledDivider,
  StyledCheckBox,
  StyledButtonWrapper,
  StyledButton,
  StyledTextButton,
  StyledCancelSelection,
} from './HeaderBarSection.styled';

const propTypes = {
  totalSelectDoc: PropTypes.number,
  totalDoc: PropTypes.number,
  currentTotalDoc: PropTypes.number,
  isChecked: PropTypes.bool,
  onMove: PropTypes.func,
  onRemove: PropTypes.func,
  isDisabled: PropTypes.bool,
  isDisplay: PropTypes.bool.isRequired,
  onChangeCheckbox: PropTypes.func,
  onCancelSelectMode: PropTypes.func,
};

const defaultProps = {
  totalSelectDoc: 0,
  totalDoc: 0,
  currentTotalDoc: 0,
  isChecked: false,
  isDisabled: false,
  onMove: () => {},
  onRemove: () => {},
  onChangeCheckbox: () => {},
  onCancelSelectMode: () => {},
};

const HeaderBarSection = ({
  isDisplay,
  totalSelectDoc,
  totalDoc,
  currentTotalDoc,
  isChecked,
  onRemove,
  onMove,
  isDisabled,
  onChangeCheckbox,
  onCancelSelectMode,
}) => {
  const { t } = useTranslation();
  const currentFolderType = useGetFolderType();
  const isOffline = useSelector(selectors.isOffline);
  const { selectedDocList } = useContext(DocumentContext);
  const { onMoveDocumentsDecorator, onHandleDocumentOvertimeLimit } = useContext(DocumentListContext);

  const isInSharedTab = currentFolderType === folderType.SHARED;
  const isDeviceTab = currentFolderType === folderType.DEVICE;
  const getButtonIcon = (icon) => (
    <Icomoon size={16} className={icon} color={isDisabled ? Colors.NEUTRAL_40 : Colors.NEUTRAL_100} />
  );

  const isIndeterminateState = totalSelectDoc > 0 && totalSelectDoc < currentTotalDoc;

  const handleHeaderAction = ({ actionHandler, decoratorHandler }) => {
    const documentLimited = selectedDocList.find((doc) => doc.isOverTimeLimit);
    if (documentLimited) {
      onHandleDocumentOvertimeLimit(documentLimited);
      return;
    }

    decoratorHandler(selectedDocList, actionHandler);
  };

  return (
    <StyledWrapper $isDisplay={isDisplay}>
      <StyledCheckBox
        checked={isChecked}
        type="checkbox"
        indeterminate={isIndeterminateState}
        onChange={onChangeCheckbox}
        disableRipple
      />
      <StyledText>{t('common.textSelected', { totalSelectDoc, totalDoc })}</StyledText>
      <StyledDivider />
      <StyledButtonWrapper>
        <MultipleDownLoadButton />
        {!isInSharedTab && !isDeviceTab && (
          <MoveDocumentsButton
            isDisabled={isDisabled}
            onMoveDocuments={() =>
              handleHeaderAction({ actionHandler: onMove, decoratorHandler: onMoveDocumentsDecorator })
            }
          />
        )}
        <Tooltip title={isDisabled && !isOffline && t('documentPage.adminCanPerform')} placement="top">
          <span>
            <StyledButton size={ButtonSize.XS} color={ButtonColor.TERTIARY} disabled={isDisabled} onClick={onRemove}>
              {getButtonIcon('trash')}
              <StyledTextButton>{isInSharedTab ? t('common.remove') : t('common.delete')}</StyledTextButton>
            </StyledButton>
          </span>
        </Tooltip>
      </StyledButtonWrapper>
      <StyledCancelSelection onClick={onCancelSelectMode}>{t('common.cancel')}</StyledCancelSelection>
    </StyledWrapper>
  );
};

HeaderBarSection.propTypes = propTypes;
HeaderBarSection.defaultProps = defaultProps;

export default HeaderBarSection;
