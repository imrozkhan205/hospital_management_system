import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';
import { Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';

const LoginPage = ({ setAuthUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/login', { username, password });
      const { token, role, linked_doctor_id, linked_patient_id } = res.data;
      const normalizedRole = role?.toLowerCase();
      localStorage.setItem('token', token);
      localStorage.setItem('role', normalizedRole);
      localStorage.setItem('username', username);
      localStorage.setItem('login_timestamp', Date.now().toString());
      if (linked_doctor_id) localStorage.setItem('linked_doctor_id', linked_doctor_id);
      if (linked_patient_id) localStorage.setItem('linked_patient_id', linked_patient_id);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAuthUser({ role: normalizedRole, username });
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-200 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up">
        <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-8">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username<span className='pl-10 opacity-40'>Demo username: demo</span>
</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-400">
              <User className="text-gray-500 mr-2" size={18} />
              <input
                type="text"
                className="w-full outline-none bg-transparent text-gray-800"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className='pl-10 opacity-40'>Demo password: demo</span></label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-400">
              <Lock className="text-gray-500 mr-2" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full outline-none bg-transparent text-gray-800"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-gray-500 hover:text-indigo-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center transition duration-200 shadow-md disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" /> Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
