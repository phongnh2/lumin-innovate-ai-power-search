import React, { useMemo, useState } from 'react';

import { useSetupCoreWorker, useDropboxMessageEvent } from 'hooks';
import TemplateList from 'lumin-components/TemplateList';
import withTemplateTitle from 'HOC/withTemplateTitle';

import useGetTemplates from './hooks/useGetTemplates';
import TemplateContext from './context';

function Templates() {
  const [searchText, setSearchText] = useState('');
  const [focusing, setFocusing] = useState(false);
  const [uploadedTemplate, setUploadedTemplate] = useState();
  const {
    pagination, templates, loading, onListChanged, getTemplates,
  } = useGetTemplates({ searchText });

  const context = useMemo(() => ({
    getTemplates,
    setSearchText,
    searchText,
    openSearchView: focusing && !searchText,
    setFocusing,
    focusing,
    uploadedTemplate,
    setUploadedTemplate,
  }), [focusing, searchText, uploadedTemplate]);

  useSetupCoreWorker();
  useDropboxMessageEvent();

  return (
    <TemplateContext.Provider value={context}>
      <TemplateList
        templates={templates}
        loading={loading}
        pagination={pagination}
        onListChanged={onListChanged}
      />
    </TemplateContext.Provider>
  );
}

export default withTemplateTitle(Templates);
