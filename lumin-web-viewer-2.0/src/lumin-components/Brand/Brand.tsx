/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';

import { useTranslation } from 'hooks';
import { BrandList } from './constants/brandList';
import * as Styled from './Brand.styled';

const Brand = (): JSX.Element => {
  const { t } = useTranslation();
  return (
    <Styled.Container>
      <Styled.Wrapper>
        <Styled.Title>{t('plan.brand.title')}</Styled.Title>
        <Styled.List>
          {BrandList.map((item, index) => (
            <Styled.Item key={index}>
              <Styled.ItemImg $sizes={item.sizes} src={item.icon} alt={item.alt} />
            </Styled.Item>
          ))}
        </Styled.List>
      </Styled.Wrapper>
    </Styled.Container>
  );
};

export default Brand;
