import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FundCard from '../components/FundCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { MutualFund } from '../types';
import { searchMutualFunds } from '../services/api';
import { Search, TrendingUp } from 'lucide-react';

const HomePage: React.FC = () => {
  const [searchResults, setSearchResults] = useState<MutualFund[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await searchMutualFunds(query);
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search mutual funds. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFundClick = (fund: MutualFund) => {
    navigate(`/fund/${fund.schemeCode}`, { state: { fund } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-emerald-200">
                Mutual Fund
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Search, analyze, and track mutual funds with real-time data and intelligent insights
            </p>
            <div className="mb-8 flex justify-center">
              <div className="w-full max-w-xl">
                <SearchBar onSearch={handleSearch} isLoading={isLoading} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 mt-4">
        {isLoading && <LoadingSpinner size="lg" text="Searching mutual funds..." />}
        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={() => handleSearch('')} 
          />
        )}
        {!isLoading && !error && hasSearched && searchResults.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No funds found</h3>
            <p className="text-slate-500">Try searching with different keywords</p>
          </div>
        )}
        {!isLoading && !error && searchResults.length > 0 && (
          <div className="bg-white/90 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">
                Search Results ({searchResults.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((fund) => (
                <FundCard
                  key={fund.schemeCode}
                  fund={fund}
                  onClick={() => handleFundClick(fund)}
                />
              ))}
            </div>
          </div>
        )}
        {!hasSearched && !isLoading && (
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">Start Your Search</h3>
            <p className="text-slate-500">Enter a mutual fund name in the search bar above</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;