import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitComplaint } from '../utils/api';
import { showNotification } from '../utils/notifications';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Spinner from '../components/ui/Spinner';

const StudentSubmission = () => {
  const navigate = useNavigate();
  const [department, setDepartment] = useState('');
  const [message, setMessage] = useState('');
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const departments = ['Café', 'IT', 'Library', 'Dorm', 'Registrar'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!department || !message.trim()) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await submitComplaint(department, message, photos);
      showNotification(
        `Complaint submitted successfully! Ticket ID: ${response.data.ticketId}`,
        'success'
      );
      setTimeout(() => {
        navigate('/student/dashboard', { state: { department } });
      }, 1500);
    } catch (error) {
      showNotification(
        error.response?.data?.error || 'Failed to submit complaint',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const onFilesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const filtered = selected.slice(0, 4).filter(f => f.size <= 5 * 1024 * 1024);
    
    if (selected.length > 4) {
      showNotification('You can upload up to 4 images', 'warning');
    }
    if (filtered.length !== selected.length) {
      showNotification('Some files were too large (max 5MB each)', 'warning');
    }
    
    setPhotos(filtered);
    
    // Create previews
    const previews = filtered.map(file => URL.createObjectURL(file));
    setPhotoPreviews(previews);
  };

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
    
    // Revoke object URLs to prevent memory leaks
    URL.revokeObjectURL(photoPreviews[index]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50 py-8 px-4 animate-fade-in">
      <div className="max-w-3xl mx-auto">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-2">
                  Submit a Complaint
                </h1>
                <p className="text-secondary-600">
                  Your complaint will be submitted anonymously
                </p>
              </div>
              <Button
                onClick={() => navigate('/student/dashboard')}
                variant="outline"
                size="md"
                className="sm:w-auto w-full"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Dashboard
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Select
              label="Department"
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={departments.map(dept => ({ value: dept, label: dept }))}
              placeholder="Select a department"
              required
            />

            <Textarea
              label="Complaint Details"
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your complaint in detail. Be specific about the issue, location, and any relevant information..."
              rows={8}
              required
            />

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Photos (optional, up to 4 images)
              </label>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onFilesChange}
                    className="block w-full text-sm text-secondary-600
                               file:mr-4 file:py-3 file:px-6
                               file:rounded-lg file:border-0
                               file:text-sm file:font-semibold
                               file:bg-primary-50 file:text-primary-700
                               hover:file:bg-primary-100
                               file:transition-colors file:cursor-pointer
                               cursor-pointer"
                    disabled={photos.length >= 4}
                  />
                  <p className="mt-2 text-xs text-secondary-500">
                    Maximum 4 images, 5MB each. Supported formats: JPG, PNG, GIF, WebP
                  </p>
                </div>

                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {photoPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-secondary-200 hover:border-primary-400 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                          aria-label={`Remove photo ${index + 1}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                loading={loading}
                fullWidth
                size="lg"
              >
                {!loading && (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                Submit Complaint
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default StudentSubmission;
