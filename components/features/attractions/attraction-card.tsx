'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ClockIcon, 
  MapPinIcon, 
  HeartIcon, 
  ShareIcon,
  PlusIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, WaitTimeBadge, ThrillLevelBadge, AccessibilityBadge } from '@/components/ui/badge';
import { cn, formatDistance, getAccessibilityLabels } from '@/lib/utils';
import type { Attraction } from '@/types';

interface AttractionCardProps {
  attraction: Attraction;
  showAddButton?: boolean;
  showDistance?: boolean;
  distance?: number;
  onAdd?: () => void;
  onRemove?: () => void;
  isAdded?: boolean;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
  className?: string;
}

export function AttractionCard({
  attraction,
  showAddButton = true,
  showDistance = false,
  distance,
  onAdd,
  onRemove,
  isAdded = false,
  isFavorited = false,
  onToggleFavorite,
  className,
}: AttractionCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const accessibilityFeatures = getAccessibilityLabels(attraction.accessibility);
  const hasWaitTime = attraction.wait_time !== undefined && attraction.wait_time !== null;
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: attraction.name,
          text: `Check out ${attraction.name} - ${attraction.details.description}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Card className={cn('group hover:shadow-lg transition-shadow duration-200', className)}>
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        {!imageError && attraction.image_urls.length > 0 ? (
          <Image
            src={attraction.image_urls[0]}
            alt={attraction.name}
            fill
            className={cn(
              'object-cover transition-transform duration-200 group-hover:scale-105',
              imageLoading && 'blur-sm'
            )}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <div className="text-gray-500 dark:text-gray-400 text-center">
              <div className="text-4xl mb-2">🎢</div>
              <div className="text-sm">{attraction.type.replace('_', ' ')}</div>
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant={
              attraction.current_status === 'open' ? 'success' :
              attraction.current_status === 'closed' ? 'error' :
              attraction.current_status === 'down' ? 'error' : 'warning'
            }
          >
            {attraction.current_status === 'open' ? 'Open' :
             attraction.current_status === 'closed' ? 'Closed' :
             attraction.current_status === 'down' ? 'Down' : 'Delayed'}
          </Badge>
        </div>

        {/* Wait Time Badge */}
        {hasWaitTime && attraction.current_status === 'open' && (
          <div className="absolute top-3 right-3">
            <WaitTimeBadge minutes={attraction.wait_time!} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            size="sm"
            variant="secondary"
            onClick={onToggleFavorite}
            className="h-8 w-8 p-0"
          >
            {isFavorited ? (
              <HeartSolidIcon className="h-4 w-4 text-red-500" />
            ) : (
              <HeartIcon className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleShare}
            className="h-8 w-8 p-0"
          >
            <ShareIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight truncate">
              {attraction.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {attraction.category}
            </p>
          </div>
          
          {/* Thrill Level */}
          <div className="ml-3 flex-shrink-0">
            <ThrillLevelBadge level={attraction.details.thrill_level} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {attraction.details.description}
        </p>

        {/* Quick Info */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {attraction.details.duration && (
            <div className="flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              {attraction.details.duration} min
            </div>
          )}
          
          {showDistance && distance && (
            <div className="flex items-center gap-1">
              <MapPinIcon className="h-3 w-3" />
              {formatDistance(distance)}
            </div>
          )}

          {attraction.details.height_requirement && (
            <div className="flex items-center gap-1">
              📏 {attraction.details.height_requirement}"+ required
            </div>
          )}

          {attraction.details.age_recommendation && (
            <div className="flex items-center gap-1">
              👥 {attraction.details.age_recommendation}
            </div>
          )}
        </div>

        {/* Accessibility Features */}
        {accessibilityFeatures.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {accessibilityFeatures.slice(0, 2).map((feature) => (
              <AccessibilityBadge key={feature} feature={feature} />
            ))}
            {accessibilityFeatures.length > 2 && (
              <Badge variant="outline" size="sm">
                +{accessibilityFeatures.length - 2} more
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/attractions/${attraction.id}`}>
              View Details
            </Link>
          </Button>
          
          {showAddButton && (
            <Button
              size="sm"
              variant={isAdded ? "secondary" : "default"}
              onClick={isAdded ? onRemove : onAdd}
              className="flex-1"
            >
              {isAdded ? (
                <>
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Added
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add to Plan
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton loader for attraction cards
export function AttractionCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}