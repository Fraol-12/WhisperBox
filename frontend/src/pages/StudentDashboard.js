import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getComplaints, likeComplaint } from '../utils/api';
import { showNotification } from '../utils/notifications';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';

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
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const FILE_BASE = API_BASE.replace(/\/api$/, '');

  useEffect(() => {
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
      
      setComplaints(complaints.map(c => 
        c._id === complaintId ? { ...c, likes: c.likes + 1 } : c
      ));
      
      showNotification('Complaint liked!', 'success');
    } catch (error) {
      showNotification(error.response?.data?.error || 'Failed to like complaint', 'error');
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50 py-8 px-4 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <Card className="animate-fade-in-up" padding="lg" hover={false}>
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/')}
              className="text-primary-600 hover:text-primary-700 font-medium mb-6 inline-flex items-center group transition-colors"
              aria-label="Back to home"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-2">
              Student Dashboard
            </h1>
            <p className="text-secondary-600">
              View and interact with complaints from your campus
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Select Department"
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                options={departments.map(dept => ({ value: dept, label: dept }))}
                placeholder="Select department"
              />

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
            </div>

            <Input
              label="Search Complaints"
              id="search"
              type="text"
              placeholder="Search by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Content */}
          {!department ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-secondary-500 text-lg">Please select a department to view complaints</p>
            </div>
          ) : loading ? (
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
              <p className="text-secondary-500 text-lg">No complaints found for this department</p>
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
                              alt={`Complaint photo ${idx + 1}`}
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
                      <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                        <p className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Admin Reply
                        </p>
                        <p className="text-sm text-green-700 leading-relaxed">{complaint.reply}</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
                      <div className="text-sm text-secondary-500">
                        {complaint.likes} {complaint.likes === 1 ? 'Like' : 'Likes'}
                      </div>
                      <Button
                        onClick={() => handleLike(complaint._id)}
                        disabled={likedComplaints.has(complaint._id)}
                        variant={likedComplaints.has(complaint._id) ? 'ghost' : 'primary'}
                        size="sm"
                        className="gap-2"
                      >
                        <svg 
                          className={`w-5 h-5 ${likedComplaints.has(complaint._id) ? 'fill-red-500 text-red-500' : ''}`}
                          fill={likedComplaints.has(complaint._id) ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {likedComplaints.has(complaint._id) ? 'Liked' : 'Like'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
