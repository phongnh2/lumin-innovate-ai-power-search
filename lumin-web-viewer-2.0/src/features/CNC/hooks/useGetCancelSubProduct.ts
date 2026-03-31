import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';

import { useUrlSearchParams } from 'hooks';

import { UnifySubscriptionProduct } from 'constants/organization.enum';
import { Routers } from 'constants/Routers';
import { CancelSubscriptionProduct, UrlSearchParam } from 'constants/UrlSearchParam';

const MapSubscriptionProduct = {
  [CancelSubscriptionProduct.SIGN]: UnifySubscriptionProduct.SIGN,
  [CancelSubscriptionProduct.PDF]: UnifySubscriptionProduct.PDF,
};

const useGetCancelSubProduct = () => {
  const navigate = useNavigate();
  const searchParams = useUrlSearchParams();
  const product = searchParams.get(UrlSearchParam.CANCEL_SUBSCRIPTION_PRODUCT) || '';
  const productList = product.split(',');
  const isSign = productList.find((item) => item === CancelSubscriptionProduct.SIGN);
  const isPdf = productList.find((item) => item === CancelSubscriptionProduct.PDF);
  const isSignAndPdf = isSign && isPdf;

  const subscriptionItems = useMemo(
    () => productList.map((item) => ({ productName: MapSubscriptionProduct[item] })),
    [productList]
  );

  useEffect(() => {
    if (!product) {
      navigate(Routers.NOT_FOUND, { replace: true });
    }
  }, [product]);

  return {
    productList,
    isSign,
    isPdf,
    isSignAndPdf,
    cancelUnifySubscriptionItems: subscriptionItems,
  };
};

export default useGetCancelSubProduct;
