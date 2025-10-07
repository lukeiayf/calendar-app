import type { IWeatherData } from "../interfaces/IWeatherData";

// Cache to avoid repeated lookups
const geocodeCache = new Map<string, { lat: number; lon: number }>()

async function geocodeCity(city: string): Promise<{ lat: number; lon: number } | null> {
  const cacheKey = city.toLowerCase().trim()
  
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!
  }

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    )
    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      const result = { lat: data.results[0].latitude, lon: data.results[0].longitude }
      geocodeCache.set(cacheKey, result)
      return result
    }
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

export async function getWeather(city: string, date: string): Promise<IWeatherData | null> {
  try {
    const coords = await geocodeCity(city)
    if (!coords) return null

    // The weather API can only return weather data from up to 16 days from the current date
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,weather_code&timezone=auto&start_date=${date}&end_date=${date}`
    )
    const data = await response.json()

    if (data.daily && data.daily.temperature_2m_max && data.daily.weather_code) {
      return {
        temperature: Math.round(data.daily.temperature_2m_max[0]),
        weatherCode: data.daily.weather_code[0],
      }
    }
    return null
  } catch (error) {
    console.error('Weather fetch error:', error)
    return null
  }
}

// weather code to emoji mapping
export function getWeatherEmoji(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 49) return '🌫️'
  if (code <= 69) return '🌧️'
  if (code <= 79) return '🌨️'
  if (code <= 99) return '⛈️'
  return '🌤️'
}