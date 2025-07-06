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

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please enter both fields");
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post('/auth/login', {
        username,
        password,
      });

      // Fixed: Your backend returns { token, username } directly, not { token, user }
      const { token, username: returnedUsername } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('username', returnedUsername);

      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAuthUser({ username: returnedUsername });
      toast.success("Login successful!");
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-200">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md animate-fade-in-up">
        <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-8">Admin Login</h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-400">
              <User className="text-gray-500 mr-2" size={18} />
              <input
                type="text"
                className="w-full outline-none bg-transparent"
                placeholder="admin"
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
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;