import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { validateEmail } from '../utils/validation';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, isAuthenticated, user, error, clearError } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;


 //below code automatically redirecting users who are already logged in.
  // useEffect(() => {
  //   if (isAuthenticated && user) {
  //     const userRole = user.role ? user.role.toUpperCase() : '';
  //     if (userRole) handleRedirect(userRole);
  //   }
  // }, [isAuthenticated, user, navigate]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) errors.email = 'Email is required';
    else if (!validateEmail(email)) errors.email = 'Invalid Email Address';
    if (!password) errors.password = 'Password is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRedirect = (role) => {
    // 1. Check if there is a saved location (where the user wanted to go)
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }

    // 2. Otherwise, go to the default dashboard based on role
    switch (role) {
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
      case 'TEACHER':
      case 'FACULTY':
        navigate('/teacher/dashboard');
        break;
      case 'STUDENT':
        navigate('/student/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    if (!validateForm()) return;

    const res = await login({ email, password });

    if (res.success) {
      handleRedirect(res.user.role.toUpperCase());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input id="email" name="email" type="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="john@college.edu" value={email} onChange={onChange} />
              {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative mt-1">
                <input id="password" name="password" type={showPassword ? "text" : "password"} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 pr-10" placeholder="••••••" value={password} onChange={onChange} />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                </button>
              </div>
              {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-200 ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;