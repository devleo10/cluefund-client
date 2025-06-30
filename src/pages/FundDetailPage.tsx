import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Building2, 
  Bookmark,
  BookmarkCheck,
  AlertCircle
} from 'lucide-react';
import { MutualFund, MutualFundDetail } from '../types';
import { getMutualFundDetails } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSavedFunds } from '../context/SavedFundsContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const FundDetailPage: React.FC = () => {
  const { schemeCode } = useParams<{ schemeCode: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFundSaved, saveFund, removeFund } = useSavedFunds();

  const [fundDetail, setFundDetail] = useState<MutualFundDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Get fund basic info from navigation state or create from scheme code
  const fundInfo: MutualFund = location.state?.fund || {
    schemeCode: parseInt(schemeCode || '0'),
    schemeName: 'Loading...'
  };

  const isBookmarked = isFundSaved(fundInfo.schemeCode);

  useEffect(() => {
    const fetchFundDetails = async () => {
      if (!schemeCode) return;

      setIsLoading(true);
      setError(null);

      try {
        const details = await getMutualFundDetails(parseInt(schemeCode));
        setFundDetail(details);
      } catch (err) {
        setError('Failed to load fund details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFundDetails();
  }, [schemeCode]);

  const handleSave = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (isSaving) return;

    setIsSaving(true);
    try {
      if (isBookmarked) {
        await removeFund(fundInfo.schemeCode);
      } else {
        const fundToSave = fundDetail 
          ? { schemeCode: fundDetail.meta.scheme_code, schemeName: fundDetail.meta.scheme_name }
          : fundInfo;
        await saveFund(fundToSave);
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setIsSaving(false);
    }
  };

  const calculateReturns = (data: Array<{ date: string; nav: string }>) => {
    if (data.length < 2) return null;

    const latest = parseFloat(data[0].nav);
    const previous = parseFloat(data[1].nav);
    const change = latest - previous;
    const changePercent = (change / previous) * 100;

    return {
      change,
      changePercent,
      isPositive: change >= 0
    };
  };

  // Helper to parse DD-MM-YYYY to Date
  function parseDMY(dateStr: string) {
    if (!dateStr) return new Date('');
    const [day, month, year] = dateStr.split('-');
    return new Date(`${year}-${month}-${day}`);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner size="lg" text="Loading fund details..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <ErrorMessage message={error} onRetry={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  if (!fundDetail) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage message="Fund details not found" />
        </div>
      </div>
    );
  }

  const returns = calculateReturns(fundDetail.data);
  const latestNav = fundDetail.data[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </button>

        {/* Fund Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-start mb-4">
                <div className="bg-blue-50 p-3 rounded-lg mr-4">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
                    {fundDetail.meta.scheme_name}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-1" />
                      {fundDetail.meta.fund_house}
                    </div>
                    <div>Code: {fundDetail.meta.scheme_code}</div>
                    <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {fundDetail.meta.scheme_category}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                  isBookmarked
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                ) : isBookmarked ? (
                  <BookmarkCheck className="h-5 w-5 mr-2" />
                ) : (
                  <Bookmark className="h-5 w-5 mr-2" />
                )}
                {isSaving ? 'Saving...' : isBookmarked ? 'Saved' : 'Save Fund'}
              </button>
            </div>
          </div>
        </div>

        {/* NAV Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-medium text-slate-600 mb-2">Current NAV</h3>
            <div className="text-3xl font-bold text-slate-900">
              ₹{parseFloat(latestNav.nav).toFixed(2)}
            </div>
            <div className="flex items-center mt-2 text-sm text-slate-500">
              <Calendar className="h-4 w-4 mr-1" />
              {parseDMY(latestNav.date) && !isNaN(parseDMY(latestNav.date).getTime())
                ? parseDMY(latestNav.date).toLocaleDateString('en-IN')
                : 'N/A'}
            </div>
          </div>

          {returns && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-medium text-slate-600 mb-2">Daily Change</h3>
              <div className={`text-3xl font-bold ${returns.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {returns.isPositive ? '+' : ''}₹{returns.change.toFixed(2)}
              </div>
              <div className={`flex items-center mt-2 text-sm ${returns.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {returns.isPositive ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {returns.changePercent.toFixed(2)}%
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-medium text-slate-600 mb-2">Fund Type</h3>
            <div className="text-lg font-semibold text-slate-900 mb-2">
              {fundDetail.meta.scheme_type}
            </div>
            <div className="text-sm text-slate-600">
              {fundDetail.meta.scheme_category}
            </div>
          </div>
        </div>

        {/* NAV History */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">NAV History</h2>
          
          {!user && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <p className="text-blue-800 font-medium">Sign in to save this fund</p>
                <p className="text-blue-600 text-sm mt-1">
                  Create an account to bookmark funds and track your portfolio
                </p>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Date</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600">NAV (₹)</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600">Change</th>
                </tr>
              </thead>
              <tbody>
                {fundDetail.data.slice(0, 30).map((item, index) => {
                  const prevItem = fundDetail.data[index + 1];
                  const change = prevItem ? parseFloat(item.nav) - parseFloat(prevItem.nav) : 0;
                  const changePercent = prevItem ? (change / parseFloat(prevItem.nav)) * 100 : 0;
                  
                  return (
                    <tr key={item.date} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-900">
                        {parseDMY(item.date) && !isNaN(parseDMY(item.date).getTime())
                          ? parseDMY(item.date).toLocaleDateString('en-IN')
                          : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-900">
                        ₹{parseFloat(item.nav).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {prevItem ? (
                          <span className={`flex items-center justify-end ${
                            change >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {change >= 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {change >= 0 ? '+' : ''}₹{change.toFixed(2)} ({changePercent.toFixed(2)}%)
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundDetailPage;