import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format wait time in a human-readable format
 */
export function formatWaitTime(minutes: number): string {
  if (minutes === 0) return 'Walk on';
  if (minutes < 60) return `${minutes} min`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format distance in a human-readable format
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  
  const kilometers = meters / 1000;
  return `${kilometers.toFixed(1)}km`;
}

/**
 * Format temperature based on user preferences
 */
export function formatTemperature(celsius: number, unit: 'C' | 'F' = 'F'): string {
  if (unit === 'F') {
    const fahrenheit = (celsius * 9/5) + 32;
    return `${Math.round(fahrenheit)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

/**
 * Calculate comfort index based on weather conditions
 */
export function calculateComfortIndex(
  temperature: number,
  humidity: number,
  windSpeed: number
): number {
  // Heat index calculation
  const heatIndex = temperature + (0.5 * (humidity - 14));
  
  // Wind chill factor
  const windChillFactor = windSpeed > 5 ? Math.max(0.9, 1 - (windSpeed * 0.02)) : 1;
  
  // Comfort score (0-100)
  let comfort = 100;
  
  // Temperature comfort (optimal: 70-80°F)
  const tempF = (temperature * 9/5) + 32;
  if (tempF < 60 || tempF > 90) {
    comfort -= Math.abs(75 - tempF) * 2;
  }
  
  // Humidity comfort (optimal: 40-60%)
  if (humidity < 30 || humidity > 70) {
    comfort -= Math.abs(50 - humidity) * 0.5;
  }
  
  // Wind factor
  comfort *= windChillFactor;
  
  return Math.max(0, Math.min(100, Math.round(comfort)));
}

/**
 * Generate color based on wait time
 */
export function getWaitTimeColor(minutes: number): string {
  if (minutes === 0) return 'text-green-600';
  if (minutes <= 15) return 'text-green-500';
  if (minutes <= 30) return 'text-yellow-500';
  if (minutes <= 60) return 'text-orange-500';
  return 'text-red-500';
}

/**
 * Generate thrill level indicator
 */
export function getThrillLevelInfo(level: number): {
  label: string;
  color: string;
  description: string;
} {
  const levels = {
    1: {
      label: 'Family Friendly',
      color: 'text-green-600',
      description: 'Suitable for all ages',
    },
    2: {
      label: 'Mild Thrill',
      color: 'text-blue-600',
      description: 'Gentle excitement',
    },
    3: {
      label: 'Moderate Thrill',
      color: 'text-yellow-600',
      description: 'Some intensity',
    },
    4: {
      label: 'High Thrill',
      color: 'text-orange-600',
      description: 'Intense experience',
    },
    5: {
      label: 'Extreme Thrill',
      color: 'text-red-600',
      description: 'Maximum intensity',
    },
  };
  
  return levels[level as keyof typeof levels] || levels[3];
}

/**
 * Calculate walking time between two points
 */
export function calculateWalkingTime(
  distance: number,
  speed: 'slow' | 'normal' | 'fast' = 'normal'
): number {
  const speeds = {
    slow: 1.2, // m/s
    normal: 1.4, // m/s
    fast: 1.6, // m/s
  };
  
  const timeInSeconds = distance / speeds[speed];
  return Math.ceil(timeInSeconds / 60); // Convert to minutes
}

/**
 * Debounce function for search and API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Format time in relative format (e.g., "2 hours ago")
 */
export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return targetDate.toLocaleDateString();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate a random ID
 */
export function generateId(prefix?: string): string {
  const randomString = Math.random().toString(36).substring(2, 15);
  return prefix ? `${prefix}_${randomString}` : randomString;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date | string): number {
  const today = new Date();
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Get accessibility features as readable labels
 */
export function getAccessibilityLabels(accessibility: any): string[] {
  const labels: string[] = [];
  
  if (accessibility.wheelchair_accessible) labels.push('Wheelchair Accessible');
  if (accessibility.audio_description) labels.push('Audio Description');
  if (accessibility.sign_language) labels.push('Sign Language');
  if (accessibility.service_animal_allowed) labels.push('Service Animals Welcome');
  if (!accessibility.transfer_required) labels.push('No Transfer Required');
  
  return labels;
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Safely parse JSON with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Check if user is on mobile device
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
}