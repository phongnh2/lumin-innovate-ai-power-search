import Link from 'next/link';
import { Trans } from 'next-i18next';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { environment } from '@/configs/environment';
import { TSignUpSchema } from '@/lib/yup';
import { CheckboxWithLabel, Text } from '@/ui';
import { getFullPathWithLanguageFromUrl } from '@/utils/getLanguage';

type TProps = {
  register: UseFormReturn<TSignUpSchema>['register'];
  dataAttribute?: Record<string, string>;
};

function AcceptTerms({ register, dataAttribute }: TProps) {
  const [urls, setUrls] = useState({ terms: '', policy: '' });
  useEffect(() => {
    const baseUrl = environment.public.host.staticUrl;
    setUrls({
      terms: baseUrl + getFullPathWithLanguageFromUrl('/terms-of-use'),
      policy: baseUrl + getFullPathWithLanguageFromUrl('/privacy-policy')
    });
  }, []);

  return (
    <CheckboxWithLabel
      {...register('terms')}
      dataAttribute={dataAttribute}
      label={
        <Trans
          i18nKey='authPage.acceptAllTermsAndConditions'
          components={{
            b: <Text bold underline as={Link} tabIndex={-1} href={urls.terms} target='_blank' rel='noreferrer' />,
            a: <Text bold underline as={Link} tabIndex={-1} href={urls.policy} target='_blank' rel='noreferrer' />
          }}
        />
      }
    />
  );
}

export default AcceptTerms;
