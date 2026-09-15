import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        login(data.access_token, { id: 1, email, name: 'Driver', role: 'USER' }); // mock user details for now
        navigate('/');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4">
      <div className="w-full max-w-md bg-[#18181b]/80 backdrop-blur border border-white/10 p-8 rounded-2xl shadow-[0_0_50px_rgba(30,58,138,0.1)]">
        <div className="flex items-center justify-center mb-8 text-blue-500">
          <ShieldAlert size={48} />
          <h1 className="text-2xl font-bold ml-3 text-white">DriveGuard AI</h1>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
              required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
              required />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition-colors mt-4">
            Connect
          </button>
        </form>
        <p className="mt-6 text-xs text-gray-500 text-center">
          For demo purposes, the backend must be running. Use any registered email/password.
        </p>
      </div>
    </div>
  );
}
