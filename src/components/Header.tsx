import React from 'react';
import { TrendingUp, User, LogOut, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-2 rounded-lg mr-3">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Clue<span className="text-emerald-500">fund</span>
            </h1>
          </Link>

          {/* Navigation */}
          {user && (
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Search Funds
              </Link>
              <Link
                to="/saved"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/saved'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Saved Funds
              </Link>
            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden sm:flex items-center space-x-2">
                  <User className="h-5 w-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">{user.name}</span>
                </div>
                
                {/* Mobile Navigation */}
                <div className="md:hidden">
                  <Link
                    to="/saved"
                    className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <Bookmark className="h-5 w-5" />
                  </Link>
                </div>
                
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-emerald-600 transition-all"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;