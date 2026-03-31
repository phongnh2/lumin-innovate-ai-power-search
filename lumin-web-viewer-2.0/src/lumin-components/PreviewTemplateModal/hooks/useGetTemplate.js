import { useEffect, useState } from 'react';
import { useHandleErrorTemplate } from 'hooks';
import { templateServices } from 'services';

const useGetTemplate = (templateId,
  {
    increaseView = false,
    onFetchSuccess,
    getTemplates,
  } = {}) => {
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState(null);
  const [error, setError] = useState('');

  const updateTemplate = (newTemplateData) => {
    setTemplate(newTemplateData);
    if (onFetchSuccess) {
      onFetchSuccess(newTemplateData);
    }
    setLoading(false);
  };

  useHandleErrorTemplate({ error, onConfirm: getTemplates });

  useEffect(() => {
    templateServices
      .getTemplateById(templateId, { withSignedUrl: true, increaseView })
      .then(({ signedUrl, ...rest }) => updateTemplate({ ...rest, loadResource: signedUrl }))
      .catch((_error) => {
        setError(_error);
      });
  }, [templateId]);

  return {
    template,
    loading,
    error,
  };
};

export default useGetTemplate;
