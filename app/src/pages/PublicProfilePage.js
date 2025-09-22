import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const PublicProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { isDark } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/profile/${userId}/`, {
          headers
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
        }
        
        const profileData = await response.json();
        setProfile(profileData);
        setIsFollowing(profileData.is_following || false);
        setFollowersCount(profileData.stats?.followers_count || 0);
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch public profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPublicProfile();
    }
  }, [userId]);

  const handleFollowToggle = async () => {
    if (!currentUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/follow/${userId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setIsFollowing(result.following);
        setFollowersCount(prev => result.following ? prev + 1 : prev - 1);
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto rounded-2xl bg-red-50 border border-red-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-red-900">Profile not found</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

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
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          {/* Profile Header */}
          <div className="bg-white/80 backdrop-blur-sm shadow-2xl overflow-hidden rounded-3xl border border-white/20">
            <div className="px-8 py-8">
              <div className="flex flex-col md:flex-row md:items-start">
                <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center relative overflow-hidden border-4 border-white shadow-lg">
                    {profile.user.profile_picture ? (
                      <img
                        src={profile.user.profile_picture.startsWith('/') 
                          ? `${process.env.REACT_APP_MEDIA_URL}${profile.user.profile_picture}` 
                          : profile.user.profile_picture}
                        alt="Profile"
                        className="w-full h-full object-contain rounded-full bg-gray-100"
                      />
                    ) : (
                      <div className="text-center">
                        <svg className="w-12 h-12 text-violet-300 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span className="text-violet-400 text-xs font-medium">No Photo</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    {profile.user.first_name || profile.user.last_name 
                      ? `${profile.user.first_name || ''} ${profile.user.last_name || ''}`.trim()
                      : profile.user.username}
                  </h1>
                  <p className="text-xl text-gray-600 mb-4">@{profile.user.username}</p>
                  
                  <div className="space-y-2 text-gray-700">
                    {profile.user.bio && (
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-violet-500 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                        </svg>
                        <p>{profile.user.bio}</p>
                      </div>
                    )}
                    {profile.user.location && (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-violet-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {profile.user.location}
                      </div>
                    )}
                    {profile.user.website && (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-violet-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                        <a href={profile.user.website} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 font-medium">
                          {profile.user.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-violet-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4M8 7H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2M8 7h8" />
                      </svg>
                      Joined {new Date(profile.user.date_joined).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Follow Button (if not own profile) */}
                  {currentUser && currentUser.id !== profile.user.id && (
                    <div className="mt-6">
                      <button 
                        onClick={handleFollowToggle}
                        className={`group relative inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 ${
                          isFollowing 
                            ? 'text-violet-600 bg-white border-2 border-violet-600 hover:bg-violet-50 focus:ring-violet-300'
                            : 'text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 focus:ring-violet-300'
                        }`}
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          {isFollowing ? (
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          )}
                        </svg>
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className={`${isDark ? 'bg-gray-800/80 border-gray-700/20' : 'bg-white/80 border-white/20'} backdrop-blur-sm rounded-2xl shadow-lg p-6 border`}>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Recipes</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{profile.stats.total_recipes}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Likes</p>
                  <p className="text-2xl font-bold text-gray-900">{profile.stats.total_likes}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{profile.stats.average_rating}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Followers</p>
                  <p className="text-2xl font-bold text-gray-900">{followersCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Recipes Section */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center mb-16">
          <h2 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            Recent <span className="text-violet-600">Recipes</span>
          </h2>
          <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Discover the latest creations from {profile.user.first_name || profile.user.username}
          </p>
        </div>
        
        {profile.recent_recipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {profile.recent_recipes.map((recipe) => (
              <Link key={recipe.id} to={`/recipes/${recipe.id}`} className="group block">
                <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-3xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl border`}>
                  <div className="relative overflow-hidden">
                    {recipe.image ? (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-56 bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                        <div className="text-center">
                          <svg className="w-12 h-12 text-violet-300 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-violet-400 font-medium">Recipe Image</span>
                        </div>
                      </div>
                    )}
                    {/* Floating Badge */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-xs font-semibold text-gray-700">{recipe.average_rating || '0.0'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 group-hover:text-violet-600 transition-colors duration-300`}>
                      {recipe.title}
                    </h3>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 line-clamp-2`}>
                      {recipe.description?.substring(0, 100) || 'Delicious recipe waiting for you to discover'}...
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{recipe.likes_count || 0}</span>
                      </div>
                      
                      <div className="flex items-center text-violet-600 group-hover:text-violet-700 font-medium">
                        <span className="text-sm mr-1">View Recipe</span>
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Recipe details */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Prep: {recipe.prep_time || 0} mins | Cook: {recipe.cook_time || 0} mins
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                          {recipe.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-24 w-24 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className={`mt-4 text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>No recipes yet</h3>
            <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-md mx-auto`}>
              {profile.user.first_name || profile.user.username} hasn't shared any recipes yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfilePage;
