'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, MapIcon, ClockIcon } from '@heroicons/react/24/outline';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDistance } from '@/lib/utils';
import type { Park, ApiResponse, PaginatedResponse } from '@/types';

export default function ParksPage() {
  const router = useRouter();
  const [parks, setParks] = useState<Park[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchParks();
    getUserLocation();
  }, []);

  const fetchParks = async () => {
    try {
      const response = await fetch('/api/parks');
      const data: PaginatedResponse<Park> = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch parks');
      }

      setParks(data.data || []);
    } catch (error) {
      console.error('Error fetching parks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location access denied or unavailable');
        }
      );
    }
  };

  const calculateDistance = (parkLat: number, parkLng: number): number => {
    if (!userLocation) return 0;

    const R = 6371e3; // Earth's radius in meters
    const φ1 = userLocation.lat * Math.PI/180;
    const φ2 = parkLat * Math.PI/180;
    const Δφ = (parkLat - userLocation.lat) * Math.PI/180;
    const Δλ = (parkLng - userLocation.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const filteredParks = parks.filter(park =>
    park.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    park.metadata.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleParkSelect = (parkId: string) => {
    router.push(`/parks/${parkId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-lg text-muted-foreground">Loading parks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Theme Parks</h1>
        <p className="text-lg text-muted-foreground">
          Choose a park to start planning your magical adventure
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <Input
          placeholder="Search parks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
          className="max-w-md"
        />
      </div>

      {/* Parks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParks.map((park) => {
          const distance = userLocation 
            ? calculateDistance(park.location.lat, park.location.lng)
            : null;

          return (
            <Card 
              key={park.id} 
              className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => handleParkSelect(park.id)}
            >
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                {park.metadata.image_url ? (
                  <img
                    src={park.metadata.image_url}
                    alt={park.name}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-4xl mb-2">🏰</div>
                      <div className="text-sm font-medium">{park.name}</div>
                    </div>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <Badge variant="success">Open Today</Badge>
                </div>

                {/* Distance Badge */}
                {distance && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary">
                      {formatDistance(distance)} away
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader>
                <CardTitle className="text-xl">{park.name}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {park.metadata.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Quick Info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    {park.stats.avg_visit_duration}h avg visit
                  </div>
                  <div className="flex items-center gap-1">
                    <MapIcon className="h-4 w-4" />
                    View Map
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1">
                  {park.metadata.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="outline" size="sm">
                      {feature}
                    </Badge>
                  ))}
                  {park.metadata.features.length > 3 && (
                    <Badge variant="outline" size="sm">
                      +{park.metadata.features.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Action Button */}
                <Button className="w-full" variant="default">
                  Start Planning
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredParks.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">No parks found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or check back later for more parks.
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">{parks.length}</div>
            <div className="text-sm text-muted-foreground">Parks Available</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">85%</div>
            <div className="text-sm text-muted-foreground">Prediction Accuracy</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">50K+</div>
            <div className="text-sm text-muted-foreground">Happy Families</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}