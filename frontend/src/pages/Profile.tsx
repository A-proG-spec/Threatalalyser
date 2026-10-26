// src/pages/Profile.tsx
import { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Modal } from '../components/ui/Modal';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { AxiosError } from 'axios';
import { 
  Edit2, Key, Mail, User as UserIcon, 
  LogOut, ShieldAlert, Calendar, Hash 
} from 'lucide-react';

export function Profile() {
  const { user, login, logout } = useAuth(); 
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase();
  
  const joinedDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await authApi.updateProfile({ name, email });
      const token = localStorage.getItem('threatlens_token') || '';
      login(token, res.user);
      setMsg({ type: 'success', text: 'Profile details updated.' });
      setIsEditProfileOpen(false);
    } catch (err: unknown) {
      const error = err as AxiosError<{ error: { message: string } }>;
      setMsg({ type: 'error', text: error.response?.data?.error?.message || 'Update failed' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMsg({ type: '', text: '' });
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setMsg({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setIsPasswordOpen(false);
    } catch (err: unknown) {
      const error = err as AxiosError<{ error: { message: string } }>;
      setMsg({ type: 'error', text: error.response?.data?.error?.message || 'Password change failed' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <PageWrapper showGlow={false}>
      <div className="max-w-3xl mx-auto mt-12 px-4">
        
        <h1 className="text-3xl font-semibold mb-8">Account Settings</h1>

        {/* ── Profile Header ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-12">
          {/* Circle Avatar (Kept round as requested) */}
          <div className="w-32 h-32 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-5xl font-bold text-white shadow-xl shadow-blue-500/20">
            {initial}
          </div>
          
          {/* Name & Email & Details */}
          <div className="flex flex-col flex-1">
            <h2 className="text-3xl font-semibold text-white mb-1">
              {user?.name || 'Anonymous User'}
            </h2>
            <p className="text-gray-400 flex items-center gap-2 text-base mb-4">
              <Mail className="w-5 h-5" /> {user?.email}
            </p>
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Joined {joinedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Hash className="w-4 h-4" /> ID: {user?.id.slice(0, 8)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Action Buttons (Sharp Corners) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <button 
            onClick={() => setIsEditProfileOpen(true)} 
            className="flex items-center justify-center gap-2 bg-[#111] hover:bg-[#222] text-white px-6 py-4 text-sm font-medium transition-colors border border-[#222]"
          >
            <Edit2 className="w-4 h-4" /> Edit Profile
          </button>
          
          <button 
            onClick={() => setIsPasswordOpen(true)} 
            className="flex items-center justify-center gap-2 bg-[#111] hover:bg-[#222] text-white px-6 py-4 text-sm font-medium transition-colors border border-[#222]"
          >
            <Key className="w-4 h-4" /> Update Password
          </button>

          <button 
            onClick={() => setIsLogoutOpen(true)} 
            className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-6 py-4 text-sm font-medium transition-colors border border-red-500/20"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Status Message */}
        {msg.text && (
          <div className={`p-4 text-sm ${msg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {msg.text}
          </div>
        )}

      </div>

      {/* ── Edit Profile Modal ── */}
      <Modal 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)} 
        title="Edit Profile"
      >
        <form onSubmit={handleProfile} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-bold">Display Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full bg-[#111] pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500 transition-shadow" 
                placeholder="Your name"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-bold">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-[#111] pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500 transition-shadow" 
                placeholder="your@email.com"
              />
            </div>
          </div>
          <button type="submit" disabled={isUpdating} className="mt-2 w-full py-2.5 bg-white text-black font-medium text-sm hover:bg-gray-200 disabled:opacity-50 transition-colors">
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </Modal>

      {/* ── Update Password Modal ── */}
      <Modal 
        isOpen={isPasswordOpen} 
        onClose={() => setIsPasswordOpen(false)} 
        title="Update Password"
      >
        <form onSubmit={handlePassword} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-bold">Current Password</label>
            <input 
              type="password" 
              value={currentPassword} 
              onChange={e => setCurrentPassword(e.target.value)} 
              className="w-full bg-[#111] px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500 transition-shadow" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-bold">New Password</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              className="w-full bg-[#111] px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500 transition-shadow" 
              required 
              minLength={8}
            />
          </div>
          <button type="submit" disabled={isUpdating} className="mt-2 w-full py-2.5 bg-white text-black font-medium text-sm hover:bg-gray-200 disabled:opacity-50 transition-colors">
            {isUpdating ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </Modal>

      {/* ── Logout Confirmation Modal ── */}
      <Modal 
        isOpen={isLogoutOpen} 
        onClose={() => setIsLogoutOpen(false)} 
        title="Log Out"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-red-500/10 flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-gray-300 mb-6 text-sm">
            Are you sure you want to log out? You will need to sign in again to access your investigation history.
          </p>
          <div className="flex gap-3 w-full">
            <button 
              onClick={() => setIsLogoutOpen(false)}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-[#111] hover:bg-[#222] transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={logout}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              Yes, Log Out
            </button>
          </div>
        </div>
      </Modal>

    </PageWrapper>
  );
}