import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2, MapPin, Star, Zap } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { aiApi } from '../services/api';
import { formatPrice, formatAvailability } from '../utils/format';
import toast from 'react-hot-toast';
import type { AIRecommendation } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: AIRecommendation[];
  timestamp: Date;
}

const EXAMPLE_PROMPTS = [
  'Find affordable covered parking near Connaught Place for 3 hours',
  'I need EV charging parking in Bandra, Mumbai',
  'Secure parking near HITEC City under ₹50/hour',
  'Find parking near BKC that is open 24/7 and has security',
];

export function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m your AI parking assistant. Tell me where you\'re going and what you need — I\'ll find the best parking options from our database. For example: "Find affordable parking near Connaught Place for 2 hours with security."',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [userLat, setUserLat] = useState<number | undefined>();
  const [userLng, setUserLng] = useState<number | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Try to get user location on mount
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setUserLat(pos.coords.latitude);
      setUserLng(pos.coords.longitude);
    });
  }, []);

  async function sendMessage(text: string = input) {
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // First try recommendations flow for parking-specific queries
      const parkingKeywords = ['parking', 'park', 'lot', 'garage', 'spot', 'space', 'ev', 'charging', 'covered'];
      const looksLikeParkingQuery = parkingKeywords.some(kw => text.toLowerCase().includes(kw));

      if (looksLikeParkingQuery) {
        const result = await aiApi.recommend({
          message: text,
          userLat,
          userLng,
        });

        if (result.success) {
          const data = result.data as {
            summary: string;
            recommendations: AIRecommendation[];
            intent: { missingInformation?: string[] };
          };

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.summary,
            recommendations: data.recommendations,
            timestamp: new Date(),
          };

          if (data.intent?.missingInformation?.length > 0) {
            assistantMessage.content += '\n\n' + data.intent.missingInformation.join(' ');
          }

          setMessages(prev => [...prev, assistantMessage]);
          return;
        }
      }

      // Fall back to general chat
      const chatResult = await aiApi.chat({
        message: text,
        conversationId,
        userLat,
        userLng,
      });

      if (chatResult.success) {
        const data = chatResult.data as { response: string; conversationId?: string };
        setConversationId(data.conversationId);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        }]);
      } else {
        throw new Error((chatResult.error as { message: string }).message);
      }
    } catch (err) {
      toast.error('Failed to get response. Please try again.');
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'m sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Parking Assistant</h1>
            <p className="text-sm text-gray-500">Powered by Gemini — finds real parking from our database</p>
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col card overflow-hidden" style={{ minHeight: '500px' }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-primary-600" />
                  </div>
                )}

                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }`}>
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                    ))}
                  </div>

                  {/* Recommendation cards */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {msg.recommendations.map((rec, idx) => {
                        const avail = formatAvailability(rec.parking.availability_status);
                        return (
                          <div key={rec.parkingId} className="card p-4 border-l-4 border-primary-400">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                                    #{idx + 1}
                                  </span>
                                  <h3 className="font-semibold text-gray-900 text-sm">{rec.parking.name}</h3>
                                </div>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                                  <MapPin className="w-3 h-3" />{rec.parking.address}
                                </p>
                                <p className="text-xs text-gray-600 mb-2">{rec.reason}</p>

                                <div className="flex flex-wrap gap-2 mb-2">
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    avail.color === 'green' ? 'bg-green-100 text-green-800' :
                                    avail.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>{avail.label}</span>
                                  <span className="text-xs font-semibold text-primary-700">
                                    {formatPrice(rec.parking.price, rec.parking.currency, rec.parking.pricing_unit)}
                                  </span>
                                  {rec.parking.rating && (
                                    <span className="flex items-center gap-0.5 text-xs text-gray-600">
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      {rec.parking.rating.toFixed(1)}
                                    </span>
                                  )}
                                  {rec.parking.amenities.includes('ev_charging') && (
                                    <span className="text-xs text-green-600 flex items-center gap-0.5">
                                      <Zap className="w-3 h-3" />EV
                                    </span>
                                  )}
                                </div>

                                {rec.availabilityNote && (
                                  <p className="text-xs text-orange-600 italic">{rec.availabilityNote}</p>
                                )}
                              </div>
                            </div>
                            <Link
                              to={`/parking/${rec.parkingId}`}
                              className="mt-3 block text-center text-xs bg-primary-600 text-white py-1.5 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                            >
                              View Details
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Example prompts */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Describe what parking you need..."
                className="input-base flex-1"
                disabled={loading}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                loading={loading}
                icon={<Send className="w-4 h-4" />}
              >
                Send
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              AI recommends only real parking from our database. Availability may not be real-time.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
