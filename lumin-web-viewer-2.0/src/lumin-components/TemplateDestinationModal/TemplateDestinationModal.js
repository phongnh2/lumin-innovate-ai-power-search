import React from 'react';
import PropTypes from 'prop-types';

import TransferDocument from 'lumin-components/TransferDocument/TransferDocumentLibrary';
import { InputSize } from 'lumin-components/Shared/Input/types/InputSize';

import { useTranslation } from 'hooks';
import useGetDataDestinationModal from './hooks/useGetDataDestinationModal';

const TemplateDestinationModal = ({ setIsShowDestination, setTemplateDestination, initialResource }) => {
  const { t } = useTranslation();
  const {
    user,
    expandedList,
    getExpandedList,
    handleSubmitDestination,
    loading,
    breadcrumb,
    searchText,
    onSearch,
    value,
    setValue,
    textSearchPlaceholder,
    orgList,
  } = useGetDataDestinationModal({ setIsShowDestination, setTemplateDestination, initialResource });
  const hasOrgs = orgList.length > 0;

  const renderContent = () => (
    <TransferDocument.ExpandedListTemplate
      value={value.id}
      onChange={setValue}
      user={user[0]}
      expandedList={expandedList}
      onNavigate={getExpandedList}
      breadcrumb={breadcrumb}
      hideSearch
      hasExpandedList={hasOrgs}
    />
  );

  return (
    <TransferDocument.Container
      open
      onClose={() => setIsShowDestination(false)}
      initialSource=""
    >
      <TransferDocument.Header>
        {t('createBaseOnForm.chooseDestination')}
      </TransferDocument.Header>
      {hasOrgs && (
        <TransferDocument.SearchBar
          value={searchText}
          onChange={onSearch}
          placeholder={textSearchPlaceholder}
          autoFocus={false}
          size={InputSize.LARGE}
        />
      )}
      {loading ? <TransferDocument.CustomLoading /> : renderContent()}
      <TransferDocument.GroupButton
        onSubmit={handleSubmitDestination}
        onClose={() => setIsShowDestination(false)}
        submitStatus={{}}
        label={t('common.chose')}
        hasError={false}
      />
    </TransferDocument.Container>
  );
};

TemplateDestinationModal.propTypes = {
  setIsShowDestination: PropTypes.func,
  setTemplateDestination: PropTypes.func,
  initialResource: PropTypes.object,
};
TemplateDestinationModal.defaultProps = {
  setIsShowDestination: () => {},
  setTemplateDestination: () => {},
  initialResource: {},
};

export default TemplateDestinationModal;
