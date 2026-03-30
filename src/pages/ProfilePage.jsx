// src/pages/ProfilePage.jsx
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';

const ProfilePage = () => {
  const { user } = useAuth();
  const {
    updateDisplayName,
    uploadAvatar,
    changePassword,
    nameLoading,
    avatarLoading,
    passwordLoading,
  } = useProfile();

  // Display Name section
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [nameSuccess, setNameSuccess] = useState('');
  const [nameError, setNameError] = useState('');

  // Avatar section
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [avatarSuccess, setAvatarSuccess] = useState('');
  const [avatarError, setAvatarError] = useState('');

  // Password section
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Clear messages when user changes
  useEffect(() => {
    setDisplayName(user?.displayName || '');
  }, [user?.displayName]);

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    setNameSuccess('');
    setNameError('');

    const result = await updateDisplayName(displayName);
    if (result.success) {
      setNameSuccess('Name updated!');
    } else {
      setNameError(result.error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarSuccess('');
    setAvatarError('');

    // Client-side validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setAvatarError('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      return;
    }

    // Allow up to 10MB (will be compressed before upload)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setAvatarError('File size exceeds 10MB limit.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) return;

    setAvatarSuccess('');
    setAvatarError('');

    const result = await uploadAvatar(selectedFile);
    if (result.success) {
      setAvatarSuccess('Avatar updated!');
      setSelectedFile(null);
      setPreviewUrl(null);
    } else {
      setAvatarError(result.error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    // Client-side validation
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    const result = await changePassword(currentPassword, newPassword);
    if (result.success) {
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError(result.error);
    }
  };

  // Get avatar display
  const getAvatarDisplay = () => {
    const photoURL = previewUrl || user?.photoURL;
    if (photoURL) {
      return (
        <img
          src={photoURL}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
        />
      );
    }
    // Fallback to initials
    const initial = user?.email?.charAt(0).toUpperCase() || '?';
    return (
      <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
        {initial}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>

          {/* Section 1 — Display Name */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Display Name</h2>
            <form onSubmit={handleNameSubmit}>
              <div className="mb-3">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={nameLoading || !displayName.trim()}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {nameLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Name'
                )}
              </button>
              {nameSuccess && (
                <p className="mt-2 text-sm text-green-600">{nameSuccess}</p>
              )}
              {nameError && (
                <p className="mt-2 text-sm text-red-600">{nameError}</p>
              )}
            </form>
          </div>

          <hr className="border-gray-200 my-6" />

          {/* Section 2 — Profile Photo */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Photo</h2>
            <div className="flex items-center gap-4 mb-4">
              {getAvatarDisplay()}
              <div className="flex-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-4 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Choose Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>
            {selectedFile && (
              <button
                onClick={handleAvatarUpload}
                disabled={avatarLoading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {avatarLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  'Upload Photo'
                )}
              </button>
            )}
            {avatarSuccess && (
              <p className="mt-2 text-sm text-green-600">{avatarSuccess}</p>
            )}
            {avatarError && (
              <p className="mt-2 text-sm text-red-600">{avatarError}</p>
            )}
          </div>

          <hr className="border-gray-200 my-6" />

          {/* Section 3 — Change Password */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h2>
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={
                  passwordLoading ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {passwordLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
              {passwordSuccess && (
                <p className="mt-2 text-sm text-green-600">{passwordSuccess}</p>
              )}
              {passwordError && (
                <p className="mt-2 text-sm text-red-600">{passwordError}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
