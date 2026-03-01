// Weather API integration using OpenWeatherMap or similar
// In production, replace with actual API calls

export interface WeatherData {
  temp: number
  condition: string
  description: string
  icon: string
  humidity: number
  windSpeed: number
  windDirection: string
  feelsLike: number
  uvIndex: number
  visibility: number
  pressure: number
  sunrise: string
  sunset: string
  forecast: WeatherForecast[]
}

export interface WeatherForecast {
  time: string
  temp: number
  condition: string
  icon: string
  precipitation: number
  windSpeed: number
}

// Mock weather data - in production, use OpenWeatherMap, WeatherAPI, or similar
export async function getWeatherForLocation(
  lat: number,
  lon: number,
  date?: string
): Promise<WeatherData | null> {
  // In production:
  // const apiKey = process.env.OPENWEATHER_API_KEY
  // const response = await fetch(
  //   `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
  // )
  // return await response.json()

  // Return mock data for now
  return {
    temp: 72,
    condition: 'Sunny',
    description: 'clear sky',
    icon: '01d',
    humidity: 45,
    windSpeed: 8,
    windDirection: 'NW',
    feelsLike: 75,
    uvIndex: 6,
    visibility: 10,
    pressure: 30.15,
    sunrise: '06:45 AM',
    sunset: '07:30 PM',
    forecast: [
      { time: '08:00 AM', temp: 65, condition: 'Sunny', icon: '01d', precipitation: 0, windSpeed: 5 },
      { time: '12:00 PM', temp: 72, condition: 'Sunny', icon: '01d', precipitation: 0, windSpeed: 8 },
      { time: '04:00 PM', temp: 75, condition: 'Partly Cloudy', icon: '02d', precipitation: 10, windSpeed: 10 },
      { time: '08:00 PM', temp: 68, condition: 'Clear', icon: '01n', precipitation: 0, windSpeed: 6 },
    ]
  }
}

export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}

export function formatTemp(temp: number): string {
  return `${Math.round(temp)}°F`
}

export function getGolfConditionRating(weather: WeatherData): {
  score: number
  label: string
  color: string
  advice: string
} {
  let score = 100
  const issues: string[] = []

  // Temperature check
  if (weather.temp < 50) {
    score -= 20
    issues.push('Cold temperatures')
  } else if (weather.temp > 90) {
    score -= 20
    issues.push('Hot temperatures')
  }

  // Wind check
  if (weather.windSpeed > 20) {
    score -= 25
    issues.push('Strong winds')
  } else if (weather.windSpeed > 15) {
    score -= 10
    issues.push('Breezy conditions')
  }

  // Precipitation check
  const hasRain = weather.forecast.some(f => f.precipitation > 30)
  if (hasRain) {
    score -= 30
    issues.push('Rain expected')
  }

  // UV index check
  if (weather.uvIndex > 8) {
    issues.push('High UV - use sunscreen')
  }

  if (score >= 90) {
    return {
      score,
      label: 'Excellent',
      color: 'text-green-600',
      advice: 'Perfect conditions for golf!'
    }
  } else if (score >= 70) {
    return {
      score,
      label: 'Good',
      color: 'text-yellow-600',
      advice: issues[0] || 'Good conditions'
    }
  } else if (score >= 50) {
    return {
      score,
      label: 'Fair',
      color: 'text-orange-500',
      advice: issues.slice(0, 2).join(', ')
    }
  } else {
    return {
      score,
      label: 'Poor',
      color: 'text-red-600',
      advice: issues.slice(0, 2).join(', ') || 'Poor conditions for golf'
    }
  }
}

export function getClothingRecommendation(temp: number, windSpeed: number): string[] {
  const items: string[] = []

  if (temp < 40) {
    items.push('Heavy jacket', 'Gloves', 'Beanie')
  } else if (temp < 55) {
    items.push('Light jacket', 'Long sleeves')
  } else if (temp < 70) {
    items.push('Polo shirt', 'Light sweater')
  } else {
    items.push('Breathable polo', 'Shorts')
  }

  if (temp > 80) {
    items.push('Sunglasses', 'Sunscreen', 'Hat')
  }

  if (windSpeed > 15) {
    items.push('Windbreaker')
  }

  return items
}
