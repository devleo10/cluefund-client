export interface MutualFund {
  schemeCode: number;
  schemeName: string;
}

export interface MutualFundDetail {
  meta: {
    scheme_type: string;
    scheme_category: string;
    scheme_code: number;
    scheme_name: string;
    fund_house: string;
  };
  data: Array<{
    date: string;
    nav: string;
  }>;
  status: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface SavedFund {
  schemeCode: number;
  schemeName: string;
  savedAt: string;
}