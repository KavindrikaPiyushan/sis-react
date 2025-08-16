import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, School, LogIn, Info, X, Sparkles } from 'lucide-react';

const UniversityLogin = () => {
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
  const [showDemo, setShowDemo] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDemo(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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

  const handleLogin = () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      
      const validCredentials = [
        { email: 'admin@fot.jfn.ac.lk', password: 'password', role: 'admin', name: 'Admin User' },
        { email: 'student@fot.jfn.ac.lk', password: 'password', role: 'student', name: 'John Doe' }
      ];
      
      const user = validCredentials.find(cred => 
        cred.email === formData.email && cred.password === formData.password
      );
      
      if (user) {
        const userData = {
          email: user.email,
          role: user.role,
          name: user.name,
          remember: formData.remember
        };
        
        console.log('User logged in:', userData);
        showAlert('Welcome back! Redirecting to your dashboard...', 'success');
        
        setTimeout(() => {
          if (userData.role === 'admin') {
            console.log('Redirecting to admin dashboard');
          } else {
            console.log('Redirecting to student dashboard');
          }
        }, 1500);
      } else {
        showAlert('Authentication failed. Please check your credentials.', 'error');
      }
    }, 2000);
  };

  const handleForgotPassword = () => {
    if (resetEmail) {
      setShowForgotModal(false);
      setResetEmail('');
      showAlert('Reset instructions sent! Check your inbox.', 'success');
    } else {
      showAlert('Please provide a valid email address', 'error');
    }
  };

  const AlertComponent = ({ alert }) => {
    if (!alert.show) return null;
    
    const alertConfig = {
      success: {
        bg: 'from-emerald-500/20 to-green-500/20',
        border: 'border-emerald-400/30',
        text: 'text-emerald-100',
        icon: '✨'
      },
      error: {
        bg: 'from-red-500/20 to-rose-500/20',
        border: 'border-red-400/30',
        text: 'text-red-100',
        icon: '⚠️'
      },
      warning: {
        bg: 'from-amber-500/20 to-yellow-500/20',
        border: 'border-amber-400/30',
        text: 'text-amber-100',
        icon: '⚡'
      },
      info: {
        bg: 'from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-400/30',
        text: 'text-blue-100',
        icon: '💡'
      }
    };

    const config = alertConfig[alert.type];

    return (
      <div className={`backdrop-blur-md bg-gradient-to-r ${config.bg} ${config.text} border ${config.border} flex items-center gap-3 p-4 mb-6 rounded-2xl font-medium text-sm shadow-lg animate-in slide-in-from-top duration-500`}>
        <span className="text-lg">{config.icon}</span>
        <span>{alert.message}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0">
        {/* Animated Gradient Mesh */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        {/* Interactive Mouse Trail */}
        <div 
          className="absolute w-96 h-96 bg-gradient-radial from-blue-500/10 to-transparent rounded-full transition-all duration-300 ease-out pointer-events-none"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
      </div>

      {/* Main Login Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glassmorphic Login Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 relative group hover:bg-white/15 transition-all duration-500">
          {/* Subtle Border Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 blur-sm"></div>
          <div className="relative">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl transform hover:scale-110 transition-all duration-300 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                  <School className="w-12 h-12 text-white relative z-10" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-blue-300 animate-pulse" />
              </div>
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-indigo-200 bg-clip-text text-transparent mb-3 tracking-tight">
                Welcome Back
              </h1>
              <div className="text-white/70 text-base leading-relaxed space-y-1">
                <p className="font-medium text-white/90">University of Jaffna</p>
                <p className="text-sm">Faculty of Technology</p>
                <p className="text-sm text-blue-300">Student Information System</p>
              </div>
            </div>

            {/* Demo Credentials */}
            {showDemo && (
              <div className="backdrop-blur-md bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-white border border-blue-400/30 flex items-start gap-3 p-4 mb-6 rounded-2xl text-sm shadow-lg animate-in slide-in-from-top duration-700">
                <div className="text-lg">🔑</div>
                <div>
                  <div className="font-semibold text-blue-200 mb-1">Demo Access</div>
                  <div className="space-y-1 text-xs text-white/80">
                    <div>Admin: <span className="font-mono text-blue-300">admin@fot.jfn.ac.lk</span></div>
                    <div>Student: <span className="font-mono text-blue-300">student@fot.jfn.ac.lk</span></div>
                    <div className="text-white/60">Password: <span className="font-mono">password</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* Alert Component */}
            <AlertComponent alert={alert} />

            {/* Login Form */}
            <div className="space-y-6">
              {/* Email Input */}
              <div className="group">
                <label className="block text-sm font-medium text-white/90 mb-2 group-focus-within:text-blue-300 transition-colors">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-white/50 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/25 focus:bg-white/10 outline-none transition-all duration-300 hover:bg-white/10"
                    placeholder="Enter your email address"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label className="block text-sm font-medium text-white/90 mb-2 group-focus-within:text-blue-300 transition-colors">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-white/50 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/25 focus:bg-white/10 outline-none transition-all duration-300 hover:bg-white/10"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-blue-400 transition-colors duration-200 focus:outline-none focus:text-blue-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleInputChange}
                  className="w-4 h-4 bg-white/10 border-white/30 rounded focus:ring-blue-400 focus:ring-2 text-blue-400 transition-colors"
                />
                <label htmlFor="remember" className="ml-3 text-sm text-white/80 hover:text-white transition-colors cursor-pointer">
                  Remember me on this device
                </label>
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:hover:scale-100 group shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              {/* Forgot Password */}
              <div className="text-center">
                <button
                  onClick={() => setShowForgotModal(true)}
                  className="text-blue-300 hover:text-white text-sm font-medium transition-colors duration-200 hover:underline underline-offset-4"
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-8 mt-8 border-t border-white/10 text-white/60 text-xs space-y-2">
              <p>&copy; 2025 University of Jaffna - Faculty of Technology</p>
              <p className="text-white/40">For technical support, contact IT Department</p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl w-full max-w-md transform animate-in zoom-in duration-300 relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 rounded-2xl opacity-20 blur-sm"></div>
            <div className="relative">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Reset Password
                </h3>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <p className="text-white/80 mb-4 text-sm leading-relaxed">
                  Enter your email address and we'll send you a secure link to reset your password.
                </p>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/25 focus:bg-white/10 outline-none transition-all duration-300"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 p-6 border-t border-white/10">
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 border border-white/20 rounded-lg hover:border-white/30 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleForgotPassword}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg"
                >
                  Send Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityLogin;