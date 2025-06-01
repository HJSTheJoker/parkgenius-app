'use client';

import { useState, useEffect } from 'react';
import { ClockIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { WaitTimePrediction, ApiResponse } from '@/types';

interface WaitTimePredictionsProps {
  attractionId: string;
  currentWait?: number;
  className?: string;
  compact?: boolean;
}

export function WaitTimePredictions({ 
  attractionId, 
  currentWait = 0, 
  className,
  compact = false 
}: WaitTimePredictionsProps) {
  const [prediction, setPrediction] = useState<WaitTimePrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/predictions?attraction_id=${attractionId}`);
        const data: ApiResponse<WaitTimePrediction[]> = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          setPrediction(data.data[0]);
        } else {
          setError('No predictions available');
        }
      } catch (err) {
        setError('Failed to load predictions');
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [attractionId]);

  const getTrendIcon = (current: number, predicted: number) => {
    const diff = predicted - current;
    if (Math.abs(diff) <= 2) return <MinusIcon className="h-3 w-3" />;
    if (diff > 0) return <ArrowTrendingUpIcon className="h-3 w-3 text-red-500" />;
    return <ArrowTrendingDownIcon className="h-3 w-3 text-green-500" />;
  };

  const getTrendText = (current: number, predicted: number) => {
    const diff = predicted - current;
    if (Math.abs(diff) <= 2) return 'stable';
    if (diff > 0) return `+${diff}min`;
    return `${diff}min`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4 flex items-center justify-center">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-sm text-muted-foreground">Loading predictions...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !prediction) {
    return compact ? null : (
      <Card className={className}>
        <CardContent className="p-4 text-center">
          <div className="text-sm text-muted-foreground">{error || 'No predictions available'}</div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className={`border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 ${className}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              Predictions
            </h4>
            <Badge 
              variant="outline" 
              size="sm"
              className={getConfidenceColor(prediction.predictions['15']?.confidence || 0)}
            >
              {Math.round((prediction.predictions['15']?.confidence || 0) * 100)}%
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(prediction.predictions).slice(0, 4).map(([minutes, pred]) => (
              <div key={minutes} className="flex items-center justify-between">
                <span className="text-muted-foreground">+{minutes}min:</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{pred.predicted_wait}min</span>
                  {getTrendIcon(currentWait, pred.predicted_wait)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClockIcon className="h-5 w-5" />
          Wait Time Predictions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Wait</span>
            <span className="text-lg font-bold">{prediction.current_wait} minutes</span>
          </div>
        </div>

        {/* Predictions Grid */}
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(prediction.predictions).map(([minutes, pred]) => (
            <div 
              key={minutes}
              className="p-3 rounded-lg border border-border/50 bg-card"
            >
              <div className="text-xs text-muted-foreground mb-1">
                In {minutes} minutes
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{pred.predicted_wait}min</span>
                <div className="flex items-center gap-1 text-xs">
                  {getTrendIcon(prediction.current_wait, pred.predicted_wait)}
                  <span className={
                    pred.predicted_wait > prediction.current_wait ? 'text-red-600' :
                    pred.predicted_wait < prediction.current_wait ? 'text-green-600' : 
                    'text-muted-foreground'
                  }>
                    {getTrendText(prediction.current_wait, pred.predicted_wait)}
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round(pred.confidence * 100)}% confidence
              </div>
            </div>
          ))}
        </div>

        {/* Contributing Factors */}
        {prediction.factors && prediction.factors.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Contributing Factors:</h4>
            <div className="flex flex-wrap gap-1">
              {prediction.factors.map((factor, index) => (
                <Badge key={index} variant="secondary" size="sm">
                  {factor.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Alternative Suggestions */}
        {prediction.alternative_attractions && prediction.alternative_attractions.length > 0 && (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
              💡 Shorter waits nearby:
            </h4>
            <div className="text-xs text-green-700 dark:text-green-400">
              {prediction.alternative_attractions.length} similar attraction{prediction.alternative_attractions.length > 1 ? 's' : ''} with shorter waits
            </div>
          </div>
        )}

        {/* Confidence Interval */}
        <div className="text-xs text-muted-foreground text-center">
          Predictions are typically accurate within {prediction.confidence_interval || '±10 minutes'}
        </div>

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center">
          Last updated: {new Date(prediction.last_updated).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}

// Real-time prediction widget that auto-updates
export function LiveWaitTimePredictions({ attractionId, className }: WaitTimePredictionsProps) {
  const [prediction, setPrediction] = useState<WaitTimePrediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await fetch(`/api/predictions?attraction_id=${attractionId}`);
        const data: ApiResponse<WaitTimePrediction[]> = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          setPrediction(data.data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch predictions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
    
    // Update every 5 minutes
    const interval = setInterval(fetchPredictions, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [attractionId]);

  if (loading || !prediction) {
    return null;
  }

  return (
    <div className={`inline-flex items-center gap-2 text-sm ${className}`}>
      <ClockIcon className="h-4 w-4 text-muted-foreground" />
      <span>Next 30min: </span>
      <span className="font-medium">
        {prediction.predictions['30']?.predicted_wait || prediction.current_wait}min
      </span>
      <Badge variant="outline" size="sm">
        {Math.round((prediction.predictions['30']?.confidence || 0) * 100)}%
      </Badge>
    </div>
  );
}