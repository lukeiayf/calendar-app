import type { IForecastResponse } from '../interfaces/IForecastResponse'
import type { IWeatherData } from '../interfaces/IWeatherData'

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

    if (!response.ok) {
      console.error(`Geocoding failed: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()

    if (data.results && data.results.length > 0) {
      const result = { lat: data.results[0].latitude, lon: data.results[0].longitude }
      geocodeCache.set(cacheKey, result)
      return result
    }

    console.warn(`City not found: ${city}`)
    return null
  } catch (error) {
    console.error('Geocoding network error:', error)
    return null
  }
}

export async function getWeather(city: string, date: string): Promise<IWeatherData | null> {
  try {
    const coords = await geocodeCity(city)
    if (!coords) {
      console.warn(`Cannot fetch weather: invalid city "${city}"`)
      return null
    }

    // Check if date is within 16 days
    const targetDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffDays = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays > 16) {
      console.warn(
        `Weather data unavailable: date "${date}" is ${diffDays} days away (max 16 days)`
      )
      return {
        temperature: null,
        weatherCode: -1,
      }
    }

    // The weather API can only fetch data for up to 16 days in advance
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,weather_code&timezone=auto&start_date=${date}&end_date=${date}`
    const response = await fetch(url)

    if (!response.ok) {
      console.error(`Weather API error: ${response.status} ${response.statusText} for date ${date}`)
      const errorText = await response.text()
      console.error('Response:', errorText)
      return {
        temperature: null,
        weatherCode: -1,
      }
    }

    const data: IForecastResponse = await response.json()

    if (
      data.daily?.temperature_2m_max?.[0] !== undefined &&
      data.daily?.weather_code?.[0] !== undefined
    ) {
      return {
        temperature: Math.round(data.daily.temperature_2m_max[0]),
        weatherCode: data.daily.weather_code[0],
      }
    }

    console.warn(`Incomplete weather data for ${city} on ${date}`)
    return null
  } catch (error) {
    console.error(`Weather fetch network error for ${city} on ${date}:`, error)
    return null
  }
}

// weather code to emoji mapping
export function getWeatherEmoji(code: number): string {
  if (code === -1) return '--'
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 49) return '🌫️'
  if (code <= 69) return '🌧️'
  if (code <= 79) return '🌨️'
  if (code <= 99) return '⛈️'
  return '🌤️'
}
