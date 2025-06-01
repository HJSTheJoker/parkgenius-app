// Core application types

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  subscription_tier: 'free' | 'premium' | 'family' | 'enterprise';
  preferences: UserPreferences;
  accessibility_profile?: AccessibilityProfile;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    share_location: boolean;
    share_itinerary: boolean;
    public_profile: boolean;
  };
  planning: {
    thrill_level: number; // 1-5 scale
    walking_speed: 'slow' | 'normal' | 'fast';
    group_size: number;
    budget_range: 'low' | 'medium' | 'high';
  };
}

export interface AccessibilityProfile {
  accommodations: {
    mobility: 'wheelchair' | 'walker' | 'cane' | 'assistance_needed' | 'none';
    visual: 'blind' | 'low_vision' | 'color_blind' | 'none';
    hearing: 'deaf' | 'hard_of_hearing' | 'none';
    cognitive: 'autism' | 'memory_impairment' | 'learning_disability' | 'none';
    sensory: 'sensory_processing' | 'light_sensitivity' | 'sound_sensitivity' | 'none';
    medical: 'chronic_pain' | 'fatigue' | 'cardiac' | 'seizure_disorder' | 'none';
    communication: 'speech_impairment' | 'aac_user' | 'none';
  };
  preferences: {
    quiet_routes: boolean;
    rest_area_alerts: boolean;
    sensory_breaks: boolean;
    companion_assistance: boolean;
    audio_descriptions: boolean;
    sign_language_support: boolean;
    large_print: boolean;
    slow_walking: boolean;
    priority_seating: boolean;
  };
  assistive_devices: string[];
  emergency_contacts: EmergencyContact[];
  medications: MedicationSchedule[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  is_primary: boolean;
}

export interface MedicationSchedule {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  times: string[];
  notes?: string;
}

export interface Park {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    timezone: string;
  };
  operating_hours: {
    [day: string]: {
      open: string;
      close: string;
    };
  };
  metadata: {
    description: string;
    website: string;
    phone: string;
    image_url: string;
    features: string[];
  };
  stats: {
    total_attractions: number;
    avg_visit_duration: number;
    popularity_score: number;
  };
}

export interface Attraction {
  id: string;
  park_id: string;
  name: string;
  type: 'roller_coaster' | 'dark_ride' | 'water_ride' | 'show' | 'restaurant' | 'shop';
  category: string;
  location: {
    lat: number;
    lng: number;
    area: string;
  };
  details: {
    description: string;
    height_requirement?: number;
    duration?: number;
    capacity_per_hour?: number;
    thrill_level: 1 | 2 | 3 | 4 | 5;
    age_recommendation: string;
  };
  accessibility: {
    wheelchair_accessible: boolean;
    audio_description: boolean;
    sign_language: boolean;
    service_animal_allowed: boolean;
    transfer_required: boolean;
    notes?: string;
  };
  current_status: 'open' | 'closed' | 'down' | 'delayed';
  wait_time?: number;
  fast_pass_available?: boolean;
  image_urls: string[];
}

export interface WaitTime {
  attraction_id: string;
  wait_minutes: number;
  timestamp: string;
  confidence: number;
  factors: string[];
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface WaitTimePrediction {
  attraction_id: string;
  current_wait: number;
  predictions: {
    [minutes_ahead: string]: {
      predicted_wait: number;
      confidence: number;
    };
  };
  factors: string[];
  alternative_attractions: string[];
  last_updated: string;
  confidence_interval?: string;
}

export interface WeatherData {
  park_id: string;
  current: {
    temperature: number;
    humidity: number;
    precipitation: number;
    wind_speed: number;
    weather_code: number;
    comfort_index: number;
    uv_index: number;
  };
  forecast: {
    hourly: WeatherHour[];
    daily: WeatherDay[];
  };
  alerts: WeatherAlert[];
  impact: {
    attraction_closures: string[];
    crowd_impact: number;
    recommendations: string[];
  };
}

export interface WeatherHour {
  time: string;
  temperature: number;
  precipitation_probability: number;
  precipitation: number;
  wind_speed: number;
  weather_code: number;
}

export interface WeatherDay {
  date: string;
  temperature_max: number;
  temperature_min: number;
  precipitation_sum: number;
  wind_speed_max: number;
  weather_code: number;
}

export interface WeatherAlert {
  id: string;
  type: 'lightning' | 'heavy_rain' | 'heat_advisory' | 'wind_advisory' | 'severe_weather';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  action?: string;
  duration: number;
  immediate: boolean;
  advance_minutes?: number;
}

export interface Itinerary {
  id: string;
  user_id: string;
  park_id: string;
  visit_date: string;
  name: string;
  activities: ItineraryActivity[];
  estimated_metrics: {
    total_attractions: number;
    total_walking_distance: number;
    total_wait_time: number;
    estimated_cost: number;
  };
  optimization_score: number;
  created_at: string;
  updated_at: string;
  shared_with?: string[];
}

export interface ItineraryActivity {
  id: string;
  attraction_id: string;
  scheduled_time: string;
  estimated_duration: number;
  estimated_wait: number;
  priority: 'must_do' | 'high' | 'medium' | 'low';
  notes?: string;
  completed?: boolean;
}

export interface Group {
  id: string;
  name: string;
  creator_id: string;
  members: GroupMember[];
  shared_itinerary_id?: string;
  created_at: string;
  settings: {
    location_sharing: boolean;
    decision_voting: boolean;
    public_visibility: boolean;
  };
}

export interface GroupMember {
  user_id: string;
  role: 'admin' | 'member' | 'viewer';
  joined_at: string;
  current_location?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'explorer' | 'efficiency' | 'social' | 'seasonal';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  criteria: {
    type: string;
    target: number;
    timeframe?: string;
  };
  reward: {
    points: number;
    badge_url: string;
    benefits?: string[];
  };
  unlocked_at?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    timestamp: string;
    version: string;
    request_id: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

// Utility types
export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingState {
  status: Status;
  error?: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';