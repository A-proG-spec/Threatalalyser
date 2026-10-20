// src/pages/Login.tsx
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await authApi.login({ email, password });
      } else {
        res = await authApi.register({ email, password, name });
      }
      
      // Save token and user, then redirect
      await login(res.token, res.user);
      navigate('/'); 
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-md mx-auto mt-20">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-white mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-gray-400">
            {isLogin ? 'Sign in to access your investigation history.' : 'Register to start tracking threat intelligence.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#111] text-white px-6 py-4 rounded-full outline-none focus:ring-1 focus:ring-gray-700"
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#111] text-white px-6 py-4 rounded-full outline-none focus:ring-1 focus:ring-gray-700"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#111] text-white px-6 py-4 rounded-full outline-none focus:ring-1 focus:ring-gray-700"
          />
          
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          
          <Button type="submit" isLoading={isLoading} className="w-full py-4 mt-2">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center text-gray-500 mt-8">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-white hover:underline"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </PageWrapper>
  );
}