import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin, setAuthToken } from '../utils/api';
import { showNotification } from '../utils/notifications';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await adminLogin(email, password);
      setAuthToken(response.data.token);
      localStorage.setItem('admin', JSON.stringify(response.data.admin));
      showNotification('Login successful!', 'success');
      navigate('/admin/dashboard');
    } catch (error) {
      showNotification(
        error.response?.data?.error || 'Login failed',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-800 via-secondary-900 to-secondary-950 flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="max-w-md w-full mx-auto">
        <Card className="animate-fade-in-up" padding="lg" hover={false}>
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/')}
              className="text-secondary-600 hover:text-secondary-800 font-medium mb-6 inline-flex items-center group transition-colors"
              aria-label="Back to home"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 7H7a4 4 0 00-4 4v1a2 2 0 002 2h2.828m8.172 0a2 2 0 002-2v-1a4 4 0 00-4-4h-3m-1 4l3-3m0 0l3 3m-3-3v12" />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-2">
                Admin Login
              </h1>
              <p className="text-secondary-600">
                Sign in to manage complaints
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@university.edu"
              required
            />

            <Input
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                loading={loading}
                fullWidth
                size="lg"
                variant="secondary"
              >
                {!loading && (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                )}
                Sign In
              </Button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-primary-50 border-l-4 border-primary-500 rounded-r-lg">
            <p className="text-sm text-primary-800 font-semibold mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Demo Credentials
            </p>
            <div className="text-xs text-primary-700 space-y-1">
              <p><strong>Email:</strong> cafe@university.edu (or it@university.edu, library@university.edu, etc.)</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
