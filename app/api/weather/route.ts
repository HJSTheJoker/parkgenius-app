import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parkId = searchParams.get('park_id');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    let weatherData = null;

    // If park ID is provided, get weather for that park
    if (parkId) {
      // First get park location
      const { data: park, error: parkError } = await supabase
        .from('parks')
        .select('location')
        .eq('id', parkId)
        .single();

      if (parkError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PARK_NOT_FOUND',
              message: `Park with ID '${parkId}' not found`,
            },
          },
          { status: 404 }
        );
      }

      // Get latest weather data from database
      const { data: dbWeather } = await supabase
        .from('weather_data')
        .select('*')
        .eq('park_id', parkId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      // Check if weather data is recent (less than 10 minutes old)
      const isRecent = dbWeather && 
        new Date().getTime() - new Date(dbWeather.timestamp).getTime() < 10 * 60 * 1000;

      if (isRecent) {
        weatherData = {
          park_id: parkId,
          current: dbWeather.current_conditions,
          forecast: dbWeather.forecast,
          alerts: dbWeather.alerts,
          impact: dbWeather.impact,
          last_updated: dbWeather.timestamp,
        };
      } else {
        // Fetch fresh weather data from external API
        const parkLat = park.location?.x || 28.3852; // Default to Magic Kingdom
        const parkLng = park.location?.y || -81.5812;
        
        weatherData = await fetchWeatherFromAPI(parkLat, parkLng, parkId);
        
        // Save to database
        if (weatherData) {
          await supabase
            .from('weather_data')
            .insert({
              park_id: parkId,
              current_conditions: weatherData.current,
              forecast: weatherData.forecast,
              alerts: weatherData.alerts,
              impact: weatherData.impact,
            });
        }
      }
    } 
    // If lat/lng provided, fetch weather for those coordinates
    else if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid latitude or longitude',
            },
          },
          { status: 400 }
        );
      }

      weatherData = await fetchWeatherFromAPI(latitude, longitude);
    } 
    else {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Either park_id or lat/lng coordinates must be provided',
          },
        },
        { status: 400 }
      );
    }

    if (!weatherData) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'WEATHER_SERVICE_ERROR',
            message: 'Failed to fetch weather data',
          },
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      data: weatherData,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        request_id: crypto.randomUUID(),
      },
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
        meta: {
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        },
      },
      { status: 500 }
    );
  }
}

async function fetchWeatherFromAPI(lat: number, lng: number, parkId?: string) {
  try {
    // Use Open-Meteo API (free, no API key required)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,precipitation,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weather_code&timezone=auto`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Calculate comfort index
    const comfortIndex = calculateComfortIndex(
      data.current.temperature_2m,
      data.current.relative_humidity_2m,
      data.current.wind_speed_10m
    );

    // Analyze weather impact
    const impact = analyzeWeatherImpact(data.current, data.hourly);

    const weatherData = {
      park_id: parkId,
      current: {
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        precipitation: data.current.precipitation,
        wind_speed: data.current.wind_speed_10m,
        weather_code: data.current.weather_code,
        comfort_index: comfortIndex,
        uv_index: 5, // Default value, would need UV API
      },
      forecast: {
        hourly: data.hourly.time.slice(0, 24).map((time: string, index: number) => ({
          time,
          temperature: data.hourly.temperature_2m[index],
          precipitation_probability: data.hourly.precipitation_probability[index],
          precipitation: data.hourly.precipitation[index],
          wind_speed: data.hourly.wind_speed_10m[index],
          weather_code: data.hourly.weather_code[index],
        })),
        daily: data.daily.time.slice(0, 7).map((date: string, index: number) => ({
          date,
          temperature_max: data.daily.temperature_2m_max[index],
          temperature_min: data.daily.temperature_2m_min[index],
          precipitation_sum: data.daily.precipitation_sum[index],
          wind_speed_max: data.daily.wind_speed_10m_max[index],
          weather_code: data.daily.weather_code[index],
        })),
      },
      alerts: generateWeatherAlerts(data.current, data.hourly),
      impact,
      last_updated: new Date().toISOString(),
    };

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

function calculateComfortIndex(temperature: number, humidity: number, windSpeed: number): number {
  // Convert Celsius to Fahrenheit for comfort calculation
  const tempF = (temperature * 9/5) + 32;
  
  let comfort = 100;
  
  // Temperature comfort (optimal: 70-80°F)
  if (tempF < 60 || tempF > 90) {
    comfort -= Math.abs(75 - tempF) * 2;
  }
  
  // Humidity comfort (optimal: 40-60%)
  if (humidity < 30 || humidity > 70) {
    comfort -= Math.abs(50 - humidity) * 0.5;
  }
  
  // Wind factor
  const windChillFactor = windSpeed > 5 ? Math.max(0.9, 1 - (windSpeed * 0.02)) : 1;
  comfort *= windChillFactor;
  
  return Math.max(0, Math.min(100, Math.round(comfort)));
}

function analyzeWeatherImpact(current: any, hourly: any) {
  const closures = [];
  let crowdImpact = 1.0;
  const recommendations = [];

  // High wind check
  if (current.wind_speed_10m > 35) {
    closures.push('Outdoor roller coasters may close due to high winds');
    recommendations.push('Consider indoor attractions');
  }

  // Rain check
  if (current.precipitation > 0.5) {
    closures.push('Water rides may be temporarily closed');
    recommendations.push('Bring rain gear or head to covered areas');
    crowdImpact *= 0.7; // Fewer people in rain
  }

  // Temperature impact
  const tempF = (current.temperature_2m * 9/5) + 32;
  if (tempF > 95) {
    recommendations.push('Stay hydrated and take frequent shade breaks');
    crowdImpact *= 0.8; // Hot weather reduces crowds
  } else if (tempF < 40) {
    closures.push('Some outdoor attractions may close due to cold');
    crowdImpact *= 0.6; // Cold weather significantly reduces crowds
  }

  // Perfect weather increases crowds
  if (tempF >= 70 && tempF <= 85 && current.precipitation === 0) {
    crowdImpact *= 1.2;
    recommendations.push('Perfect weather - expect higher crowds');
  }

  return {
    attraction_closures: closures,
    crowd_impact: crowdImpact,
    recommendations,
  };
}

function generateWeatherAlerts(current: any, hourly: any): any[] {
  const alerts = [];

  // High wind alert
  if (current.wind_speed_10m > 30) {
    alerts.push({
      type: 'wind_advisory',
      severity: current.wind_speed_10m > 40 ? 'high' : 'medium',
      title: '💨 High Wind Advisory',
      message: `Strong winds at ${Math.round(current.wind_speed_10m)} km/h may affect outdoor attractions.`,
      action: 'Consider indoor attractions',
      duration: 60,
    });
  }

  // Rain alert (check next 2 hours)
  const nextTwoHours = hourly.precipitation.slice(0, 2);
  if (nextTwoHours.some((precip: number) => precip > 0.5)) {
    alerts.push({
      type: 'heavy_rain',
      severity: 'medium',
      title: '🌧️ Rain Expected',
      message: 'Rain expected in the next 2 hours. Plan accordingly.',
      action: 'Find covered areas',
      duration: 120,
    });
  }

  return alerts;
}