import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  BarChart3, 
  Shield, 
  PieChart, 
  Mail, 
  Lock, 
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showExistingUserPrompt, setShowExistingUserPrompt] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  // Add local toast state
  const [localToast, setLocalToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const { login, register, isLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Function to show a local toast message
  const showLocalToast = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`Showing local toast: ${message} (${type})`);
    setLocalToast({ message, type });
    // Clear the toast after a few seconds
    setTimeout(() => setLocalToast(null), 4000); // Match the global toast duration
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setShowExistingUserPrompt(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowExistingUserPrompt(false);
    setLocalToast(null); // Clear any existing toast

    // Basic validation
    if (!formData.email || !formData.password) {
      const msg = 'Please fill in all required fields';
      setError(msg);
      showLocalToast(msg, 'error');
      showToast(msg, 'error');
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      const msg = 'Passwords do not match';
      setError(msg);
      showLocalToast(msg, 'error');
      showToast(msg, 'error');
      return;
    }

    if (!isLogin && !formData.name) {
      const msg = 'Please enter your name';
      setError(msg);
      showLocalToast(msg, 'error');
      showToast(msg, 'error');
      return;
    }

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password);
      }

      if (result.success) {
        const successMsg = isLogin ? 'Login successful!' : 'Registration successful!';
        showToast(successMsg, 'success');
        showLocalToast(successMsg, 'success');
        // Delay navigation so toast is visible
        setTimeout(() => navigate('/'), 1000);
      } else {
        // Check if the error is about user already existing
        if (!isLogin && result.error && (
          result.error.toLowerCase().includes('user already exists') ||
          result.error.toLowerCase().includes('email already exists') ||
          result.error.toLowerCase().includes('already registered')
        )) {
          setShowExistingUserPrompt(true);
          setError('');
        } else {
          // Show the error message from backend (e.g., Invalid credentials)
          const msg = result.error || 'Authentication failed';
          const cleanMsg = msg.replace(/^error:?/i, '').trim();
          
          console.log('Authentication error to display:', cleanMsg);
          
          // Set form error state
          setError(cleanMsg);
          
          // Force toast to show by triggering in the next tick
          setTimeout(() => {
            showToast(cleanMsg, 'error');
            showLocalToast(cleanMsg, 'error');
            console.log('Toast triggered for:', cleanMsg);
          }, 10);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const errorMsg = err.message || 'An unexpected error occurred';
      
      // Set form error state
      setError(errorMsg);
      
      // Force toast to show by triggering in the next tick
      setTimeout(() => {
        // Show both toast notifications
        showToast(errorMsg, 'error');
        showLocalToast(errorMsg, 'error');
        
        // Log for debugging
        console.log('Displaying error toast for:', errorMsg);
      }, 10);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setError('');
    setShowExistingUserPrompt(false);
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setFormData({ ...formData, name: '', confirmPassword: '' });
    setError('');
    setShowExistingUserPrompt(false);
  };

  // Debug effect for monitoring error state
  useEffect(() => {
    if (error) {
      console.log('Error state changed:', error);
    }
  }, [error]);

  // Debug effect for monitoring toast visibility
  useEffect(() => {
    if (localToast) {
      console.log('Local toast is active:', localToast);
    }
  }, [localToast]);

  // For development/testing purposes, show a toast when the component mounts
  useEffect(() => {
    // Testing toasts on component mount
    const testToasts = () => {
      const error = new URLSearchParams(window.location.search).get('error');
      if (error) {
        console.log('Showing error toast from URL param:', error);
        setTimeout(() => {
          showToast(error, 'error');
          showLocalToast(error, 'error');
        }, 1000);
      }
    };
    
    testToasts();
  }, [showToast, showLocalToast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-[99990] flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="text-white font-medium">Processing...</p>
          </div>
        </div>
      )}
      
      {/* Local Toast Message */}
      {localToast && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[99999] px-6 py-4 rounded-lg shadow-xl text-white transition-all duration-300 flex items-center
          ${localToast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
          style={{ 
            pointerEvents: 'auto',
            minWidth: '300px',
            maxWidth: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)' 
          }}
        >
          {localToast.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
          )}
          <span className="font-medium">{localToast.message}</span>
        </div>
      )}
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9wYXR0ZXJuPgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiIC8+Cjwvc3ZnPg==')] opacity-30"></div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Brand & Features */}
        <div className="hidden lg:flex lg:flex-1 flex-col justify-center px-12 xl:px-16">
          <div className="max-w-xl">
            {/* Logo & Brand */}
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-3 rounded-xl mr-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">
                Clue<span className="text-emerald-400">fund</span>
              </h1>
            </div>

            {/* Tagline */}
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              Smart Mutual Fund
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Tracking Made Simple
              </span>
            </h2>

            <p className="text-xl text-slate-300 mb-12 leading-relaxed">
              Track, analyze, and optimize your mutual fund portfolio with our AI-powered insights and real-time analytics.
            </p>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Real-time Analytics</h3>
                  <p className="text-slate-400">Get instant insights into your portfolio performance with live data updates.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Secure & Reliable</h3>
                  <p className="text-slate-400">Bank-grade security with 99.9% uptime guarantee for your peace of mind.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <PieChart className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Portfolio Diversification</h3>
                  <p className="text-slate-400">Easily manage and diversify your investments across multiple mutual funds.</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 lg:flex-none lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-3 rounded-xl mr-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                Clue<span className="text-emerald-400">fund</span>
              </h1>
            </div>

            {/* Form Container */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
              {/* Form Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {isLogin ? 'Welcome Back' : 'Get Started'}
                </h2>
                <p className="text-slate-300">
                  {isLogin 
                    ? 'Sign in to access your portfolio' 
                    : 'Create your account to start tracking'
                  }
                </p>
              </div>

              {/* Form Toggle */}
              <div className="flex bg-slate-800/50 rounded-lg p-1 mb-8">
                <button
                  onClick={() => isLogin || toggleForm()}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    isLogin 
                      ? 'bg-white text-slate-900 shadow-lg' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => !isLogin || toggleForm()}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    !isLogin 
                      ? 'bg-white text-slate-900 shadow-lg' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Existing User Prompt */}
              {showExistingUserPrompt && (
                <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-blue-200 text-sm mb-3">
                        An account with this email already exists. Would you like to sign in instead?
                      </p>
                      <button
                        onClick={switchToLogin}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Switch to Sign In
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                  <span className="text-red-200 text-sm">{error}</span>
                </div>
              )}


              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {!isLogin && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required={!isLogin}
                    />
                  </div>
                )}

                {isLogin && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500" />
                      <span className="ml-2 text-slate-300">Remember me</span>
                    </label>
                    <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Features for sign up */}
              {!isLogin && (
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <p className="text-slate-300 text-sm mb-3">What you'll get:</p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-slate-300">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                      Free portfolio tracking for 3 months
                    </div>
                    <div className="flex items-center text-sm text-slate-300">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                      Real-time market updates
                    </div>
                    <div className="flex items-center text-sm text-slate-300">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                      AI-powered investment insights
                    </div>
                  </div>
                </div>
              )}

              
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default AuthPage;