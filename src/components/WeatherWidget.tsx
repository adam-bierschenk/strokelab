'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
  getWeatherForLocation, 
  getWeatherIconUrl,
  formatTemp,
  getGolfConditionRating,
  getClothingRecommendation,
  WeatherData 
} from '@/lib/weather'

interface WeatherWidgetProps {
  lat: number
  lon: number
  courseName: string
  showForecast?: boolean
}

export default function WeatherWidget({ 
  lat, 
  lon, 
  courseName,
  showForecast = true 
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadWeather()
  }, [lat, lon])

  const loadWeather = async () => {
    try {
      const data = await getWeatherForLocation(lat, lon)
      if (data) {
        setWeather(data)
      } else {
        setError('Unable to load weather')
      }
    } catch {
      setError('Weather service unavailable')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="bg-gray-100 rounded-xl p-6">
        <p className="text-gray-500 text-sm">Weather unavailable</p>
      </div>
    )
  }

  const golfRating = getGolfConditionRating(weather)
  const clothing = getClothingRecommendation(weather.temp, weather.windSpeed)

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Weather</h3>
          <p className="text-sm text-gray-500">{courseName}</p>
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="text-center">
          <Image
            src={getWeatherIconUrl(weather.icon)}
            alt={weather.condition}
            width={80}
            height={80}
          />
          <p className="text-2xl font-bold text-gray-900">{formatTemp(weather.temp)}</p>
          <p className="text-sm text-gray-600 capitalize">{weather.description}</p>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Golf Conditions:</span>
            <span className={`font-medium ${golfRating.color}`}>
              {golfRating.label} ({golfRating.score}%)
            </span>
          </div>

          <p className="text-sm text-gray-600">{golfRating.advice}</p>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600">
              🌡️ Feels like {formatTemp(weather.feelsLike)}
            </div>
            <div className="text-gray-600">
              💨 {weather.windSpeed} mph {weather.windDirection}
            </div>
            <div className="text-gray-600">
              💧 {weather.humidity}% humidity
            </div>
            <div className="text-gray-600">
              ☀️ UV {weather.uvIndex}
            </div>
          </div>        </div>
      </div>

      {/* Clothing Recommendations */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">What to Wear</p>
        <div className="flex flex-wrap gap-2">
          {clothing.map((item) => (
            <span 
              key={item}
              className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* 4-Hour Forecast */}
      {showForecast && weather.forecast && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">Today&#39;s Forecast</p>
          <div className="grid grid-cols-4 gap-2">
            {weather.forecast.map((period) => (
              <div key={period.time} className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">{period.time}</p>
                <Image
                  src={getWeatherIconUrl(period.icon)}
                  alt={period.condition}
                  width={32}
                  height={32}
                  className="mx-auto my-1"
                />
                <p className="text-sm font-medium">{formatTemp(period.temp)}</p>
                <p className="text-xs text-blue-600">{period.precipitation}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
