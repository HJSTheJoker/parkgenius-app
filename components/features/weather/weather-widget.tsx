'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CloudIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { WeatherData } from '@/types';

interface WeatherWidgetProps {
  weather: WeatherData;
  className?: string;
}

export function WeatherWidget({ weather, className }: WeatherWidgetProps) {
  const getWeatherIcon = (weatherCode: number) => {
    if (weatherCode <= 1) return '☀️';
    if (weatherCode <= 3) return '⛅';
    if (weatherCode <= 48) return '☁️';
    if (weatherCode <= 77) return '🌧️';
    if (weatherCode <= 82) return '⛈️';
    return '❄️';
  };

  const getComfortLevel = (comfortIndex: number) => {
    if (comfortIndex >= 80) return { level: 'Excellent', color: 'text-green-600' };
    if (comfortIndex >= 60) return { level: 'Good', color: 'text-blue-600' };
    if (comfortIndex >= 40) return { level: 'Fair', color: 'text-yellow-600' };
    return { level: 'Poor', color: 'text-red-600' };
  };

  const getWeatherDescription = (weatherCode: number) => {
    if (weatherCode <= 1) return 'Clear';
    if (weatherCode <= 3) return 'Partly Cloudy';
    if (weatherCode <= 48) return 'Cloudy';
    if (weatherCode <= 77) return 'Rainy';
    if (weatherCode <= 82) return 'Stormy';
    return 'Snow';
  };

  const comfort = getComfortLevel(weather.current.comfort_index);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudIcon className="h-5 w-5" />
          Current Weather
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Conditions */}
          <div className="text-center">
            <div className="text-4xl mb-2">
              {getWeatherIcon(weather.current.weather_code)}
            </div>
            <div className="text-2xl font-bold">{Math.round(weather.current.temperature)}°C</div>
            <div className="text-sm text-muted-foreground mb-2">
              {getWeatherDescription(weather.current.weather_code)}
            </div>
            <div className="text-xs text-muted-foreground">
              Comfort level: 
              <span className={`font-medium ml-1 ${comfort.color}`}>
                {comfort.level}
              </span>
            </div>
          </div>
          
          {/* Weather Details */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Humidity:</span>
              <span>{weather.current.humidity}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wind:</span>
              <span>{Math.round(weather.current.wind_speed)} km/h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">UV Index:</span>
              <span>{weather.current.uv_index}</span>
            </div>
            {weather.current.precipitation > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Precipitation:</span>
                <span>{weather.current.precipitation}mm</span>
              </div>
            )}
          </div>

          {/* Impact Information */}
          <div className="space-y-2">
            <h4 className="font-medium">Park Impact:</h4>
            <div className="text-sm">
              {weather.impact.crowd_impact > 1.1 && (
                <Badge variant="warning">Higher crowds expected</Badge>
              )}
              {weather.impact.crowd_impact < 0.9 && (
                <Badge variant="success">Lower crowds expected</Badge>
              )}
              {weather.impact.crowd_impact >= 0.9 && weather.impact.crowd_impact <= 1.1 && (
                <Badge variant="outline">Normal crowd levels</Badge>
              )}
            </div>
            
            {weather.impact.recommendations.length > 0 && (
              <div className="text-xs text-muted-foreground">
                💡 {weather.impact.recommendations[0]}
              </div>
            )}

            {weather.impact.attraction_closures.length > 0 && (
              <div className="text-xs text-orange-600 dark:text-orange-400">
                ⚠️ Some attractions may be affected
              </div>
            )}
          </div>
        </div>

        {/* Weather Alerts */}
        {weather.alerts && weather.alerts.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-sm">Weather Alerts:</h4>
            {weather.alerts.map((alert, index) => (
              <div 
                key={index} 
                className="p-3 rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
              >
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-sm">{alert.title}</span>
                  <Badge 
                    variant={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'outline'}
                    size="sm"
                  >
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                {alert.action && (
                  <p className="text-xs font-medium mt-1 text-yellow-700 dark:text-yellow-300">
                    Recommendation: {alert.action}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Hourly Forecast Preview */}
        <div className="mt-4">
          <h4 className="font-medium text-sm mb-2">Next 6 Hours:</h4>
          <div className="flex gap-2 overflow-x-auto">
            {weather.forecast.hourly.slice(0, 6).map((hour, index) => (
              <div key={index} className="flex-shrink-0 text-center p-2 rounded bg-muted/50 min-w-[60px]">
                <div className="text-xs text-muted-foreground">
                  {new Date(hour.time).toLocaleTimeString('en-US', { hour: 'numeric' })}
                </div>
                <div className="text-lg my-1">
                  {getWeatherIcon(hour.weather_code)}
                </div>
                <div className="text-xs font-medium">
                  {Math.round(hour.temperature)}°
                </div>
                {hour.precipitation_probability > 30 && (
                  <div className="text-xs text-blue-600">
                    {hour.precipitation_probability}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact weather widget for smaller spaces
export function WeatherWidgetCompact({ weather, className }: WeatherWidgetProps) {
  const getWeatherIcon = (weatherCode: number) => {
    if (weatherCode <= 1) return '☀️';
    if (weatherCode <= 3) return '⛅';
    if (weatherCode <= 48) return '☁️';
    if (weatherCode <= 77) return '🌧️';
    if (weatherCode <= 82) return '⛈️';
    return '❄️';
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {getWeatherIcon(weather.current.weather_code)}
            </div>
            <div>
              <div className="font-semibold">{Math.round(weather.current.temperature)}°C</div>
              <div className="text-xs text-muted-foreground">
                {weather.current.precipitation > 0 ? `${weather.current.precipitation}mm rain` : 'Dry'}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm">
              {weather.impact.crowd_impact > 1.1 && (
                <Badge variant="warning" size="sm">High crowds</Badge>
              )}
              {weather.impact.crowd_impact < 0.9 && (
                <Badge variant="success" size="sm">Low crowds</Badge>
              )}
              {weather.impact.crowd_impact >= 0.9 && weather.impact.crowd_impact <= 1.1 && (
                <Badge variant="outline" size="sm">Normal</Badge>
              )}
            </div>
            {weather.alerts && weather.alerts.length > 0 && (
              <div className="text-xs text-orange-600 mt-1">
                {weather.alerts.length} alert{weather.alerts.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}