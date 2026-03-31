import { useEffect } from 'react';

import { fetchAndStoreUserLocation } from '@/lib/userLocation';

const useFetchUserLocation = () => {
  useEffect(() => {
    fetchAndStoreUserLocation();
  }, []);
};

export default useFetchUserLocation;
