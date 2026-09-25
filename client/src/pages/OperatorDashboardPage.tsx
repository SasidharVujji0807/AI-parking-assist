import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, ParkingSquare, Eye, EyeOff } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { operatorApi } from '../services/api';
import { formatPrice, formatAvailability } from '../utils/format';
import toast from 'react-hot-toast';
import type { ParkingLocation } from '../types';

export function OperatorDashboardPage() {
  const [parking, setParking] = useState<ParkingLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    operatorApi.getParking().then(result => {
      if (result.success) setParking(result.data as ParkingLocation[]);
    }).finally(() => setLoading(false));
  }, []);

  async function deleteParking(id: string) {
    if (!confirm('Deactivate this parking location?')) return;
    const result = await operatorApi.deleteParking(id);
    if (result.success) {
      setParking(prev => prev.filter(p => p.id !== id));
      toast.success('Parking deactivated');
    } else {
      toast.error('Failed to deactivate');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Operator Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your parking locations</p>
          </div>
          <Link to="/operator/parking/new">
            <Button icon={<Plus className="w-4 h-4" />}>Add Parking</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Listings', value: parking.length },
            { label: 'Active', value: parking.filter(p => p.is_active).length },
            { label: 'Available', value: parking.filter(p => p.availability_status === 'available').length },
            { label: 'Avg Rating', value: parking.length > 0 ? (parking.reduce((s, p) => s + (p.rating || 0), 0) / parking.length).toFixed(1) : '—' },
          ].map(stat => (
            <div key={stat.label} className="card p-4 text-center">
              <p className="text-2xl font-bold text-primary-600">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <LoadingState message="Loading your parking..." />
        ) : parking.length === 0 ? (
          <EmptyState
            icon={ParkingSquare}
            title="No parking locations yet"
            description="Add your first parking location to start accepting drivers."
            action={<Link to="/operator/parking/new"><Button>Add Your First Parking</Button></Link>}
          />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden sm:table-cell">City</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">Price</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parking.map(p => {
                  const avail = formatAvailability(p.availability_status);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 truncate max-w-48">{p.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{p.parking_type}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{p.city || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                        {formatPrice(p.price, p.currency, p.pricing_unit)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={p.is_active ? avail.color : 'gray'}>
                          {p.is_active ? avail.label : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/parking/${p.id}`}>
                            <button className="text-gray-400 hover:text-gray-600" title="View">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          <Link to={`/operator/parking/${p.id}/edit`}>
                            <button className="text-blue-400 hover:text-blue-600" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => deleteParking(p.id)}
                            className="text-red-400 hover:text-red-600"
                            title="Deactivate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
