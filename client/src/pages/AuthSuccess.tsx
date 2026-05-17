import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      setError('OAuth authentication failed. Please try again.');
      return;
    }

    if (token) {
      localStorage.setItem('nexus_token', token);
      navigate('/app');
    } else {
      setError('No token received');
    }
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Error</h1>
          <p className="text-rose-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-emerald-500 text-slate-950 font-semibold rounded-xl"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Authenticating...</p>
      </div>
    </div>
  );
}