import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import Card from './ui/Card';

const AuthChoice = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-6 py-12">
      <Card
        padding="none"
        className="w-full max-w-2xl mx-auto transform transition-all duration-400 hover:scale-[1.01] shadow-lg"
      >
        <div className="w-full p-8 md:p-12 bg-white rounded-xl md:rounded-2xl flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full mb-6 shadow-sm">
              <svg className="w-10 h-10 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-secondary-900 leading-tight">WhisperBox</h1>
            <p className="mt-2 text-sm text-secondary-600 max-w-sm">
              Welcome to the Campus Anonymous Complaint Portal
            </p>
          </div>

          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 gap-4">
              <Button
                onClick={() => navigate('/student/submit')}
                variant="primary"
                size="lg"
                fullWidth
                className="flex items-center justify-center gap-3 py-4 rounded-xl shadow-md hover:shadow-lg transform transition hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Continue as Student
              </Button>

              <Button
                onClick={() => navigate('/admin/login')}
                variant="secondary"
                size="lg"
                fullWidth
                className="flex items-center justify-center gap-3 py-4 rounded-xl shadow-sm hover:shadow-md transform transition hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 7H7a4 4 0 00-4 4v1a2 2 0 002 2h2.828m8.172 0a2 2 0 002-2v-1a4 4 0 00-4-4h-3m-1 4l3-3m0 0l3 3m-3-3v12" />
                </svg>
                Continue as Admin
              </Button>

              <p className="text-xs text-center text-secondary-400 mt-2">No account required for students. Admins must sign in.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AuthChoice;
