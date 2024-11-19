// pages/index.js

import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/recursos');
  }, [router]);

  return null;
};

export default Home;