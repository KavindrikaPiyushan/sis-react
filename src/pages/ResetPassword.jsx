import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthService from '../services/authService.js';
import branding from '../config/branding.js';
import { School, GraduationCap, BookOpen, Users, Sparkles } from 'lucide-react';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  // Extract token from query string
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: '' });
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      showAlert('Please enter and confirm your new password.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('Passwords do not match.', 'error');
      return;
    }
    if (!token) {
      showAlert('Invalid or missing token.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const result = await AuthService.resetPassword(token, newPassword);
      if (result.success) {
        showAlert('Password reset successful! You can now log in.', 'success');
        setTimeout(() => navigate('/'), 2000);
      } else {
        showAlert(result.message || 'Failed to reset password.', 'error');
      }
    } catch (error) {
      showAlert('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-blue-100 flex items-center justify-center p-2 sm:p-4 lg:p-6 relative overflow-hidden" style={{ backgroundColor: branding.logoBg }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large animated orbs - responsive sizes */}
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-60 lg:w-80 h-40 sm:h-60 lg:h-80 rounded-full blur-2xl sm:blur-3xl animate-pulse" style={{ background: branding.orbGradients[0], opacity: branding.orbOpacities[0] }}></div>
        <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 sm:w-60 lg:w-80 h-40 sm:h-60 lg:h-80 rounded-full blur-2xl sm:blur-3xl animate-pulse" style={{ background: branding.orbGradients[1], opacity: branding.orbOpacities[1], animationDelay: branding.orbDelays[1] }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 rounded-full blur-2xl sm:blur-3xl animate-pulse" style={{ background: branding.orbGradients[2], opacity: branding.orbOpacities[2], animationDelay: branding.orbDelays[2] }}></div>
        {/* Floating particles - hide on very small screens */}
        <div className="hidden sm:block absolute top-20 left-1/4 w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#004488', opacity: 0.4, animationDelay: '0.5s', animationDuration: '4s' }}></div>
        <div className="hidden sm:block absolute top-40 right-1/3 w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#002244', opacity: 0.4, animationDelay: '1.5s', animationDuration: '3s' }}></div>
        <div className="hidden md:block absolute bottom-32 left-1/3 w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: '#004477', opacity: 0.4, animationDelay: '2.5s', animationDuration: '5s' }}></div>
        <div className="hidden md:block absolute bottom-20 right-1/4 w-1 h-1 rounded-full animate-bounce" style={{ backgroundColor: '#003355', opacity: 0.4, animationDelay: '0.8s', animationDuration: '3.5s' }}></div>
      </div>

      {/* Floating Education Icons with enhanced animations - responsive positioning */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-16 sm:top-20 left-8 sm:left-20 animate-bounce transform hover:scale-110 transition-transform`} 
             style={{ color: '#004488', opacity: 0.4, animationDelay: '0s', animationDuration: '3s' }}>
          <GraduationCap className="w-6 sm:w-8 h-6 sm:h-8 filter drop-shadow-lg" />
        </div>
        <div className={`absolute top-20 sm:top-32 right-12 sm:right-32 animate-bounce transform hover:scale-110 transition-transform`} 
             style={{ color: '#002244', opacity: 0.4, animationDelay: '1s', animationDuration: '3s' }}>
          <BookOpen className="w-5 sm:w-6 h-5 sm:h-6 filter drop-shadow-lg" />
        </div>
        <div className={`hidden sm:block absolute bottom-32 left-32 animate-bounce transform hover:scale-110 transition-transform`} 
             style={{ color: '#004477', opacity: 0.4, animationDelay: '2s', animationDuration: '3s' }}>
          <Users className="w-7 h-7 filter drop-shadow-lg" />
        </div>
        <div className={`hidden lg:block absolute top-1/2 right-20 animate-bounce transform hover:scale-110 transition-transform`} 
             style={{ color: '#003355', opacity: 0.4, animationDelay: '1.5s', animationDuration: '4s' }}>
          <Sparkles className="w-5 h-5 filter drop-shadow-lg" />
        </div>
      </div>

      {/* Main Reset Password Card with enhanced animations - responsive design */}
      <div className="bg-white/90 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/15 p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md relative z-10 border border-white/30 transform-gpu animate-in zoom-in-95 slide-in-from-bottom-4 duration-700 ease-out mx-2">
        {/* Animated border gradient */}
        <div className="absolute -inset-0.5 rounded-2xl sm:rounded-3xl blur opacity-60 animate-pulse" style={{ background: branding.gradient }}></div>
        <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 -m-4 sm:-m-6 lg:-m-8">
          {/* Header with logo and branding - responsive typography */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="relative mb-4 sm:mb-6 animate-in zoom-in-50 duration-1000 delay-300">
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto shadow-2xl transform transition-all duration-300" style={{ backgroundColor: branding.logoBg, boxShadow: '0 25px 50px -12px rgba(0, 51, 102, 0.3)' }}>
                <School className="w-8 sm:w-10 h-8 sm:h-10 text-white filter drop-shadow-lg" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent mb-2 sm:mb-3 animate-in slide-in-from-top-2 duration-700 delay-500" style={{ background: branding.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Set New Password
            </h1>
            <div className="space-y-1 text-gray-600 animate-in fade-in duration-700 delay-700">
              <p className="font-semibold text-gray-800 transform hover:scale-105 transition-transform text-sm sm:text-base">{branding.university}</p>
              <p className="text-xs sm:text-sm">{branding.faculty}</p>
              <p className="text-xs sm:text-sm">{branding.system}</p>
            </div>
          </div>
          {/* Alert - enhanced responsive design */}
          {alert.show && (
            <div className={`mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg sm:rounded-xl text-sm font-medium animate-in slide-in-from-top-2 duration-500 ${alert.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
              {alert.message}
            </div>
          )}
          {/* Reset Password Form - responsive design */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="animate-in slide-in-from-left-4 duration-500 delay-800">
              <label className="block mb-2 font-semibold text-gray-700 text-sm">New Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white transform hover:scale-[1.02] focus:scale-[1.02]"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Enter your new password"
                required
              />
            </div>
            <div className="animate-in slide-in-from-right-4 duration-500 delay-900">
              <label className="block mb-2 font-semibold text-gray-700 text-sm">Confirm Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white transform hover:scale-[1.02] focus:scale-[1.02]"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Confirm your new password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-300 shadow-2xl hover:shadow-2xl hover:-translate-y-1 disabled:transform-none disabled:shadow-lg animate-in slide-in-from-bottom-4 duration-500 delay-1000 transform-gpu group text-sm sm:text-base"
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
              disabled={isLoading}
            >
              <span className="transform group-hover:scale-105 transition-transform">
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </span>
            </button>
          </form>
          {/* Footer - responsive text sizes */}
          <div className="text-center pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-gray-200/60 text-gray-500 text-xs space-y-1 animate-in fade-in duration-500 delay-1300">
            <p className="font-medium transform hover:scale-105 transition-transform">&copy; {branding.copyright}</p>
            <p className="text-xs sm:text-sm">{branding.faculty} • {branding.system}</p>
            <p className="cursor-pointer transition-all duration-300 transform hover:scale-105 text-xs" 
               style={{ color: branding.logoBg }} 
               onMouseEnter={e => e.target.style.color = '#002244'} 
               onMouseLeave={e => e.target.style.color = branding.logoBg}>
              {branding.supportText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
