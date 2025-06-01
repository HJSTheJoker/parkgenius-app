import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase';
import type { WaitTimePrediction } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const attractionId = searchParams.get('attraction_id');
    const parkId = searchParams.get('park_id');
    const timeWindows = searchParams.get('time_windows')?.split(',').map(Number) || [15, 30, 60, 120];

    if (!attractionId && !parkId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Either attraction_id or park_id must be provided',
          },
        },
        { status: 400 }
      );
    }

    let predictions: WaitTimePrediction[] = [];

    if (attractionId) {
      // Get prediction for specific attraction
      const prediction = await generateWaitTimePrediction(attractionId, timeWindows);
      if (prediction) {
        predictions = [prediction];
      }
    } else if (parkId) {
      // Get predictions for all attractions in park
      const { data: attractions, error } = await supabase
        .from('attractions')
        .select('id')
        .eq('park_id', parkId)
        .eq('current_status', 'open');

      if (error) {
        throw error;
      }

      // Generate predictions for each attraction
      const predictionPromises = attractions.map(attraction =>
        generateWaitTimePrediction(attraction.id, timeWindows)
      );

      const allPredictions = await Promise.all(predictionPromises);
      predictions = allPredictions.filter((p): p is WaitTimePrediction => p !== null);
    }

    return NextResponse.json({
      success: true,
      data: predictions,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        request_id: crypto.randomUUID(),
        model_version: '1.2.3',
        time_windows: timeWindows,
      },
    });
  } catch (error) {
    console.error('Predictions API error:', error);
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

async function generateWaitTimePrediction(attractionId: string, timeWindows: number[]): Promise<WaitTimePrediction | null> {
  try {
    // Get attraction details
    const { data: attraction, error: attractionError } = await supabase
      .from('attractions')
      .select('*')
      .eq('id', attractionId)
      .single();

    if (attractionError || !attraction) {
      return null;
    }

    // Get recent wait time history
    const { data: waitTimeHistory, error: historyError } = await supabase
      .from('wait_times')
      .select('*')
      .eq('attraction_id', attractionId)
      .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .order('timestamp', { ascending: false })
      .limit(168); // One week of hourly data

    if (historyError) {
      console.error('Error fetching wait time history:', historyError);
      return null;
    }

    // Get current weather data
    const { data: weatherData } = await supabase
      .from('weather_data')
      .select('current_conditions')
      .eq('park_id', attraction.park_id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    // Generate predictions using simplified ML model
    const currentWait = attraction.wait_time || 0;
    const predictions: { [key: string]: { predicted_wait: number; confidence: number } } = {};

    for (const minutes of timeWindows) {
      const prediction = predictWaitTime(
        attractionId,
        currentWait,
        minutes,
        waitTimeHistory || [],
        weatherData?.current_conditions,
        attraction
      );

      predictions[minutes.toString()] = prediction;
    }

    // Generate contributing factors
    const factors = generatePredictionFactors(
      waitTimeHistory || [],
      weatherData?.current_conditions,
      attraction
    );

    // Find alternative attractions with lower predicted wait times
    const alternatives = await findAlternativeAttractions(attraction.park_id, attraction.type, currentWait);

    return {
      attraction_id: attractionId,
      current_wait: currentWait,
      predictions,
      factors,
      alternative_attractions: alternatives,
      last_updated: new Date().toISOString(),
      confidence_interval: '±10 minutes',
    };
  } catch (error) {
    console.error('Error generating prediction for attraction:', attractionId, error);
    return null;
  }
}

function predictWaitTime(
  attractionId: string,
  currentWait: number,
  minutesAhead: number,
  history: any[],
  weather: any,
  attraction: any
): { predicted_wait: number; confidence: number } {
  // Simplified prediction algorithm
  // In production, this would use the trained ML model
  
  const now = new Date();
  const futureTime = new Date(now.getTime() + minutesAhead * 60 * 1000);
  const hour = futureTime.getHours();
  const dayOfWeek = futureTime.getDay();
  
  // Base prediction on current wait time
  let prediction = currentWait;
  let confidence = 0.8;

  // Time-based adjustments
  if (hour >= 11 && hour <= 15) {
    // Peak hours - increase wait
    prediction *= 1.3;
  } else if (hour >= 16 && hour <= 20) {
    // Evening - moderate increase
    prediction *= 1.1;
  } else if (hour <= 9 || hour >= 21) {
    // Early morning or late evening - decrease wait
    prediction *= 0.7;
  }

  // Day of week adjustments
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // Weekend - increase wait
    prediction *= 1.2;
  }

  // Thrill level adjustments
  const thrillLevel = attraction.details?.thrill_level || 3;
  if (thrillLevel >= 4) {
    // High thrill attractions tend to have longer waits
    prediction *= 1.1;
  }

  // Weather adjustments
  if (weather) {
    const temp = weather.temperature || 25;
    const precipitation = weather.precipitation || 0;
    
    if (temp > 30) {
      // Hot weather - people seek air conditioning
      if (attraction.type === 'dark_ride') {
        prediction *= 1.2;
      } else {
        prediction *= 0.9;
      }
    }
    
    if (precipitation > 0) {
      // Rain - indoor attractions get more crowded
      if (attraction.type === 'dark_ride' || attraction.type === 'show') {
        prediction *= 1.5;
        confidence *= 0.9;
      } else {
        prediction *= 0.6;
        confidence *= 0.8;
      }
    }
  }

  // Historical pattern matching
  if (history.length > 0) {
    // Find similar time periods in history
    const similarTimes = history.filter(h => {
      const historyTime = new Date(h.timestamp);
      return Math.abs(historyTime.getHours() - hour) <= 1;
    });

    if (similarTimes.length > 0) {
      const avgHistoricalWait = similarTimes.reduce((sum, h) => sum + h.wait_minutes, 0) / similarTimes.length;
      // Blend current prediction with historical average
      prediction = (prediction * 0.7) + (avgHistoricalWait * 0.3);
      confidence *= 1.1; // More confident with historical data
    } else {
      confidence *= 0.9; // Less confident without historical data
    }
  }

  // Apply randomness for natural variation
  const variance = 0.1; // 10% variance
  const randomFactor = 1 + (Math.random() - 0.5) * variance;
  prediction *= randomFactor;

  // Ensure reasonable bounds
  prediction = Math.max(0, Math.min(180, Math.round(prediction)));
  confidence = Math.max(0.3, Math.min(1.0, confidence));

  return {
    predicted_wait: prediction,
    confidence: Math.round(confidence * 100) / 100,
  };
}

function generatePredictionFactors(history: any[], weather: any, attraction: any): string[] {
  const factors = ['historical_patterns', 'time_of_day'];

  if (weather) {
    factors.push('weather_conditions');
    
    if (weather.precipitation > 0) {
      factors.push('precipitation');
    }
    
    if (weather.temperature > 30 || weather.temperature < 10) {
      factors.push('temperature_extreme');
    }
  }

  if (attraction.details?.thrill_level >= 4) {
    factors.push('high_thrill_attraction');
  }

  const now = new Date();
  if (now.getDay() === 0 || now.getDay() === 6) {
    factors.push('weekend');
  }

  if (now.getHours() >= 11 && now.getHours() <= 15) {
    factors.push('peak_hours');
  }

  return factors;
}

async function findAlternativeAttractions(parkId: string, attractionType: string, currentWait: number): Promise<string[]> {
  try {
    // Find similar attractions with lower wait times
    const { data: alternatives, error } = await supabase
      .from('attractions')
      .select('id, name, wait_time')
      .eq('park_id', parkId)
      .eq('type', attractionType)
      .eq('current_status', 'open')
      .lt('wait_time', currentWait)
      .order('wait_time', { ascending: true })
      .limit(3);

    if (error || !alternatives) {
      return [];
    }

    return alternatives.map(alt => alt.id);
  } catch (error) {
    console.error('Error finding alternatives:', error);
    return [];
  }
}