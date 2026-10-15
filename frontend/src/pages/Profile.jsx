import { useState, useEffect } from 'react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import {
  FiUser,
  FiMail,
  FiLock,
  FiCamera,
  FiSave,
  FiShield,
  FiCheckCircle,
  FiKey,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
  }, [user]);

  const handleNameSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required');
    setSavingName(true);
    try {
      const { data } = await api.put('/profile', { name });
      updateUser(data.user);
      toast.success('Profile name updated successfully');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSavingName(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) {
      return toast.error('All fields are required');
    }
    if (passwords.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }
    if (passwords.newPassword !== passwords.confirm) {
      return toast.error('Passwords do not match');
    }

    setSavingPassword(true);
    try {
      await api.put('/profile/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('profilePicture', file);
      const { data } = await api.post('/profile/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.user);
      toast.success('Profile avatar updated');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Profile Header Card */}
      <div className="card !p-6 sm:!p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar with Camera badge */}
          <div className="relative group">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-blue-500/20 shadow-md group-hover:opacity-90 transition"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-extrabold ring-4 ring-blue-500/20 shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}

            <label
              className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2.5 rounded-xl cursor-pointer hover:bg-blue-700 shadow-lg active:scale-95 transition-all"
              title="Change Profile Picture"
            >
              <FiCamera size={16} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {user?.name}
              </h2>
              <span className="badge-emerald text-xs">
                <FiCheckCircle size={12} /> Active Account
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">{user?.email}</p>
            {uploading && (
              <p className="text-xs text-blue-600 font-semibold mt-2 animate-pulse">
                Uploading new avatar...
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Details Form */}
        <div className="card">
          <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FiUser size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Personal Information</h3>
              <p className="text-xs text-slate-500">Update your account name</p>
            </div>
          </div>

          <form onSubmit={handleNameSave} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input input-icon-left"
                  maxLength={50}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Registered Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input input-icon-left bg-slate-100/70 text-slate-500 cursor-not-allowed border-slate-200"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Account email address is permanently tied to this workspace.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-primary w-full sm:w-auto"
                disabled={savingName}
              >
                {savingName ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <FiSave size={16} /> Save Changes
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <FiKey size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Security & Password</h3>
                <p className="text-xs text-slate-500">Keep your account secure</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              {showPasswords ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              <span>{showPasswords ? 'Hide' : 'Show'}</span>
            </button>
          </div>

          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, currentPassword: e.target.value })
                  }
                  className="input input-icon-left"
                  placeholder="Enter current password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPassword: e.target.value })
                  }
                  className="input input-icon-left"
                  placeholder="Min. 6 characters"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Confirm New Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  className="input input-icon-left"
                  placeholder="Re-enter new password"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-primary w-full sm:w-auto"
                disabled={savingPassword}
              >
                {savingPassword ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <FiShield size={16} /> Update Password
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;