import React, { createContext, useContext, useState, useEffect } from 'react';
import { SavedFund } from '../types';
import { useAuth } from './AuthContext';
import { fundAPI } from '../services/api';

interface SavedFundsContextType {
  savedFunds: SavedFund[];
  saveFund: (fund: { schemeCode: number; schemeName: string }) => Promise<void>;
  removeFund: (schemeCode: number) => Promise<void>;
  isFundSaved: (schemeCode: number) => boolean;
  isLoading: boolean;
  error: string | null;
}

const SavedFundsContext = createContext<SavedFundsContextType | undefined>(undefined);

export const useSavedFunds = () => {
  const context = useContext(SavedFundsContext);
  if (context === undefined) {
    throw new Error('useSavedFunds must be used within a SavedFundsProvider');
  }
  return context;
};

export const SavedFundsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedFunds, setSavedFunds] = useState<SavedFund[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  // Fetch saved funds when user logs in
  useEffect(() => {
    const fetchSavedFunds = async () => {
      if (user && token) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fundAPI.getSavedFunds(token);
          if (response.success) {
            setSavedFunds(response.funds || []);
          } else {
            setError(response.message || 'Failed to fetch saved funds');
          }
        } catch (err: any) {
          const errorMsg = err.message || 'Failed to fetch saved funds';
          setError(errorMsg);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSavedFunds([]);
      }
    };

    fetchSavedFunds();
  }, [user, token]);

  const saveFund = async (fund: { schemeCode: number; schemeName: string }) => {
    if (!user || !token) return;
    
    if (isFundSaved(fund.schemeCode)) {
      throw new Error('Fund already exists in your portfolio');
    }
    
    setError(null);
    try {
      const response = await fundAPI.saveFund(token, fund);
      if (response.success) {
        const newSavedFund: SavedFund = {
          ...fund,
          savedAt: new Date().toISOString()
        };
        setSavedFunds(prev => [...prev, newSavedFund]);
      } else {
        throw new Error(response.message || 'Failed to save fund');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to save fund';
      if (errorMsg.toLowerCase().includes('already saved') || 
          errorMsg.toLowerCase().includes('already have') || 
          errorMsg.toLowerCase().includes('already in your portfolio') ||
          errorMsg.toLowerCase().includes('already exists')) {
        
        if (!isFundSaved(fund.schemeCode)) {
          const newSavedFund: SavedFund = {
            ...fund,
            savedAt: new Date().toISOString()
          };
          setSavedFunds(prev => [...prev, newSavedFund]);
        }
        throw new Error('Fund already exists in your portfolio');
      } else {
        // For other errors, set the error state
        setError(errorMsg);
        throw err;
      }
    }
  };

  const removeFund = async (schemeCode: number) => {
    if (!user || !token) return;
    
    setError(null);
    try {
      const response = await fundAPI.removeFund(token, schemeCode);
      if (response.success) {
        setSavedFunds(prev => prev.filter(fund => fund.schemeCode !== schemeCode));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove fund');
      throw err;
    }
  };

  const isFundSaved = (schemeCode: number) => {
    return savedFunds.some(fund => fund.schemeCode === schemeCode);
  };

  return (
    <SavedFundsContext.Provider value={{ 
      savedFunds, 
      saveFund, 
      removeFund, 
      isFundSaved, 
      isLoading, 
      error 
    }}>
      {children}
    </SavedFundsContext.Provider>
  );
};