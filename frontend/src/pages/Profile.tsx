// src/pages/Profile.tsx
import { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { AxiosError } from 'axios'; // Import AxiosError for proper typing

export function Profile() {
  const { user, login } = useAuth(); 
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await authApi.updateProfile({ name, email });
      const token = localStorage.getItem('threatlens_token') || '';
      login(token, res.user);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: unknown) {
      // Properly type the error response
      const error = err as AxiosError<{ error: { message: string } }>;
      setMsg({ type: 'error', text: error.response?.data?.error?.message || 'Failed to update profile' });
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
      setMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: unknown) {
      // Properly type the error response
      const error = err as AxiosError<{ error: { message: string } }>;
      setMsg({ type: 'error', text: error.response?.data?.error?.message || 'Failed to change password' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <PageWrapper showGlow={false}>
      <div className="max-w-2xl mx-auto mt-12">
        <h1 className="text-3xl font-semibold mb-2">Profile Settings</h1>
        <p className="text-gray-500 mb-8">Manage your account details and security.</p>
        
        {msg.text && (
          <div className={`p-4 mb-8 rounded-lg ${msg.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {msg.text}
          </div>
        )}

        {/* Profile Details Form */}
        <div className="mb-12">
          <h2 className="text-xl font-medium mb-4 text-gray-300">Update Details</h2>
          <form onSubmit={handleProfile} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full bg-[#111] p-4 rounded-lg text-white outline-none focus:ring-1 focus:ring-gray-700" 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-[#111] p-4 rounded-lg text-white outline-none focus:ring-1 focus:ring-gray-700" 
              />
            </div>
            <Button type="submit" isLoading={isUpdating} className="self-start mt-2">
              Save Profile
            </Button>
          </form>
        </div>

        <div className="h-px bg-[#222] w-full mb-12" />

        {/* Password Form */}
        <div>
          <h2 className="text-xl font-medium mb-4 text-gray-300">Change Password</h2>
          <form onSubmit={handlePassword} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Current Password</label>
              <input 
                type="password" 
                value={currentPassword} 
                onChange={e => setCurrentPassword(e.target.value)} 
                className="w-full bg-[#111] p-4 rounded-lg text-white outline-none focus:ring-1 focus:ring-gray-700" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">New Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                className="w-full bg-[#111] p-4 rounded-lg text-white outline-none focus:ring-1 focus:ring-gray-700" 
                required 
                minLength={8}
              />
            </div>
            <Button type="submit" isLoading={isUpdating} className="self-start mt-2">
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}