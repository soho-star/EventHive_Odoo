import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Squares from '../UI/Squares';

const Layout = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Squares Background */}
      <div className="fixed inset-0 z-0">
        <Squares 
          speed={0.5} 
          squareSize={40}
          direction="diagonal"
          borderColor="rgba(255, 255, 255, 0.1)"
          hoverFillColor="rgba(255, 255, 255, 0.05)"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children || <Outlet />}
        </main>
        {!isHomePage && <Footer />}
      </div>
    </div>
  );
};

export default Layout;

