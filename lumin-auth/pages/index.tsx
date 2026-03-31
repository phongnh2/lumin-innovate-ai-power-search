import CustomHeader from '@/components/CustomHeader';
import { withTranslation } from '@/components/hoc/withTranslation';
import useTranslation from '@/hooks/useTranslation';
import { getServerSidePipe } from '@/pipe/getServerSidePipe';
export default function Home() {
  const { t } = useTranslation();
  return (
    <>
      <CustomHeader title={t('pageTitle.account')} />
      <div>Homepage</div>
    </>
  );
}

export const getServerSideProps = getServerSidePipe(withTranslation);
