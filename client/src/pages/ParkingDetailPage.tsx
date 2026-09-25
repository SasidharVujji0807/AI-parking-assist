import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Star, Clock, Navigation, Heart, Flag, Zap, Shield,
  ParkingSquare, ChevronLeft, AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingState } from '../components/ui/LoadingState';
import { ParkingMap } from '../components/parking/ParkingMap';
import { useParkingDetail } from '../hooks/useParking';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../contexts/AuthContext';
import { parkingApi } from '../services/api';
import { formatPrice, formatAvailability, formatParkingType, formatAmenity, formatHours, formatRelativeTime } from '../utils/format';
import { getGoogleMapsDirectionsUrl } from '../utils/geo';
import toast from 'react-hot-toast';
import type { Review, ReportType } from '../types';

export function ParkingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { parking, loading, error } = useParkingDetail(id);
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reportType, setReportType] = useState<ReportType>('incorrect_price');
  const [reportDesc, setReportDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadReviews() {
    if (!id || reviewsLoaded) return;
    setReviewsLoading(true);
    const result = await parkingApi.getReviews(id);
    if (result.success) setReviews(result.data as Review[]);
    setReviewsLoading(false);
    setReviewsLoaded(true);
  }

  async function submitReview() {
    if (!id) return;
    setSubmitting(true);
    const result = await parkingApi.createReview(id, { rating: reviewRating, review_text: reviewText });
    if (result.success) {
      toast.success('Review submitted!');
      setShowReviewForm(false);
      setReviewText('');
      setReviewRating(5);
      loadReviews();
    } else {
      toast.error((result.error as { message: string }).message || 'Failed to submit review');
    }
    setSubmitting(false);
  }

  async function submitReport() {
    if (!id) return;
    setSubmitting(true);
    const result = await parkingApi.createReport(id, { report_type: reportType, description: reportDesc });
    if (result.success) {
      toast.success('Report submitted. Thank you!');
      setShowReportForm(false);
    } else {
      toast.error('Failed to submit report');
    }
    setSubmitting(false);
  }

  if (loading) return (
    <div className="min-h-screen">
      <Navbar />
      <LoadingState message="Loading parking details..." />
    </div>
  );

  if (error || !parking) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Parking not found</h2>
        <p className="text-gray-500 mb-4">{error || 'This parking location may have been removed.'}</p>
        <Link to="/search"><Button>Back to Search</Button></Link>
      </div>
    </div>
  );

  const availability = formatAvailability(parking.availability_status);
  const favorited = isFavorite(parking.id);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Back nav */}
        <Link to="/search" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Search
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ParkingSquare className="w-8 h-8 text-primary-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{parking.name}</h1>
                    <p className="text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      {parking.address}
                      {parking.city && `, ${parking.city}`}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <Badge variant={availability.color}>{availability.label}</Badge>
                      <Badge variant="blue">{formatParkingType(parking.parking_type)}</Badge>
                      {parking.is_24_7 && <Badge variant="green">Open 24/7</Badge>}
                    </div>
                  </div>
                </div>
              </div>

              {parking.description && (
                <p className="text-gray-600 text-sm leading-relaxed mt-4 pt-4 border-t border-gray-100">
                  {parking.description}
                </p>
              )}
            </div>

            {/* Pricing & Capacity */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Pricing & Availability</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="font-bold text-primary-700 text-lg">{formatPrice(parking.price, parking.currency, parking.pricing_unit)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="font-semibold text-gray-900">{availability.label}</p>
                </div>
                {parking.total_spaces && (
                  <div>
                    <p className="text-xs text-gray-500">Total Spaces</p>
                    <p className="font-semibold text-gray-900">{parking.total_spaces}</p>
                  </div>
                )}
                {parking.available_spaces !== undefined && (
                  <div>
                    <p className="text-xs text-gray-500">Available</p>
                    <p className="font-semibold text-gray-900">{parking.available_spaces}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hours */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" /> Operating Hours
              </h2>
              <p className="text-gray-700">
                {formatHours(parking.opening_time, parking.closing_time, parking.is_24_7)}
              </p>
              {parking.last_availability_update && (
                <p className="text-xs text-gray-400 mt-2">
                  Last updated {formatRelativeTime(parking.last_availability_update)}
                </p>
              )}
            </div>

            {/* Amenities */}
            {parking.amenities.length > 0 && (
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {parking.amenities.map(amenity => (
                    <span
                      key={amenity}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-200"
                    >
                      {amenity === 'ev_charging' && <Zap className="w-3.5 h-3.5 text-green-500" />}
                      {(amenity === 'security' || amenity === 'cctv') && <Shield className="w-3.5 h-3.5 text-blue-500" />}
                      {formatAmenity(amenity as any)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">
                  Reviews
                  {parking.rating && (
                    <span className="ml-2 flex items-center gap-1 text-yellow-500 font-normal text-sm">
                      <Star className="w-4 h-4 fill-yellow-400" />
                      {parking.rating.toFixed(1)} ({parking.review_count})
                    </span>
                  )}
                </h2>
                <div className="flex gap-2">
                  {!reviewsLoaded && (
                    <Button size="sm" variant="secondary" onClick={loadReviews} loading={reviewsLoading}>
                      Load Reviews
                    </Button>
                  )}
                  {isAuthenticated && (
                    <Button size="sm" onClick={() => setShowReviewForm(true)}>
                      Write Review
                    </Button>
                  )}
                </div>
              </div>

              {reviewsLoaded && reviews.length === 0 && (
                <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
              )}

              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">{review.profiles?.full_name || 'Anonymous'}</span>
                    </div>
                    {review.review_text && (
                      <p className="text-sm text-gray-700">{review.review_text}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Actions */}
            <div className="card p-4 space-y-3">
              <a
                href={getGoogleMapsDirectionsUrl(parking.latitude, parking.longitude, parking.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-primary-600 text-white py-2.5 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
              </a>

              {isAuthenticated && (
                <button
                  onClick={() => toggleFavorite(parking.id)}
                  className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg border font-medium text-sm transition-colors ${
                    favorited
                      ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${favorited ? 'fill-red-500' : ''}`} />
                  {favorited ? 'Remove from Favorites' : 'Save to Favorites'}
                </button>
              )}

              <button
                onClick={() => setShowReportForm(true)}
                className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
                Report Incorrect Info
              </button>
            </div>

            {/* Mini map */}
            <div className="card overflow-hidden" style={{ height: '250px' }}>
              <ParkingMap
                parkingList={[parking]}
                center={[parking.latitude, parking.longitude]}
                zoom={16}
              />
            </div>

            {/* Location info */}
            <div className="card p-4 text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Coordinates</span>
                <span className="font-mono text-xs">{parking.latitude.toFixed(4)}, {parking.longitude.toFixed(4)}</span>
              </div>
              {parking.postal_code && (
                <div className="flex justify-between">
                  <span className="text-gray-400">PIN Code</span>
                  <span>{parking.postal_code}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Accepts</span>
                <span>{parking.vehicle_types.join(', ') || 'All vehicles'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review modal */}
      <Modal isOpen={showReviewForm} onClose={() => setShowReviewForm(false)} title="Write a Review">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} onClick={() => setReviewRating(i + 1)}>
                  <Star className={`w-6 h-6 transition-colors ${i < reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
            <textarea
              className="input-base resize-none"
              rows={4}
              placeholder="Share your experience..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowReviewForm(false)}>Cancel</Button>
            <Button onClick={submitReview} loading={submitting}>Submit Review</Button>
          </div>
        </div>
      </Modal>

      {/* Report modal */}
      <Modal isOpen={showReportForm} onClose={() => setShowReportForm(false)} title="Report an Issue">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
            <select
              className="input-base"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
            >
              <option value="incorrect_price">Incorrect Price</option>
              <option value="incorrect_location">Incorrect Location</option>
              <option value="closed_parking">Parking is Closed</option>
              <option value="incorrect_availability">Incorrect Availability</option>
              <option value="duplicate">Duplicate Listing</option>
              <option value="incorrect_hours">Incorrect Hours</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              className="input-base resize-none"
              rows={3}
              placeholder="Describe the issue..."
              value={reportDesc}
              onChange={(e) => setReportDesc(e.target.value)}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowReportForm(false)}>Cancel</Button>
            <Button onClick={submitReport} loading={submitting}>Submit Report</Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
