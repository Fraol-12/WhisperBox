import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Complaint Management System
            </h1>
            <p className="text-gray-600">
              Submit and manage complaints anonymously
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/student/submit')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-105 shadow-md"
            >
              <div className="flex items-center justify-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Student
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/login')}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-105 shadow-md"
            >
              <div className="flex items-center justify-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 7H7a4 4 0 00-4 4v1a2 2 0 002 2h2.828m8.172 0a2 2 0 002-2v-1a4 4 0 00-4-4h-3m-1 4l3-3m0 0l3 3m-3-3v12" />
                </svg>
                Admin
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

