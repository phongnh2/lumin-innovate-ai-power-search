import { useEffect, useState } from 'react';

const useGetTopBannerHeight = (bannerId: string) => {
  const [topBannerHeight, setTopBannerHeight] = useState(0);

  useEffect(() => {
    const banner = document.getElementById(bannerId) as HTMLElement;
    const resizeObserver = new ResizeObserver(entries => {
      setTopBannerHeight((entries?.[0].target as unknown as HTMLElement)?.offsetHeight);
    });

    if (banner) {
      resizeObserver.observe(banner);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [bannerId]);

  return { topBannerHeight };
};

export default useGetTopBannerHeight;
