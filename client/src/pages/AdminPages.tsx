import { useEffect, useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
import { adminApi } from '../services/api';
import toast from 'react-hot-toast';
import { Users, MapPin, Flag, Star, BarChart3 } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalParking: number;
  pendingReports: number;
  totalReviews: number;
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats().then(result => {
      if (result.success) setStats(result.data as AdminStats);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen"><Navbar /><LoadingState message="Loading admin stats..." /></div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" /> Admin Dashboard
        </h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
            { label: 'Active Parking', value: stats?.totalParking ?? 0, icon: MapPin, color: 'text-green-600 bg-green-50' },
            { label: 'Pending Reports', value: stats?.pendingReports ?? 0, icon: Flag, color: 'text-red-600 bg-red-50' },
            { label: 'Total Reviews', value: stats?.totalReviews ?? 0, icon: Star, color: 'text-yellow-600 bg-yellow-50' },
          ].map(stat => (
            <div key={stat.label} className="card p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Manage Users', href: '/admin/users', icon: Users, description: 'View and manage user accounts' },
            { label: 'Manage Parking', href: '/admin/parking', icon: MapPin, description: 'Review all parking listings' },
            { label: 'Review Reports', href: '/admin/reports', icon: Flag, description: 'Handle user-submitted reports', badge: stats?.pendingReports },
            { label: 'Moderate Reviews', href: '/admin/reviews', icon: Star, description: 'Approve or reject user reviews' },
          ].map(item => (
            <a key={item.label} href={item.href} className="card p-5 hover:shadow-md transition-shadow flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{item.label}</p>
                  {item.badge ? <Badge variant="red">{item.badge}</Badge> : null}
                </div>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <span className="text-gray-400">→</span>
            </a>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getReports().then(result => {
      if (result.success) setReports(result.data as any[]);
    }).finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: string) {
    const result = await adminApi.updateReport(id, { status });
    if (result.success) {
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      toast.success('Status updated');
    }
  }

  const statusColor = (status: string) => {
    if (status === 'pending') return 'yellow';
    if (status === 'resolved') return 'green';
    if (status === 'rejected') return 'red';
    return 'gray';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Reports</h1>
        {loading ? <LoadingState message="Loading reports..." /> : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Parking</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Type</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">Description</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map(report => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-sm truncate max-w-36">
                        {report.parking_locations?.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-400">{new Date(report.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{report.report_type.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusColor(report.status) as any}>{report.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell text-xs max-w-48 truncate">
                      {report.description || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {report.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => updateStatus(report.id, 'resolved')}>Resolve</Button>
                            <Button size="sm" variant="danger" onClick={() => updateStatus(report.id, 'rejected')}>Reject</Button>
                          </>
                        )}
                        {report.status !== 'pending' && (
                          <Button size="sm" variant="secondary" onClick={() => updateStatus(report.id, 'pending')}>Reopen</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getUsers().then(result => {
      if (result.success) setUsers(result.data as any[]);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>
        {loading ? <LoadingState message="Loading users..." /> : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">User</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{user.full_name || 'No name'}</div>
                      <div className="text-xs text-gray-400 font-mono">{user.id.slice(0, 16)}...</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === 'admin' ? 'red' : user.role === 'operator' ? 'blue' : 'gray'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
