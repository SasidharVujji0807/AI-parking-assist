import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ParkAI</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              AI-powered parking discovery for urban drivers. Find, compare, and navigate to parking spaces effortlessly.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/search" className="hover:text-white transition-colors">Find Parking</Link></li>
              <li><Link to="/assistant" className="hover:text-white transition-colors">AI Assistant</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
            </ul>
          </div>

          {/* For Operators */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">For Operators</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/operator" className="hover:text-white transition-colors">Operator Dashboard</Link></li>
              <li><Link to="/operator/parking/new" className="hover:text-white transition-colors">List Your Parking</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs">&copy; {new Date().getFullYear()} ParkAI. All rights reserved.</p>
          <p className="text-xs">Built for the AI Hackathon</p>
        </div>
      </div>
    </footer>
  );
}
