const express = require('express');
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();

// MongoDB connection with environment variable support
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weather-dashboard';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

// Middleware
app.use(cors({
  origin: 'https://sagar-wheather-aap.netlify.app',
  methods: ['GET', 'POST'],
  credentials: true
}));


// Weather Data Model
const WeatherData = mongoose.model('WeatherData', {
  city: String,
  temperature: Number,
  humidity: Number,
  windSpeed: Number,
  condition: String,
  searchedAt: { type: Date, default: Date.now }
});

// Function to fetch real weather data from Open-Meteo API (free, no API key required)
async function fetchWeatherData(city) {
  try {
    // Geocoding: convert city name to coordinates
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      return null;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // Weather API: get actual weather data
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
    );
    const weatherData = await weatherResponse.json();

    const current = weatherData.current;
    const weatherCode = current.weather_code;
    let condition = 'Clear';

    // Convert WMO weather code to readable condition
    if (weatherCode === 0 || weatherCode === 1) condition = 'Clear';
    else if (weatherCode === 2) condition = 'Partly Cloudy';
    else if (weatherCode === 3) condition = 'Overcast';
    else if (weatherCode === 45 || weatherCode === 48) condition = 'Foggy';
    else if (weatherCode >= 51 && weatherCode <= 67) condition = 'Drizzle';
    else if (weatherCode >= 71 && weatherCode <= 77) condition = 'Snow';
    else if (weatherCode === 80 || weatherCode === 81 || weatherCode === 82) condition = 'Rain';
    else if (weatherCode >= 85 && weatherCode <= 86) condition = 'Snow Showers';
    else if (weatherCode >= 80 && weatherCode <= 82) condition = 'Showers';
    else if (weatherCode === 95 || weatherCode === 96 || weatherCode === 99) condition = 'Thunderstorm';

    return {
      city: name,
      country: country,
      temperature: Math.round(current.temperature_2m),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      condition: condition
    };
  } catch (error) {
    console.error('Error fetching real weather data:', error);
    return null;
  }
}

// API Routes
app.get('/api/weather', async (req, res) => {
  const { city } = req.query;
  
  if (!city || city.trim() === '') {
    return res.status(400).json({ message: 'City parameter is required' });
  }

  try {
    // First, fetch real weather data
    const realWeatherData = await fetchWeatherData(city);

    if (!realWeatherData) {
      return res.status(404).json({ message: `Weather data for "${city}" not found` });
    }

    // Save the weather data to MongoDB
    const weatherDocument = new WeatherData({
      city: realWeatherData.city,
      temperature: realWeatherData.temperature,
      humidity: realWeatherData.humidity,
      windSpeed: realWeatherData.windSpeed,
      condition: realWeatherData.condition
    });

    await weatherDocument.save();

    // Also get search history (last 10 searches for this city)
    const searchHistory = await WeatherData.find({ city: realWeatherData.city })
      .sort({ searchedAt: -1 })
      .limit(10);

    res.json({
      current: realWeatherData,
      history: searchHistory
    });
  } catch (err) {
    console.error('Error fetching weather data:', err);
    res.status(500).json({ message: 'Error fetching weather data' });
  }
});

// Get search history
app.get('/api/weather/history/:city', async (req, res) => {
  const { city } = req.params;
  try {
    const history = await WeatherData.find({ city: new RegExp(`^${city}$`, 'i') })
      .sort({ searchedAt: -1 })
      .limit(20);
    res.json(history);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ message: 'Error fetching history' });
  }
});

// Use PORT from environment variable or default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});