import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Trash2, Search, AlertCircle } from 'lucide-react';
import { useSavedFunds } from '../context/SavedFundsContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const SavedFundsPage: React.FC = () => {
  const { savedFunds, removeFund, isLoading, error } = useSavedFunds();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [removingFund, setRemovingFund] = useState<number | null>(null);

  const filteredFunds = savedFunds.filter(fund =>
    fund.schemeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFundClick = (fund: any) => {
    navigate(`/fund/${fund.schemeCode}`, { 
      state: { 
        fund: { 
          schemeCode: fund.schemeCode, 
          schemeName: fund.schemeName 
        } 
      } 
    });
  };

  const handleRemoveFund = async (schemeCode: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this fund from your saved list?')) {
      setRemovingFund(schemeCode);
      try {
        await removeFund(schemeCode);
        showToast('Mutual fund removed from portfolio', 'success');
      } catch (error) {
        showToast('Failed to remove fund', 'error');
      } finally {
        setRemovingFund(null);
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Please sign in</h2>
          <p className="text-slate-600 mb-6">You need to be logged in to view saved funds</p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner size="lg" text="Loading saved funds..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-blue-50 p-3 rounded-lg mr-4">
              <Bookmark className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Saved Funds</h1>
              <p className="text-slate-600">Your bookmarked mutual funds</p>
            </div>
          </div>

          {/* Search Bar */}
          {savedFunds.length > 0 && (
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search saved funds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {error && !error.toLowerCase().includes('already exists') && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error loading saved funds</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {savedFunds.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-slate-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Bookmark className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No saved funds yet</h3>
            <p className="text-slate-500 mb-6">Start by searching and saving your favorite mutual funds</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search Funds
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium  text-slate-600 mb-1">Total Saved</h3>
                  <div className="text-2xl font-bold text-slate-900">{savedFunds.length}</div>
                </div>
              </div>
            </div>

            {/* Funds List */}
            {filteredFunds.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No funds match your search</h3>
                <p className="text-slate-500">Try different keywords</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFunds.map((fund) => (
                  <div
                    key={fund.schemeCode}
                    onClick={() => handleFundClick(fund)}
                    className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {fund.schemeName}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">Code: {fund.schemeCode}</p>
                      </div>
                      
                      <button
                        onClick={(e) => handleRemoveFund(fund.schemeCode, e)}
                        disabled={removingFund === fund.schemeCode}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                        title="Remove from saved"
                      >
                        {removingFund === fund.schemeCode ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center">
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details →
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SavedFundsPage;