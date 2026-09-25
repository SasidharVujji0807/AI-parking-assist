import { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Shield } from 'lucide-react';

export function ProfilePage() {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const result = await authApi.updateProfile({ full_name: fullName });
    setSaving(false);
    if (result.success) {
      toast.success('Profile updated!');
    } else {
      toast.error('Failed to update profile');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>

        <div className="card p-6 space-y-4">
          {/* Account info */}
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{profile?.full_name || 'No name set'}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />{user?.email}
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1 capitalize">
                <Shield className="w-3 h-3" />{user?.role} account
              </p>
            </div>
          </div>

          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
          />

          <Button onClick={save} loading={saving}>Save Changes</Button>
        </div>

        {/* Account details */}
        <div className="card p-6 mt-4">
          <h2 className="font-semibold text-gray-900 mb-3">Account Details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">User ID</dt>
              <dd className="text-gray-700 font-mono text-xs">{user?.id?.slice(0, 16)}...</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Account Type</dt>
              <dd className="text-gray-700 capitalize">{user?.role}</dd>
            </div>
          </dl>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export function DashboardPage() {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-500 mt-1">Here's an overview of your ParkAI account.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Saved Parking', href: '/favorites', icon: '❤️' },
            { label: 'Search History', href: '/history', icon: '🕐' },
            { label: 'AI Assistant', href: '/assistant', icon: '🤖' },
            { label: 'Find Parking', href: '/search', icon: '🔍' },
          ].map(item => (
            <a key={item.label} href={item.href} className="card p-4 hover:shadow-md transition-shadow text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <p className="font-medium text-gray-900">{item.label}</p>
            </a>
          ))}
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <a href="/search" className="btn-primary text-sm py-2 px-4 rounded-lg">Search for Parking</a>
            <a href="/assistant" className="btn-secondary text-sm py-2 px-4 rounded-lg">Ask AI Assistant</a>
            <a href="/profile" className="btn-secondary text-sm py-2 px-4 rounded-lg">Edit Profile</a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
