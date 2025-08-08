import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/authService';

const EditProfileDetails = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    profile_picture: null
  });
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        profile_picture: null
      });
      if (user.profile_picture) {
        setPreviewImage(user.profile_picture.startsWith('/') 
          ? `http://localhost:8000${user.profile_picture}` 
          : user.profile_picture);
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profile_picture: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Prepare update data
      const updateData = { ...formData };

      // Handle password update
      if (showPasswordSection && passwordData.password) {
        if (passwordData.password !== passwordData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (passwordData.password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }
        updateData.password = passwordData.password;
        updateData.confirmPassword = passwordData.confirmPassword;
      }

      const updatedUser = await updateProfile(updateData);
      updateUser(updatedUser);
      setSuccess('Profile updated successfully!');
      
      // Reset password fields
      setPasswordData({ password: '', confirmPassword: '' });
      setShowPasswordSection(false);
      
      // Navigate back to profile after success
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Hero Section with Modern Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-purple-50">
        {/* Background Decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-violet-300 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-32 right-1/4 w-72 h-72 bg-gradient-to-r from-indigo-300 to-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-8 left-1/4 w-80 h-80 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Edit Profile
            </h1>
            <p className="text-xl text-gray-600">Update your personal information and settings</p>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-sm shadow-2xl overflow-hidden rounded-3xl border border-white/20">
            <div className="px-8 py-8">
              {/* Success Message */}
              {success && (
                <div className="mb-6 rounded-2xl bg-green-50 border border-green-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-green-900">Success!</h3>
                      <p className="text-green-700">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-red-900">Error</h3>
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Profile Picture */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
                  <div className="flex items-center space-x-6">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center relative overflow-hidden border-4 border-white shadow-lg">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <svg className="w-8 h-8 text-violet-300 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          <span className="text-violet-400 text-xs font-medium">No Photo</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="group relative inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-violet-600 bg-white rounded-2xl shadow-lg border-2 border-violet-200 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-violet-300 hover:bg-violet-50 focus:outline-none focus:ring-4 focus:ring-violet-300 cursor-pointer">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        Change Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </label>
                      <p className="mt-2 text-sm text-gray-500">JPG, PNG up to 5MB</p>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-300 shadow-sm focus:ring-4 focus:ring-violet-300 focus:border-violet-500 transition-all duration-300"
                        placeholder="Enter your username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-300 shadow-sm focus:ring-4 focus:ring-violet-300 focus:border-violet-500 transition-all duration-300"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-300 shadow-sm focus:ring-4 focus:ring-violet-300 focus:border-violet-500 transition-all duration-300"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-300 shadow-sm focus:ring-4 focus:ring-violet-300 focus:border-violet-500 transition-all duration-300"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-300 shadow-sm focus:ring-4 focus:ring-violet-300 focus:border-violet-500 transition-all duration-300 resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-2xl border border-gray-300 shadow-sm focus:ring-4 focus:ring-violet-300 focus:border-violet-500 transition-all duration-300"
                          placeholder="Where are you located?"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-2xl border border-gray-300 shadow-sm focus:ring-4 focus:ring-violet-300 focus:border-violet-500 transition-all duration-300"
                          placeholder="https://your-website.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Password</h3>
                    <button
                      type="button"
                      onClick={() => setShowPasswordSection(!showPasswordSection)}
                      className="text-violet-600 hover:text-violet-700 font-medium text-sm"
                    >
                      {showPasswordSection ? 'Cancel Password Change' : 'Change Password'}
                    </button>
                  </div>

                  {showPasswordSection && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-violet-50/50 rounded-2xl border border-violet-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        name="password"
                        value={passwordData.password}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-300 shadow-sm focus:ring-4 focus:ring-violet-300 focus:border-violet-500 transition-all duration-300"
                        placeholder="Enter new password"
                        minLength={8}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-300 shadow-sm focus:ring-4 focus:ring-violet-300 focus:border-violet-500 transition-all duration-300"
                        placeholder="Confirm new password"
                        minLength={8}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">
                        Password must be at least 8 characters long and contain a mix of letters and numbers.
                      </p>
                    </div>
                    </div>
                  )}
                </div>
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:from-violet-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-violet-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Save Changes
                        <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-violet-600 bg-white rounded-2xl shadow-lg border-2 border-violet-200 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-violet-300 hover:bg-violet-50 focus:outline-none focus:ring-4 focus:ring-violet-300"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileDetails;
