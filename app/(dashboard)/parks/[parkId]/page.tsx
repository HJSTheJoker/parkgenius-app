'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ClockIcon, 
  MapPinIcon,
  ExclamationTriangleIcon,
  StarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AttractionCard, AttractionCardSkeleton } from '@/components/features/attractions/attraction-card';
import { WeatherWidget } from '@/components/features/weather/weather-widget';
import { WaitTimePredictions } from '@/components/features/predictions/wait-time-predictions';

import type { Park, Attraction, WeatherData, WaitTimePrediction, ApiResponse } from '@/types';

interface ParkWithAttractions extends Park {
  attractions: Attraction[];
  weather?: WeatherData;
}

export default function ParkDetailPage() {
  const { parkId } = useParams();
  const [park, setPark] = useState<ParkWithAttractions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<{ [attractionId: string]: WaitTimePrediction }>({});

  useEffect(() => {
    if (!parkId) return;

    const fetchParkData = async () => {
      try {
        setLoading(true);
        
        // Fetch park details with attractions
        const parkResponse = await fetch(`/api/parks/${parkId}`);
        const parkData: ApiResponse<ParkWithAttractions> = await parkResponse.json();
        
        if (!parkData.success) {
          throw new Error(parkData.error?.message || 'Failed to fetch park data');
        }

        setPark(parkData.data!);

        // Fetch predictions for all attractions
        if (parkData.data!.attractions.length > 0) {
          const predictionsResponse = await fetch(`/api/predictions?park_id=${parkId}`);
          const predictionsData: ApiResponse<WaitTimePrediction[]> = await predictionsResponse.json();
          
          if (predictionsData.success && predictionsData.data) {
            const predictionsMap = predictionsData.data.reduce((acc, pred) => {
              acc[pred.attraction_id] = pred;
              return acc;
            }, {} as { [key: string]: WaitTimePrediction });
            setPredictions(predictionsMap);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchParkData();
  }, [parkId]);

  const formatOperatingHours = (hours: any) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = hours[today];
    
    if (!todayHours) return 'Hours not available';
    
    return `${todayHours.open} - ${todayHours.close}`;
  };


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <AttractionCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !park) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Park Not Found</h3>
            <p className="text-muted-foreground mb-4">
              {error || "The park you're looking for doesn't exist or couldn't be loaded."}
            </p>
            <Button asChild>
              <Link href="/parks">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Parks
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const openAttractions = park.attractions.filter(attraction => attraction.current_status === 'open');

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/parks">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Parks
          </Link>
        </Button>
      </div>

      {/* Park Header */}
      <div className="relative h-64 rounded-lg overflow-hidden">
        {park.metadata.image_url ? (
          <Image
            src={park.metadata.image_url}
            alt={park.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-6xl mb-4">🎢</div>
              <h1 className="text-4xl font-bold">{park.name}</h1>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-4xl font-bold mb-2">{park.name}</h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <MapPinIcon className="h-4 w-4" />
              {park.location.address}
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              Today: {formatOperatingHours(park.operating_hours)}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{park.stats.total_attractions}</div>
            <div className="text-sm text-muted-foreground">Attractions</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{openAttractions.length}</div>
            <div className="text-sm text-muted-foreground">Currently Open</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{park.stats.avg_visit_duration}h</div>
            <div className="text-sm text-muted-foreground">Avg Visit Time</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <StarIcon className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <div className="text-2xl font-bold">{park.stats.popularity_score}</div>
            </div>
            <div className="text-sm text-muted-foreground">Popularity Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Weather & Alerts */}
      {park.weather && <WeatherWidget weather={park.weather} />}

      {/* Attractions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Attractions</h2>
          <div className="text-sm text-muted-foreground">
            {openAttractions.length} of {park.attractions.length} open
          </div>
        </div>

        {park.attractions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">🎢</div>
              <h3 className="text-lg font-semibold mb-2">No Attractions Available</h3>
              <p className="text-muted-foreground">
                Attraction data for this park is coming soon.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {park.attractions.map((attraction) => (
              <div key={attraction.id} className="space-y-3">
                <AttractionCard
                  attraction={attraction}
                  showAddButton={true}
                  onAdd={() => {
                    // TODO: Add to itinerary functionality
                    console.log('Add to itinerary:', attraction.id);
                  }}
                />
                
                {/* Wait Time Predictions */}
                {attraction.current_status === 'open' && (
                  <WaitTimePredictions 
                    attractionId={attraction.id} 
                    currentWait={attraction.wait_time || 0}
                    compact={true}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}