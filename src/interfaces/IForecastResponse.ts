export interface IForecastResponse {
  latitude?: number
  longitude?: number
  timezone?: string
  timezone_abbreviation?: string
  elevation?: number
  daily?: {
    time?: string[]
    temperature_2m_max?: number[]
    weather_code?: number[]
  }
}
