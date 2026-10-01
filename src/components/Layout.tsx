import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const Layout: React.FC = () => {
  return (
    <div className="app-container flex flex-col">
      <TopNav />
      <div className="main-wrapper flex flex-row flex-1 overflow-hidden">
        <Sidebar />
        <main className="main-content flex-1 overflow-y-auto relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none rounded-tl-2xl"></div>
          <div className="relative z-10 w-full max-w-[1600px] mx-auto min-h-full flex flex-col p-6 pb-24">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
