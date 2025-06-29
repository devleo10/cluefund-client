import React, { useState, useEffect } from 'react';
import { TrendingUp, Bookmark, BookmarkCheck } from 'lucide-react';
import { MutualFund } from '../types';
import { useSavedFunds } from '../context/SavedFundsContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface FundCardProps {
  fund: MutualFund;
  onClick: () => void;
}

const FundCard: React.FC<FundCardProps> = ({ fund, onClick }) => {
  const { user } = useAuth();
  const { isFundSaved, saveFund, removeFund, savedFunds } = useSavedFunds();
  const { showToast } = useToast();
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(isFundSaved(Number(fund.schemeCode)));

  useEffect(() => {
    setIsBookmarked(isFundSaved(Number(fund.schemeCode)));
  }, [savedFunds, fund.schemeCode, isFundSaved]);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || isBookmarking) return;
    
    setIsBookmarking(true);
    try {
      if (isBookmarked) {
        await removeFund(Number(fund.schemeCode));
        showToast('Mutual fund removed from portfolio', 'success');
      } else {
        if (isFundSaved(Number(fund.schemeCode))) {
          showToast('Fund already exists in your portfolio', 'success');
          setIsBookmarked(true);
          setIsBookmarking(false);
          return;
        }
        
        await saveFund({
          schemeCode: Number(fund.schemeCode),
          schemeName: fund.schemeName
        });
        showToast('Mutual fund added to portfolio', 'success');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Something went wrong';
      if (errorMessage.toLowerCase().includes('already saved') || 
          errorMessage.toLowerCase().includes('already in your portfolio') || 
          errorMessage.toLowerCase().includes('already exists')) {
        showToast('Fund already exists in your portfolio', 'success');
        setIsBookmarked(true);
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-2">
            <div className="bg-blue-50 p-2 rounded-lg mr-3 group-hover:bg-blue-100 transition-colors">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                {fund.schemeName}
              </h3>
              <p className="text-sm text-slate-500">Code: {fund.schemeCode}</p>
            </div>
          </div>
        </div>
        
        {user && (
          <button
            onClick={handleBookmark}
            disabled={isBookmarking}
            className={`p-2 rounded-lg transition-all ${
              isBookmarked
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
            } ${isBookmarking ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isBookmarking ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            ) : isBookmarked ? (
              <BookmarkCheck className="h-5 w-5" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      
      <div className="mt-4 flex items-center text-sm text-slate-600">
        <span>Click to view details</span>
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          →
        </div>
      </div>
    </div>
  );
};

export default FundCard;