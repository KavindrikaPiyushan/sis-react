import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, School, LogIn, Info, X, GraduationCap, BookOpen, Users, Sparkles } from 'lucide-react';
import AuthService from '../services/authService.js';
import branding from '../config/branding.js';
import loginBg from '../assets/login-bg.jpg';

const UniversityLogin = ({ setRole }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  

  useEffect(() => {
    setMounted(true);
  }, []);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: '' });
    }, 5000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      showAlert('Please enter both email and password.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const result = await AuthService.login({
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        const userData = { ...result.data, remember: formData.remember };
        
        if (setRole) setRole(userData.role);
        
        console.log('User logged in:', userData);
        showAlert('Welcome back! Redirecting to your dashboard...', 'success');
        
        localStorage.setItem('authToken', JSON.stringify(true));
        localStorage.setItem('userData', JSON.stringify(userData));


        
        setTimeout(() => {
          if (userData.role === 'admin' || userData.role === 'super_admin') {
            navigate('/admin/dashboard');
          } else if (userData.role === 'student') {
            navigate('/student/dashboard');
          } else {
            navigate('/dashboard');
          }
        }, 1000);
      } else {
        showAlert(result.message || 'Invalid credentials. Please check your email and password.', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showAlert('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      showAlert('Please enter a valid email address', 'error');
      return;
    }
    setIsLoading(true);
    try {
      // Use the correct endpoint via AuthService
      const result = await AuthService.forgotPassword(resetEmail);
      if (result.success) {
        setShowForgotModal(false);
        setResetEmail('');
        showAlert('📧 Password reset instructions sent to your email', 'success');
      } else {
        showAlert(result.message || 'Failed to send reset instructions', 'error');
      }
    } catch (error) {
      showAlert('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const AlertComponent = ({ alert }) => {
    if (!alert.show) return null;
    
    const alertStyles = {
      success: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200/50 shadow-lg shadow-emerald-500/10',
      error: 'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border border-red-200/50 shadow-lg shadow-red-500/10',
      warning: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 border border-amber-200/50 shadow-lg shadow-amber-500/10',
      info: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-200/50 shadow-lg shadow-blue-500/10'
    };

    return (
      <div className={`flex items-start gap-3 p-4 mb-6 rounded-2xl font-medium text-sm ${alertStyles[alert.type]} animate-in slide-in-from-top-4 duration-500 ease-out transform-gpu`}>
        <div className="animate-pulse">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        </div>
        <span className="leading-relaxed animate-in fade-in duration-700 delay-200">{alert.message}</span>
      </div>
    );
  };

  return (
  <div
    className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
    style={{
      backgroundColor: branding.logoBg,
      backgroundImage: `url(${loginBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
  >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large animated orbs */}
    <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{ background: branding.orbGradients[0], opacity: branding.orbOpacities[0] }}></div>
    <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{ background: branding.orbGradients[1], opacity: branding.orbOpacities[1], animationDelay: branding.orbDelays[1] }}></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: branding.orbGradients[2], opacity: branding.orbOpacities[2], animationDelay: branding.orbDelays[2] }}></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-1/4 w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#004488', opacity: 0.4, animationDelay: '0.5s', animationDuration: '4s' }}></div>
        <div className="absolute top-40 right-1/3 w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#002244', opacity: 0.4, animationDelay: '1.5s', animationDuration: '3s' }}></div>
        <div className="absolute bottom-32 left-1/3 w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: '#004477', opacity: 0.4, animationDelay: '2.5s', animationDuration: '5s' }}></div>
        <div className="absolute bottom-20 right-1/4 w-1 h-1 rounded-full animate-bounce" style={{ backgroundColor: '#003355', opacity: 0.4, animationDelay: '0.8s', animationDuration: '3.5s' }}></div>
      </div>

      {/* Floating Education Icons with enhanced animations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-20 left-20 ${mounted ? 'animate-bounce' : ''} transform hover:scale-110 transition-transform`} 
             style={{ color: '#004488', opacity: 0.4, animationDelay: '0s', animationDuration: '3s' }}>
          <GraduationCap className="w-8 h-8 filter drop-shadow-lg" />
        </div>
        <div className={`absolute top-32 right-32 ${mounted ? 'animate-bounce' : ''} transform hover:scale-110 transition-transform`} 
             style={{ color: '#002244', opacity: 0.4, animationDelay: '1s', animationDuration: '3s' }}>
          <BookOpen className="w-6 h-6 filter drop-shadow-lg" />
        </div>
        <div className={`absolute bottom-32 left-32 ${mounted ? 'animate-bounce' : ''} transform hover:scale-110 transition-transform`} 
             style={{ color: '#004477', opacity: 0.4, animationDelay: '2s', animationDuration: '3s' }}>
          <Users className="w-7 h-7 filter drop-shadow-lg" />
        </div>
        <div className={`absolute top-1/2 right-20 ${mounted ? 'animate-bounce' : ''} transform hover:scale-110 transition-transform`} 
             style={{ color: '#003355', opacity: 0.4, animationDelay: '1.5s', animationDuration: '4s' }}>
          <Sparkles className="w-5 h-5 filter drop-shadow-lg" />
        </div>
      </div>

      {/* Main Login Card with enhanced animations */}
      <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/15 p-8 w-full max-w-md relative z-10 border border-white/30 transform-gpu animate-in zoom-in-95 slide-in-from-bottom-4 duration-700 ease-out">
        {/* Animated border gradient */}
        <div className="absolute -inset-0.5 rounded-3xl blur opacity-60 animate-pulse" style={{ background: 'linear-gradient(90deg, #004488 0%, #003366 50%, #002244 100%)' }}></div>
        
        <div className="relative bg-[rgb(228,243,255)]/95 backdrop-blur-xl rounded-3xl p-8 -m-8">
          {/* Header with staggered animations */}
          <div className="text-center mb-8">
            <div className="relative mb-4 animate-in zoom-in-50 duration-1000 delay-300">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-2xl transform transition-all duration-300" style={{ backgroundColor: '#003366', boxShadow: '0 25px 50px -12px rgba(0, 51, 102, 0.3)' }}>
                <School className="w-8 h-8 text-white filter drop-shadow-lg" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold bg-clip-text text-transparent mb-2 animate-in slide-in-from-top-2 duration-700 delay-500" style={{ background: branding.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Welcome Back
            </h1>
            <div className="space-y-1 text-gray-600 animate-in fade-in duration-700 delay-700">
              <p className="font-semibold text-gray-800 transform hover:scale-105 transition-transform">{branding.system}</p>
              <p className="text-sm">{branding.faculty} - {branding.university}</p>
            </div>
          </div>

          {/* Alert */}
          <AlertComponent alert={alert} />

          {/* Login Form with staggered animations */}
          <div className="space-y-6">
            <div className="animate-in slide-in-from-left-4 duration-500 delay-800">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className={`relative group transform transition-all duration-300 ${focusedField === 'email' ? 'scale-105' : ''}`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`w-5 h-5 transition-all duration-300 ${focusedField === 'email' ? 'scale-110' : ''}`} 
                        style={{ color: focusedField === 'email' ? '#003366' : '#9CA3AF' }} />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  className="w-full pl-12 pr-4 py-3 text-base border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 bg-white/60 hover:bg-white/80 focus:bg-white hover:shadow-lg focus:shadow-xl transform focus:scale-[1.02]"
                  placeholder="your.email@fot.jfn.ac.lk"
                  autoComplete="username"
                />
                {/* Animated underline */}
                <div className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${focusedField === 'email' ? 'w-full' : 'w-0'}`} style={{ background: 'linear-gradient(90deg, #003366, #004488)' }}></div>
              </div>
            </div>

            <div className="animate-in slide-in-from-right-4 duration-500 delay-900">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className={`relative group transform transition-all duration-300 ${focusedField === 'password' ? 'scale-105' : ''}`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`w-5 h-5 transition-all duration-300 ${focusedField === 'password' ? 'scale-110' : ''}`}
                        style={{ color: focusedField === 'password' ? '#003366' : '#9CA3AF' }} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  className="w-full pl-12 pr-12 py-3 text-base border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 bg-white/60 hover:bg-white/80 focus:bg-white hover:shadow-lg focus:shadow-xl transform focus:scale-[1.02]"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center transition-all duration-300 transform hover:scale-110"
                  style={{ color: '#9CA3AF' }}
                  onMouseEnter={(e) => e.target.style.color = '#003366'}
                  onMouseLeave={(e) => e.target.style.color = '#9CA3AF'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {/* Animated underline */}
                <div className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${focusedField === 'password' ? 'w-full' : 'w-0'}`} style={{ background: 'linear-gradient(90deg, #003366, #004488)' }}></div>
              </div>
            </div>

            {/* <div className="flex items-center animate-in fade-in duration-500 delay-1000">
              <div className="relative">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleInputChange}
                  className="w-4 h-4 border-gray-300 rounded focus:ring-4 transform hover:scale-110 transition-transform"
                  style={{ 
                    color: '#003366',
                    focusRingColor: 'rgba(0, 51, 102, 0.2)'
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 4px rgba(0, 51, 102, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = '';
                  }}
                />
              </div>
              <label htmlFor="remember" className="ml-3 text-sm text-gray-600 font-medium hover:text-gray-800 transition-colors cursor-pointer">
                Keep me signed in
              </label>
            </div> */}

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl hover:shadow-2xl hover:-translate-y-1 disabled:transform-none disabled:shadow-lg animate-in slide-in-from-bottom-4 duration-500 delay-1100 transform-gpu group"
              style={{
                background: isLoading 
                  ? 'linear-gradient(90deg, #6B7280, #9CA3AF, #6B7280)'
                  : 'linear-gradient(90deg, #003366, #004488, #003366)',
                boxShadow: isLoading 
                  ? '0 25px 50px -12px rgba(107, 114, 128, 0.3)'
                  : '0 25px 50px -12px rgba(0, 51, 102, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.background = 'linear-gradient(90deg, #002244, #003366, #002244)';
                  e.target.style.boxShadow = '0 25px 50px -12px rgba(0, 34, 68, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.background = 'linear-gradient(90deg, #003366, #004488, #003366)';
                  e.target.style.boxShadow = '0 25px 50px -12px rgba(0, 51, 102, 0.3)';
                }
              }}
            >
              {isLoading ? (
                <div className="relative">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-5 h-5 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: '#004488', animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                </div>
              ) : (
                <LogIn className="w-5 h-5 transform group-hover:scale-110 group-hover:rotate-3 transition-transform" />
              )}
              <span className="transform group-hover:scale-105 transition-transform">
                {isLoading ? 'Signing you in...' : 'Sign In'}
              </span>
            </button>

            <div className="text-center animate-in fade-in duration-500 delay-1200">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="font-semibold text-sm transition-all duration-300 hover:underline transform hover:scale-105"
                style={{ color: '#003366' }}
                onMouseEnter={(e) => e.target.style.color = '#002244'}
                onMouseLeave={(e) => e.target.style.color = '#003366'}
              >
                Forgot your password?
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 mt-4 border-t border-gray-200/60 text-gray-500 text-xs space-y-1 animate-in fade-in duration-500 delay-1300">
            <p className="font-medium transform hover:scale-105 transition-transform">&copy; {branding.copyright}</p>
            <p>{branding.faculty} • {branding.system}</p>
            <p className="cursor-pointer transition-all duration-300 transform hover:scale-105" 
               style={{ color: branding.logoBg }} 
               onMouseEnter={e => e.target.style.color = '#002244'} 
               onMouseLeave={e => e.target.style.color = branding.logoBg}>
              {branding.supportText}
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 ease-out border border-white/20">
            <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
              <h3 className="text-xl font-bold bg-clip-text text-transparent" 
                  style={{ background: 'linear-gradient(135deg, #003366 0%, #002244 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Reset Password
              </h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-2 hover:bg-gray-100/80 rounded-xl transition-all duration-300 text-gray-400 hover:text-gray-600 transform hover:scale-110 hover:rotate-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-6 leading-relaxed animate-in fade-in duration-500 delay-200">
                Enter your university email address and we'll send you secure instructions to reset your password.
              </p>
              <div className="animate-in slide-in-from-left-4 duration-500 delay-300">
                <label htmlFor="resetEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                  University Email
                </label>
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 outline-none transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white transform hover:scale-[1.02] focus:scale-[1.02]"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#003366';
                    e.target.style.boxShadow = '0 0 0 4px rgba(0, 51, 102, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = '';
                  }}
                  placeholder="your.email@fot.jfn.ac.lk"
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end p-6 border-t border-gray-200/60 animate-in fade-in duration-500 delay-400">
              <button
                onClick={() => setShowForgotModal(false)}
                className="px-6 py-2.5 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50/80 transition-all duration-300 font-medium transform hover:scale-105 hover:-translate-y-0.5"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                className="px-6 py-2.5 text-white rounded-xl transition-all duration-300 font-medium shadow-lg transform hover:scale-105 hover:-translate-y-0.5"
                style={{ 
                  background: 'linear-gradient(90deg, #003366, #004488)',
                  boxShadow: '0 10px 25px -12px rgba(0, 51, 102, 0.25)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(90deg, #002244, #003366)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(90deg, #003366, #004488)';
                }}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { UniversityLogin as default };