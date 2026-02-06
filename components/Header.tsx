
import React from 'react';
import { ViewState } from '../types';

interface HeaderProps {
  view: ViewState;
  setView: (view: ViewState) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ view, setView, isAdmin, setIsAdmin }) => {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40 backdrop-blur-md bg-white/90 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer group" 
          onClick={() => setView('catalog')}
        >
          <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 00-1.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight group-hover:text-amber-800 transition-colors">MoveOut</h1>
        </div>

        <nav className="flex items-center space-x-2 md:space-x-4">
          <button 
            onClick={() => setView('catalog')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${view === 'catalog' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'text-stone-500 hover:bg-stone-50'}`}
          >
            Catalog
          </button>
          
          <button 
            onClick={() => {
              setIsAdmin(true);
              setView('admin');
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${view === 'admin' || view === 'add' || view === 'edit' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'text-stone-500 hover:bg-stone-50'}`}
          >
            Manage
          </button>

          {isAdmin && (
            <div className="h-6 w-px bg-stone-200 mx-1 hidden sm:block"></div>
          )}

          {isAdmin && (
            <button 
              onClick={() => {
                if (window.confirm("Exit manager mode?")) {
                  setIsAdmin(false);
                  setView('catalog');
                }
              }}
              className="flex items-center space-x-1.5 text-stone-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
              title="Logout Admin"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-tighter hidden sm:inline">Logout</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
