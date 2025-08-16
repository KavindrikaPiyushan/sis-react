import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, School, LogIn, Info, X } from 'lucide-react';

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

    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      
      // Demo credentials
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
        
        // In a real app, you'd store this properly
        console.log('User logged in:', userData);
        showAlert('Login successful! Redirecting...', 'success');
        
        // Simulate redirect
        setTimeout(() => {
          if (userData.role === 'admin') {
            console.log('Redirecting to admin dashboard');
          } else {
            console.log('Redirecting to student dashboard');
          }
        }, 1000);
      } else {
        showAlert('Invalid email or password. Please try again.', 'error');
      }
    }, 1500);
  };

  const handleForgotPassword = () => {
    if (resetEmail) {
      setShowForgotModal(false);
      setResetEmail('');
      showAlert('Password reset link has been sent to your email', 'success');
    } else {
      showAlert('Please enter a valid email address', 'error');
    }
  };

  const AlertComponent = ({ alert }) => {
    if (!alert.show) return null;
    
    const alertStyles = {
      success: 'bg-green-50 text-green-700 border-green-200',
      error: 'bg-red-50 text-red-700 border-red-200',
      warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      info: 'bg-blue-50 text-blue-700 border-blue-200'
    };

    return (
      <div className={`flex items-center gap-3 p-4 mb-6 border rounded-lg font-medium text-sm ${alertStyles[alert.type]}`}>
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>{alert.message}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-300 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/3 left-1/3 w-40 h-40 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-24 h-24 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-3000"></div>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-width-md relative z-10 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <School className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600 text-base leading-relaxed">
            University of Jaffna<br />
            Faculty of Technology<br />
            Student Information System
          </p>
        </div>


        {/* Alert */}
        <AlertComponent alert={alert} />

        {/* Login Form */}
        <div className="mb-6">
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-h-[52px]"
                placeholder="Enter your email address"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-12 pr-12 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-h-[52px]"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="remember"
              name="remember"
              checked={formData.remember}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
              Remember me on this device
            </label>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors min-h-[52px] mb-6"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                {isLoading ? 'Signing in...' : 'Sign In'}
              </>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Forgot your password?
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-gray-200 text-gray-600 text-sm">
          <p>&copy; 2025 University of Jaffna - Faculty of Technology</p>
          <p className="mt-1">For technical support, contact IT Department</p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-medium text-gray-900">Reset Password</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <div className="mb-4">
                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your email address"
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityLogin;