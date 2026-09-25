import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { operatorApi, parkingApi } from '../services/api';
import toast from 'react-hot-toast';
import type { ParkingLocation } from '../types';

const PARKING_TYPES = [
  { value: 'garage', label: 'Garage' },
  { value: 'lot', label: 'Parking Lot' },
  { value: 'street', label: 'Street Parking' },
  { value: 'mall', label: 'Mall Parking' },
  { value: 'public', label: 'Public Parking' },
  { value: 'private', label: 'Private Parking' },
  { value: 'airport', label: 'Airport' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'office', label: 'Office' },
  { value: 'residential', label: 'Residential' },
  { value: 'valet', label: 'Valet' },
];

const PRICING_UNITS = [
  { value: 'hour', label: 'Per Hour' },
  { value: 'day', label: 'Per Day' },
  { value: 'month', label: 'Per Month' },
  { value: 'flat', label: 'Flat Rate' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'limited', label: 'Limited' },
  { value: 'full', label: 'Full' },
  { value: 'unknown', label: 'Unknown' },
  { value: 'closed', label: 'Closed' },
];

const ALL_AMENITIES = [
  'ev_charging', 'security', 'cctv', 'covered', 'accessible',
  'restroom', 'valet', 'lighting', 'car_wash',
];

const ALL_VEHICLES = ['car', 'motorcycle', 'suv', 'van', 'ev'];

export function ParkingFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    latitude: '',
    longitude: '',
    parking_type: 'lot',
    vehicle_types: [] as string[],
    amenities: [] as string[],
    total_spaces: '',
    available_spaces: '',
    availability_status: 'unknown',
    price: '',
    currency: 'INR',
    pricing_unit: 'hour',
    is_24_7: false,
    opening_time: '',
    closing_time: '',
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    parkingApi.getById(id!).then(result => {
      if (result.success) {
        const p = result.data as ParkingLocation;
        setForm({
          name: p.name,
          description: p.description || '',
          address: p.address,
          city: p.city || '',
          state: p.state || '',
          postal_code: p.postal_code || '',
          latitude: String(p.latitude),
          longitude: String(p.longitude),
          parking_type: p.parking_type,
          vehicle_types: p.vehicle_types,
          amenities: p.amenities,
          total_spaces: p.total_spaces ? String(p.total_spaces) : '',
          available_spaces: p.available_spaces !== undefined ? String(p.available_spaces) : '',
          availability_status: p.availability_status,
          price: p.price ? String(p.price) : '',
          currency: p.currency,
          pricing_unit: p.pricing_unit || 'hour',
          is_24_7: p.is_24_7,
          opening_time: p.opening_time || '',
          closing_time: p.closing_time || '',
        });
      }
    }).finally(() => setLoading(false));
  }, [id, isEdit]);

  function toggleArray(key: 'amenities' | 'vehicle_types', value: string) {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.latitude || !form.longitude) {
      toast.error('Please enter coordinates');
      return;
    }
    setSaving(true);

    const payload = {
      name: form.name,
      description: form.description || undefined,
      address: form.address,
      city: form.city || undefined,
      state: form.state || undefined,
      postal_code: form.postal_code || undefined,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      parking_type: form.parking_type,
      vehicle_types: form.vehicle_types,
      amenities: form.amenities,
      total_spaces: form.total_spaces ? parseInt(form.total_spaces) : undefined,
      available_spaces: form.available_spaces ? parseInt(form.available_spaces) : undefined,
      availability_status: form.availability_status,
      price: form.price ? parseFloat(form.price) : undefined,
      currency: form.currency,
      pricing_unit: form.pricing_unit || undefined,
      is_24_7: form.is_24_7,
      opening_time: form.is_24_7 ? undefined : form.opening_time || undefined,
      closing_time: form.is_24_7 ? undefined : form.closing_time || undefined,
    };

    let result;
    if (isEdit) {
      result = await operatorApi.updateParking(id!, payload);
    } else {
      result = await operatorApi.createParking(payload);
    }

    setSaving(false);

    if (result.success) {
      toast.success(isEdit ? 'Parking updated!' : 'Parking created!');
      navigate('/operator');
    } else {
      toast.error((result.error as { message: string }).message || 'Failed to save');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="py-12 text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEdit ? 'Edit Parking Location' : 'Add New Parking Location'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Basic Information</h2>
            <Input label="Parking Name *" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Nariman Point Multi-Level Parking" required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="input-base resize-none"
                rows={3}
                value={form.description}
                onChange={e => setForm(p => ({...p, description: e.target.value}))}
                placeholder="Describe this parking location..."
              />
            </div>
            <Select label="Parking Type *" value={form.parking_type} onChange={e => setForm(p => ({...p, parking_type: e.target.value}))} options={PARKING_TYPES} />
          </div>

          {/* Location */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Location</h2>
            <Input label="Address *" value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} placeholder="Full street address" required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" value={form.city} onChange={e => setForm(p => ({...p, city: e.target.value}))} placeholder="Mumbai" />
              <Input label="State" value={form.state} onChange={e => setForm(p => ({...p, state: e.target.value}))} placeholder="Maharashtra" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Latitude *" type="number" step="any" value={form.latitude} onChange={e => setForm(p => ({...p, latitude: e.target.value}))} placeholder="19.0760" required />
              <Input label="Longitude *" type="number" step="any" value={form.longitude} onChange={e => setForm(p => ({...p, longitude: e.target.value}))} placeholder="72.8777" required />
            </div>
            <p className="text-xs text-gray-500">💡 Find coordinates using Google Maps — right-click on the location and copy coordinates.</p>
          </div>

          {/* Pricing */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Pricing & Availability</h2>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Price" type="number" step="0.01" value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} placeholder="50" />
              <Input label="Currency" value={form.currency} onChange={e => setForm(p => ({...p, currency: e.target.value}))} placeholder="INR" />
              <Select label="Pricing Unit" value={form.pricing_unit} onChange={e => setForm(p => ({...p, pricing_unit: e.target.value}))} options={PRICING_UNITS} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Total Spaces" type="number" value={form.total_spaces} onChange={e => setForm(p => ({...p, total_spaces: e.target.value}))} placeholder="100" />
              <Input label="Available Spaces" type="number" value={form.available_spaces} onChange={e => setForm(p => ({...p, available_spaces: e.target.value}))} placeholder="50" />
            </div>
            <Select label="Availability Status" value={form.availability_status} onChange={e => setForm(p => ({...p, availability_status: e.target.value}))} options={AVAILABILITY_OPTIONS} />
          </div>

          {/* Hours */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Operating Hours</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_24_7} onChange={e => setForm(p => ({...p, is_24_7: e.target.checked}))} className="w-4 h-4 rounded text-primary-600" />
              <span className="text-sm text-gray-700">Open 24/7</span>
            </label>
            {!form.is_24_7 && (
              <div className="grid grid-cols-2 gap-3">
                <Input label="Opening Time" type="time" value={form.opening_time} onChange={e => setForm(p => ({...p, opening_time: e.target.value}))} />
                <Input label="Closing Time" type="time" value={form.closing_time} onChange={e => setForm(p => ({...p, closing_time: e.target.value}))} />
              </div>
            )}
          </div>

          {/* Vehicle Types */}
          <div className="card p-6 space-y-3">
            <h2 className="font-semibold text-gray-900">Accepted Vehicles</h2>
            <div className="flex flex-wrap gap-2">
              {ALL_VEHICLES.map(v => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.vehicle_types.includes(v)} onChange={() => toggleArray('vehicle_types', v)} className="w-4 h-4 rounded text-primary-600" />
                  <span className="text-sm text-gray-700 capitalize">{v}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="card p-6 space-y-3">
            <h2 className="font-semibold text-gray-900">Amenities</h2>
            <div className="flex flex-wrap gap-3">
              {ALL_AMENITIES.map(a => (
                <label key={a} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleArray('amenities', a)} className="w-4 h-4 rounded text-primary-600" />
                  <span className="text-sm text-gray-700 capitalize">{a.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" loading={saving}>
              {isEdit ? 'Save Changes' : 'Create Parking'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/operator')}>Cancel</Button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
