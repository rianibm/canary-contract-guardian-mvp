import React, { useState } from "react";
import { X, Mail, Lock, Eye, EyeOff, User } from "lucide-react";

function Auth({ isOpen, onClose, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Handle input changes with validation
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear email error if valid
    if (errors.email && validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    // Clear password error if valid
    if (errors.password && validatePassword(value)) {
      setErrors(prev => ({ ...prev, password: "" }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Validate inputs
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check for specific dummy credentials
      const DUMMY_EMAIL = "testingcanary@gmail.com";
      const DUMMY_PASSWORD = "BrR123**";
      
      if (email === DUMMY_EMAIL && password === DUMMY_PASSWORD) {
        // Successful login with dummy credentials
        const userData = {
          email: email,
          name: "Testing Canary",
          id: "dummy_user_123"
        };
        
        onLogin(userData);
        onClose();
        
        // Reset form
        setEmail("");
        setPassword("");
        setErrors({});
        
      } else {
        // Invalid credentials
        setErrors({ general: "Invalid email or password. Please try again." });
      }
      
    } catch (error) {
      setErrors({ general: "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isLoading) {
      setEmail("");
      setPassword("");
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to unlock full monitoring features</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General error */}
          {errors.general && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                  errors.email 
                    ? "border-red-500 bg-red-50" 
                    : "border-gray-300"
                }`}
                placeholder="Enter your email"
                disabled={isLoading}
                autoComplete="email"
                required
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                  errors.password 
                    ? "border-red-500 bg-red-50" 
                    : "border-gray-300"
                }`}
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Demo credentials info */}
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700" style={{ display: 'none' }}>
            <p className="font-medium mb-1">Demo Credentials:</p>
            <p className="font-mono text-xs">Email: testingcanary@gmail.com</p>
            <p className="font-mono text-xs">Password: BrR123**</p>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button className="text-orange-600 hover:text-orange-700 font-medium">
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
