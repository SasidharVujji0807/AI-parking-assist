import { Link } from 'react-router-dom';
import { Search, Bot, MapPin, Shield, Star, Zap, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-sm mb-6">
              <Bot className="w-4 h-4" />
              AI-Powered Parking Discovery
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Find Parking in Seconds with AI
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl">
              Discover, compare, and navigate to parking spaces near you. Our AI assistant understands your needs and finds the perfect spot.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/search">
                <Button size="lg" variant="secondary" icon={<Search className="w-5 h-5" />}>
                  Find Parking Now
                </Button>
              </Link>
              <Link to="/assistant">
                <Button size="lg" icon={<Bot className="w-5 h-5" />} className="bg-white/10 hover:bg-white/20 border border-white/20">
                  Ask AI Assistant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick search */}
      <section className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            {['Mumbai', 'Bengaluru', 'Delhi', 'Chennai', 'Hyderabad', 'Pune'].map(city => (
              <Link
                key={city}
                to={`/search?city=${city}`}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-primary-50 hover:text-primary-700 rounded-full text-sm text-gray-600 transition-colors border border-gray-200"
              >
                <MapPin className="w-3.5 h-3.5" />
                {city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose ParkAI?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              More than just a parking search. AI-powered recommendations tailored to your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Bot,
                title: 'AI Recommendations',
                description: 'Natural language search. Tell us what you need and our AI finds the best options from real parking data.',
                color: 'bg-purple-100 text-purple-600',
              },
              {
                icon: MapPin,
                title: 'Interactive Map',
                description: 'See all parking on a live map. Click any location to see details, pricing, and get directions.',
                color: 'bg-blue-100 text-blue-600',
              },
              {
                icon: Shield,
                title: 'Verified Listings',
                description: 'Parking data submitted by operators and verified by our community through reviews and reports.',
                color: 'bg-green-100 text-green-600',
              },
              {
                icon: Zap,
                title: 'EV Charging',
                description: 'Filter specifically for EV charging stations. Never run out of charge in an unfamiliar city.',
                color: 'bg-yellow-100 text-yellow-600',
              },
              {
                icon: Star,
                title: 'Community Reviews',
                description: 'Read honest reviews from other drivers. Rate and review parking spots you have visited.',
                color: 'bg-orange-100 text-orange-600',
              },
              {
                icon: Clock,
                title: 'Real-Time Availability',
                description: 'Availability status updated by operators. Save time by checking before you go.',
                color: 'bg-pink-100 text-pink-600',
              },
            ].map(feature => (
              <div key={feature.title} className="card p-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI CTA */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Bot className="w-16 h-16 mx-auto mb-6 text-primary-200" />
          <h2 className="text-3xl font-bold mb-4">Try Our AI Parking Assistant</h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            Just describe what you need: "Cheap covered parking near the airport for 3 hours with EV charging."
            Our AI does the rest.
          </p>
          <Link to="/assistant">
            <Button size="lg" variant="secondary" icon={<ArrowRight className="w-5 h-5" />}>
              Open AI Assistant
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
