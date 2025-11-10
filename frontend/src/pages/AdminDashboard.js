import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminComplaints,
  updateComplaintStatus,
  addComplaintReply,
  getAdminStats,
  setAuthToken
} from '../utils/api';
import { showNotification } from '../utils/notifications';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('likes');
  const [search, setSearch] = useState('');
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      navigate('/admin/login');
      return;
    }
    setAdmin(JSON.parse(adminData));
  }, [navigate]);

  useEffect(() => {
    if (admin) {
      fetchComplaints();
      fetchStats();
    }
  }, [admin, sortBy, search]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await getAdminComplaints(sortBy, search);
      setComplaints(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setAuthToken(null);
        navigate('/admin/login');
      } else {
        showNotification('Failed to load complaints', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getAdminStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await updateComplaintStatus(complaintId, newStatus);
      showNotification('Status updated successfully', 'success');
      fetchComplaints();
      fetchStats();
    } catch (error) {
      showNotification('Failed to update status', 'error');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      showNotification('Please enter a reply', 'error');
      return;
    }

    try {
      await addComplaintReply(selectedComplaint._id, replyText);
      showNotification('Reply added successfully', 'success');
      setShowReplyModal(false);
      setReplyText('');
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error) {
      showNotification('Failed to add reply', 'error');
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('admin');
    navigate('/admin/login');
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

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Department: {admin.department} | Welcome, {admin.name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Logout
            </button>
          </div>

          {stats && (
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Complaints</p>
                <p className="text-2xl font-bold text-blue-800">{stats.totalComplaints}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Total Likes</p>
                <p className="text-2xl font-bold text-green-800">{stats.totalLikes}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Status Distribution</p>
                <div className="mt-2 space-y-1">
                  {stats.statusDistribution.map((stat) => (
                    <div key={stat._id} className="text-sm">
                      <span className="font-medium">{stat._id}:</span> {stat.count}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800"
              >
                <option value="likes">Most Liked</option>
                <option value="date">Latest First</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Complaints
              </label>
              <input
                type="text"
                placeholder="Search by keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No complaints found
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
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        {complaint.ticketId && (
                          <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {complaint.ticketId}
                          </span>
                        )}
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-600">
                          {complaint.likes} {complaint.likes === 1 ? 'Like' : 'Likes'}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                        {complaint.message}
                      </p>
                      {complaint.reply && (
                        <div className="mt-3 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                          <p className="text-sm font-semibold text-green-800 mb-1">Your Reply:</p>
                          <p className="text-sm text-green-700">{complaint.reply}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <select
                      value={complaint.status}
                      onChange={(e) => handleStatusUpdate(complaint._id, e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                    <button
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setReplyText(complaint.reply || '');
                        setShowReplyModal(true);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                      {complaint.reply ? 'Edit Reply' : 'Add Reply'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">Add Reply</h2>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your reply..."
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyText('');
                  setSelectedComplaint(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Save Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

