import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';
import { Lock, User, Loader2 } from 'lucide-react';

const LoginPage = ({ setAuthUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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

      // Always store role in lowercase to avoid mismatches
      const normalizedRole = role?.toLowerCase();

      localStorage.setItem('token', token);
      localStorage.setItem('role', normalizedRole);
      localStorage.setItem('username', username);
      if (linked_doctor_id) localStorage.setItem('linked_doctor_id', linked_doctor_id);
      if (linked_patient_id) localStorage.setItem('linked_patient_id', linked_patient_id);

      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Set authUser in state correctly
      setAuthUser({ role: normalizedRole, username });

      toast.success('Login successful');

      // redirect based on role
      navigate('/dashboard'); // dashboard route already handles role-based dashboards
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-200">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md animate-fade-in-up">
        <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-8">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-400">
              <User className="text-gray-500 mr-2" size={18} />
              <input
                type="text"
                className="w-full outline-none bg-transparent"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-400">
              <Lock className="text-gray-500 mr-2" size={18} />
              <input
                type="password"
                className="w-full outline-none bg-transparent"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg flex items-center justify-center transition duration-200"
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
