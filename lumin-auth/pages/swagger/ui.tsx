import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'swagger-ui-react/swagger-ui.css';

// Dynamically import SwaggerUI with SSR disabled
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function Swagger() {
  const [spec, setSpec] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    async function fetchSpec() {
      try {
        const response = await fetch('/api/swagger');
        const data = await response.json();
        setSpec(data);
      } catch (error) {
        console.error('Failed to fetch Swagger spec:', error);
      }
    }

    fetchSpec();
  }, []);

  if (!spec) {
    return <div>Loading API documentation...</div>;
  }

  return (
    <div className='swagger-container'>
      <SwaggerUI spec={spec} />
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .swagger-container {
            margin: 0;
            padding: 0;
            height: 100vh;
            width: 100%;
          }
          .swagger-ui .info .title {
            color: #3b4151;
          }
        `
        }}
      />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  if (process.env.NODE_ENV !== 'development') {
    return {
      notFound: true
    };
  }

  return {
    props: {}
  };
};
