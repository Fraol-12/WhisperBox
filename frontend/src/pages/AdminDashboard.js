import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminComplaints,
  updateComplaintStatus,
  addComplaintReply,
  getAdminStats,
  setAuthToken
} from '../utils/api';
import { showNotification } from '../utils/notifications';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';

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

  // Fetch complaints and stats when admin is available or when filters change.
  // Wrap fetch functions with useCallback so they can be safely added to the effect deps.
  const fetchComplaints = useCallback(async () => {
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
  }, [sortBy, search, navigate]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await getAdminStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  useEffect(() => {
    if (admin) {
      fetchComplaints();
      fetchStats();
    }
  }, [admin, fetchComplaints, fetchStats]);

  // NOTE: fetchComplaints and fetchStats are defined above using useCallback

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return <Badge variant="success">{status}</Badge>;
      case 'In Progress':
        return <Badge variant="warning">{status}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const FILE_BASE = API_BASE.replace(/\/api$/, '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-secondary-100 py-8 px-4 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="animate-fade-in-up" padding="lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-secondary-600">
                <span className="font-medium">Department:</span> {admin.department} | <span className="font-medium">Welcome,</span> {admin.name}
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="danger"
              size="md"
              className="sm:w-auto w-full"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </Button>
          </div>
        </Card>

        {/* Stats Cards */}
        {stats && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white" padding="md" hover>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-100 text-sm font-medium mb-1">Total Complaints</p>
                  <p className="text-3xl font-bold">{stats.totalComplaints}</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white" padding="md" hover>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Total Likes</p>
                  <p className="text-3xl font-bold">{stats.totalLikes}</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white sm:col-span-2 lg:col-span-1" padding="md" hover>
              <div>
                <p className="text-purple-100 text-sm font-medium mb-3">Status Distribution</p>
                <div className="space-y-2">
                  {stats.statusDistribution.map((stat) => (
                    <div key={stat._id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{stat._id}</span>
                      <span className="text-lg font-bold">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Main Content Card */}
        <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }} padding="lg">
          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Sort By"
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: 'likes', label: 'Most Liked' },
                  { value: 'date', label: 'Latest First' },
                ]}
              />

              <Input
                label="Search Complaints"
                id="search"
                type="text"
                placeholder="Search by keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Complaints List */}
          {loading ? (
            <div className="py-16">
              <Spinner size="lg" className="mx-auto" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-secondary-500 text-lg">No complaints found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {complaints.map((complaint, index) => (
                <Card
                  key={complaint._id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  hover
                  padding="md"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-3">
                      {complaint.ticketId && (
                        <Badge variant="primary" size="md" className="font-mono">
                          {complaint.ticketId}
                        </Badge>
                      )}
                      {getStatusBadge(complaint.status)}
                      <span className="text-sm text-secondary-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(complaint.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <span className="text-sm text-secondary-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {complaint.likes} {complaint.likes === 1 ? 'Like' : 'Likes'}
                      </span>
                    </div>

                    {/* Message */}
                    <p className="text-secondary-700 leading-relaxed whitespace-pre-wrap">
                      {complaint.message}
                    </p>

                    {/* Photos */}
                    {Array.isArray(complaint.photos) && complaint.photos.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {complaint.photos.map((photo, idx) => (
                          <a
                            key={idx}
                            href={`${FILE_BASE}${photo}`}
                            target="_blank"
                            rel="noreferrer"
                            className="group relative block overflow-hidden rounded-lg border-2 border-secondary-200 hover:border-primary-400 transition-colors"
                          >
                                <img
                                  src={`${FILE_BASE}${photo}`}
                                  alt={`Evidence ${idx + 1}`}
                                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                              <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Admin Reply */}
                    {complaint.reply && (
                      <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                        <p className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Your Reply
                        </p>
                        <p className="text-sm text-green-700 leading-relaxed">{complaint.reply}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-secondary-200">
                      <Select
                        id={`status-${complaint._id}`}
                        value={complaint.status}
                        onChange={(e) => handleStatusUpdate(complaint._id, e.target.value)}
                        options={[
                          { value: 'Pending', label: 'Pending' },
                          { value: 'In Progress', label: 'In Progress' },
                          { value: 'Resolved', label: 'Resolved' },
                        ]}
                        className="flex-1 min-w-[150px]"
                      />
                      <Button
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setReplyText(complaint.reply || '');
                          setShowReplyModal(true);
                        }}
                        variant="primary"
                        size="md"
                        className="gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {complaint.reply ? 'Edit Reply' : 'Add Reply'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Reply Modal */}
      <Modal
        isOpen={showReplyModal}
        onClose={() => {
          setShowReplyModal(false);
          setReplyText('');
          setSelectedComplaint(null);
        }}
        title="Add Reply"
        size="md"
      >
        <div className="space-y-4">
          {selectedComplaint && (
            <div className="p-3 bg-secondary-50 rounded-lg">
              <p className="text-sm text-secondary-600 mb-1">Complaint:</p>
              <p className="text-sm text-secondary-700 line-clamp-2">{selectedComplaint.message}</p>
            </div>
          )}
          <Textarea
            label="Your Reply"
            id="reply"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Enter your reply to this complaint..."
            rows={6}
            required
          />
          <div className="flex gap-3 justify-end pt-4">
            <Button
              onClick={() => {
                setShowReplyModal(false);
                setReplyText('');
                setSelectedComplaint(null);
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReply}
              variant="primary"
            >
              Save Reply
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
