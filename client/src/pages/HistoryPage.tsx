import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Trash2, Search, MapPin, Filter } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { Button } from '../components/ui/Button';
import { historyApi } from '../services/api';
import { formatRelativeTime } from '../utils/format';
import type { SearchHistory } from '../types';

export function HistoryPage() {
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    historyApi.getAll().then(result => {
      if (result.success) setHistory(result.data as SearchHistory[]);
    }).finally(() => setLoading(false));
  }, []);

  async function deleteEntry(id: string) {
    await historyApi.delete(id);
    setHistory(prev => prev.filter(h => h.id !== id));
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-gray-400" /> Search History
          </h1>
          <span className="text-sm text-gray-500">{history.length} searches</span>
        </div>

        {loading ? (
          <LoadingState message="Loading history..." />
        ) : history.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No search history"
            description="Your recent searches will appear here."
            action={<Link to="/search"><Button>Search Parking</Button></Link>}
          />
        ) : (
          <div className="space-y-3">
            {history.map(entry => (
              <div key={entry.id} className="card p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {entry.search_query || (entry.latitude ? `Near ${entry.latitude.toFixed(2)}, ${entry.longitude?.toFixed(2)}` : 'Search')}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{formatRelativeTime(entry.created_at)}</span>
                      {entry.result_count > 0 && <span>{entry.result_count} results</span>}
                      {Object.keys(entry.filters).length > 0 && (
                        <span className="flex items-center gap-1"><Filter className="w-3 h-3" />Filtered</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/search?${entry.search_query ? `query=${entry.search_query}` : ''}`}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Search again
                  </Link>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
