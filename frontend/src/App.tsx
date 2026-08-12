import React, { useState, useRef, useEffect } from 'react';
import './App.css';

interface WeatherData {
  _id?: string;
  city: string;
  country?: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  searchedAt?: string;
}

interface ApiResponse {
  current: WeatherData;
  history: WeatherData[];
}

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [searchHistory, setSearchHistory] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentCities, setRecentCities] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get API URL from environment variable or default to localhost
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Load recent cities from localStorage
    const saved = localStorage.getItem('recentCities');
    if (saved) {
      setRecentCities(new Set(JSON.parse(saved)));
    }
  }, []);

  const handleSearch = async (cityName?: string) => {
    const city = cityName || searchQuery.trim();
    
    if (!city) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError('');
    setCurrentWeather(null);

    try {
      const response = await fetch(`${API_URL}/api/weather?city=${encodeURIComponent(city)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch weather for ${city}`);
      }

      const data: ApiResponse = await response.json();
      
      setCurrentWeather(data.current);
      setSearchHistory(data.history || []);
      
      // Add to recent cities
      const updated = new Set(recentCities);
      updated.add(data.current.city);
      setRecentCities(updated);
      localStorage.setItem('recentCities', JSON.stringify(Array.from(updated)));
      
      setSearchQuery('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`⚠️ ${errorMessage}`);
      setCurrentWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) return '☀️';
    if (conditionLower.includes('cloud')) return '☁️';
    if (conditionLower.includes('rain')) return '🌧️';
    if (conditionLower.includes('snow')) return '❄️';
    if (conditionLower.includes('thunder')) return '⛈️';
    if (conditionLower.includes('fog')) return '🌫️';
    if (conditionLower.includes('drizzle')) return '🌦️';
    return '🌤️';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="pt-8 pb-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 animate-fade-in">
              🌍 Weather Dashboard
            </h1>
            <p className="text-gray-300 text-lg">Real-time weather at your fingertips</p>
          </div>
        </header>

        {/* Search Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Enter city name... (e.g., London, Tokyo, New York)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input-premium flex-1"
              />
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="btn-premium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="spinner">↻</span>
                    Searching...
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    Search
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm animate-slide-up">
                {error}
              </div>
            )}

            {/* Quick Access - Recent Cities */}
            {recentCities.size > 0 && !currentWeather && (
              <div className="mb-8">
                <p className="text-gray-300 text-sm mb-3 font-semibold">Recent Searches:</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(recentCities).slice(0, 8).map((city) => (
                    <button
                      key={city}
                      onClick={() => handleSearch(city)}
                      className="btn-secondary text-sm animate-slide-up"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Current Weather Display */}
        {currentWeather && (
          <section className="px-4 sm:px-6 lg:px-8 py-8 flex-1">
            <div className="max-w-6xl mx-auto">
              {/* Main Weather Card */}
              <div className="weather-card mb-8 animate-slide-up">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-center md:text-left flex-1">
                    <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                      {currentWeather.city}
                      {currentWeather.country && (
                        <span className="text-2xl text-gray-300 ml-2">📍</span>
                      )}
                    </h2>
                    <p className="text-xl text-gray-300 mb-6">{currentWeather.country || 'Location'}</p>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-8 justify-center md:justify-start">
                      <div>
                        <p className="text-7xl sm:text-8xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                          {currentWeather.temperature}°
                        </p>
                        <p className="text-gray-300 text-lg mt-2">Temperature</p>
                      </div>
                      <div className="text-6xl animate-float">
                        {getWeatherIcon(currentWeather.condition)}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-4 w-full md:w-auto">
                    {/* Weather Condition Card */}
                    <div className="bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-xl p-5 backdrop-blur-md border border-white/20">
                      <p className="text-gray-300 text-sm font-semibold mb-2">Condition</p>
                      <p className="text-white text-xl font-bold">{currentWeather.condition}</p>
                    </div>

                    {/* Humidity Card */}
                    <div className="bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-xl p-5 backdrop-blur-md border border-white/20">
                      <p className="text-gray-300 text-sm font-semibold mb-2">Humidity</p>
                      <p className="text-white text-2xl font-bold">{currentWeather.humidity}%</p>
                    </div>

                    {/* Wind Speed Card */}
                    <div className="bg-gradient-to-br from-green-500/30 to-cyan-500/30 rounded-xl p-5 backdrop-blur-md border border-white/20">
                      <p className="text-gray-300 text-sm font-semibold mb-2">Wind Speed</p>
                      <p className="text-white text-2xl font-bold">{currentWeather.windSpeed} km/h</p>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl p-5 backdrop-blur-md border border-white/20">
                      <p className="text-gray-300 text-sm font-semibold mb-2">Feels Like</p>
                      <p className="text-white text-2xl font-bold">{Math.round(currentWeather.temperature - 2)}°</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search History */}
              {searchHistory && searchHistory.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">📊 Search History for {currentWeather.city}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchHistory.slice(0, 6).map((data, index) => (
                      <div
                        key={index}
                        className="weather-card animate-slide-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-gray-300 text-sm">Searched on</p>
                            <p className="text-white font-semibold text-sm">
                              {data.searchedAt ? new Date(data.searchedAt).toLocaleString() : 'Just now'}
                            </p>
                          </div>
                          <span className="text-3xl">{getWeatherIcon(data.condition)}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Temperature:</span>
                            <span className="text-white font-bold">{data.temperature}°C</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Humidity:</span>
                            <span className="text-white font-bold">{data.humidity}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Wind:</span>
                            <span className="text-white font-bold">{data.windSpeed} km/h</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Condition:</span>
                            <span className="text-white font-bold text-sm">{data.condition}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!currentWeather && !loading && (
          <section className="flex-1 flex items-center justify-center px-4">
            <div className="text-center">
              <div className="text-6xl mb-6 animate-float">🌦️</div>
              <h2 className="text-3xl font-bold text-white mb-4">Start Exploring Weather</h2>
              <p className="text-gray-300 text-lg mb-8 max-w-md">
                Search for any city around the world to get real-time weather information, humidity levels, wind speed, and more!
              </p>
              <button
                onClick={() => searchInputRef.current?.focus()}
                className="btn-premium"
              >
                Begin Search
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-4 text-center text-gray-400 text-sm border-t border-white/10">
        <p>🌐 Real-time weather data powered by Open-Meteo API | Built with React & Tailwind CSS</p>
      </footer>
    </div>
  );
};

export default App;