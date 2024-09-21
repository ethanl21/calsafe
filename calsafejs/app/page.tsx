// app/page.tsx

'use client';

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

const Home = () => {
  return (
    <div>
      <h1>CalSafe</h1>
      <Map />
    </div>
  );
};

export default Home;
