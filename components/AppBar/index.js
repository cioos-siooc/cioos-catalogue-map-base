'use client'
import dynamic from 'next/dynamic';

const AppBar = dynamic(() => import('./AppBar'),
    {ssr: false}
);

export default AppBar;