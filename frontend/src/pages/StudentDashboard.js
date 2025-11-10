import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getComplaints, likeComplaint } from '../utils/api';
import { showNotification } from '../utils/notifications';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [department, setDepartment] = useState(location.state?.department || '');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('likes');
  const [search, setSearch] = useState('');
  const [likedComplaints, setLikedComplaints] = useState(new Set());

  const departments = ['Café', 'IT', 'Library', 'Dorm', 'Registrar'];

  useEffect(() => {
    // Load liked complaints from localStorage
    const savedLikes = localStorage.getItem('likedComplaints');
    if (savedLikes) {
      setLikedComplaints(new Set(JSON.parse(savedLikes)));
    }
  }, []);

  useEffect(() => {
    if (department) {
      fetchComplaints();
    }
  }, [department, sortBy, search]);

  const fetchComplaints = async () => {
    if (!department) return;
    
    setLoading(true);
    try {
      const response = await getComplaints(department, sortBy, search);
      setComplaints(response.data);
    } catch (error) {
      showNotification('Failed to load complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (complaintId) => {
    if (likedComplaints.has(complaintId)) {
      showNotification('You have already liked this complaint', 'error');
      return;
    }

    try {
      await likeComplaint(complaintId);
      const newLiked = new Set(likedComplaints);
      newLiked.add(complaintId);
      setLikedComplaints(newLiked);
      localStorage.setItem('likedComplaints', JSON.stringify([...newLiked]));
      
      // Update the complaint in the list
      setComplaints(complaints.map(c => 
        c._id === complaintId ? { ...c, likes: c.likes + 1 } : c
      ));
      
      showNotification('Complaint liked!', 'success');
    } catch (error) {
      showNotification(error.response?.data?.error || 'Failed to like complaint', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Student Dashboard
            </h1>
            <p className="text-gray-600">
              View and interact with complaints
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="likes">Most Liked</option>
                <option value="date">Latest First</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search complaints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {!department ? (
            <div className="text-center py-12 text-gray-500">
              Please select a department to view complaints
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No complaints found for this department
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {complaint.ticketId && (
                          <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {complaint.ticketId}
                          </span>
                        )}
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                        {complaint.message}
                      </p>
                      {complaint.reply && (
                        <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                          <p className="text-sm font-semibold text-blue-800 mb-1">Admin Reply:</p>
                          <p className="text-sm text-blue-700">{complaint.reply}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => handleLike(complaint._id)}
                      disabled={likedComplaints.has(complaint._id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                        likedComplaints.has(complaint._id)
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {complaint.likes} {complaint.likes === 1 ? 'Like' : 'Likes'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

