const BASE_URL = import.meta.env.VITE_BASE_URL;
const MF_API_URL = import.meta.env.VITE_MF_API_URL;

// Auth API calls
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', { email, password: '***' });
      console.log('API Base URL:', BASE_URL);
      const url = `${BASE_URL}/auth/login`;
      console.log('Full login URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      console.log('Login response status:', response.status);
      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        // If response is not JSON, log and throw a clearer error
        const text = await response.text();
        console.error('Login response not JSON:', text);
        throw new Error('Login failed: Invalid server response');
      }
      console.log('Login response data:', responseData);
      
      // Handle non-200 responses by throwing an error
      if (!response.ok) {
        // Extract the error message from the response
        const errorMessage = responseData.message || `HTTP error! status: ${response.status}`;
        console.error('Login error from server:', errorMessage);
        
        // If it's invalid credentials, make it very explicit
        if (response.status === 400 && 
            (errorMessage.includes('Invalid credentials') || 
             errorMessage.includes('invalid credentials'))) {
          console.error('Invalid credentials detected, throwing specific error');
          throw new Error('Invalid credentials - please check your email and password');
        }
        
        throw new Error(errorMessage);
      }
      
      return responseData;
    } catch (error) {
      console.error('Login error in API (caught):', error);
      // Re-throw to be handled by the AuthContext
      throw error;
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      console.log('Attempting registration with:', { name, email, password: '***' });
      const url = `${BASE_URL}/auth/register`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      console.log('Register response status:', response.status);
      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        // If response is not JSON, log and throw a clearer error
        const text = await response.text();
        console.error('Register response not JSON:', text);
        throw new Error('Registration failed: Invalid server response');
      }
      console.log('Register response data:', responseData);
      if (!response.ok) {
        // Extract the error message from the response
        const errorMessage = responseData.message || `HTTP error! status: ${response.status}`;
        console.error('Registration error from server:', errorMessage);
        throw new Error(errorMessage);
      }
      return responseData;
    } catch (error) {
      console.error('Registration error in API:', error);
      // Re-throw to be handled by the AuthContext
      throw error;
    }
  },

  verifyToken: async (token: string) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/verifyToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.replace(/^Bearer /, '')}`,
        },
      });
      return await response.json();
    } catch {
      return { success: false };
    }
  },
};

// Fund API calls
export const fundAPI = {
  saveFund: async (token: string, fundData: { schemeCode: number; schemeName: string }) => {
    try {
      console.log('Saving fund:', fundData);
      const response = await fetch(`${BASE_URL}/fund/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schemeCode: String(fundData.schemeCode),
          schemeName: fundData.schemeName
        }),
      });

      const responseData = await response.json();
      console.log('Save fund response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to save fund');
      }

      return responseData;
    } catch (error) {
      console.error('Save fund error:', error);
      throw error;
    }
  },

  getSavedFunds: async (token: string) => {
    try {
      const response = await fetch(`${BASE_URL}/fund/saved`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch saved funds');
      }

      return await response.json();
    } catch (error) {
      console.error('Get saved funds error:', error);
      throw error;
    }
  },

  removeFund: async (token: string, schemeCode: number) => {
    try {
      const response = await fetch(`${BASE_URL}/fund/remove`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schemeCode: String(schemeCode) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove fund');
      }

      return await response.json();
    } catch (error) {
      console.error('Remove fund error:', error);
      throw error;
    }
  },
};

// Mutual Fund data API calls (using external MF API)
export const searchMutualFunds = async (query: string): Promise<any[]> => {
  try {
    const response = await fetch(`${MF_API_URL}`);
    if (!response.ok) {
      throw new Error('Failed to fetch mutual funds');
    }
    const data = await response.json();
    
    // Filter funds based on search query
    return data.filter((fund: any) => 
      fund.schemeName.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 20); // Limit to 20 results for better performance
  } catch (error) {
    console.error('Error searching mutual funds:', error);
    throw error;
  }
};

export const getMutualFundDetails = async (schemeCode: number): Promise<any> => {
  try {
    const response = await fetch(`${MF_API_URL}/${schemeCode}`);
    if (!response.ok) {
      throw new Error('Failed to fetch mutual fund details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching mutual fund details:', error);
    throw error;
  }
};

