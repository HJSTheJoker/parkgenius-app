import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables - database features will be disabled');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Admin client for server-side operations
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const supabaseAdmin = serviceRoleKey ? createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
) : supabase; // Fallback to regular client if no service role key

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
          subscription_tier: 'free' | 'premium' | 'family' | 'enterprise';
          preferences: any;
          accessibility_profile?: any;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
          subscription_tier?: 'free' | 'premium' | 'family' | 'enterprise';
          preferences?: any;
          accessibility_profile?: any;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
          subscription_tier?: 'free' | 'premium' | 'family' | 'enterprise';
          preferences?: any;
          accessibility_profile?: any;
        };
      };
      parks: {
        Row: {
          id: string;
          name: string;
          location: any;
          operating_hours: any;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          location: any;
          operating_hours: any;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: any;
          operating_hours?: any;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      attractions: {
        Row: {
          id: string;
          park_id: string;
          name: string;
          type: string;
          category: string;
          location: any;
          details: any;
          accessibility: any;
          current_status: 'open' | 'closed' | 'down' | 'delayed';
          wait_time?: number;
          image_urls: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          park_id: string;
          name: string;
          type: string;
          category: string;
          location: any;
          details: any;
          accessibility: any;
          current_status?: 'open' | 'closed' | 'down' | 'delayed';
          wait_time?: number;
          image_urls?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          park_id?: string;
          name?: string;
          type?: string;
          category?: string;
          location?: any;
          details?: any;
          accessibility?: any;
          current_status?: 'open' | 'closed' | 'down' | 'delayed';
          wait_time?: number;
          image_urls?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      wait_times: {
        Row: {
          id: number;
          attraction_id: string;
          wait_minutes: number;
          timestamp: string;
          confidence: number;
          factors: string[];
          trend: 'increasing' | 'decreasing' | 'stable';
        };
        Insert: {
          id?: number;
          attraction_id: string;
          wait_minutes: number;
          timestamp?: string;
          confidence?: number;
          factors?: string[];
          trend?: 'increasing' | 'decreasing' | 'stable';
        };
        Update: {
          id?: number;
          attraction_id?: string;
          wait_minutes?: number;
          timestamp?: string;
          confidence?: number;
          factors?: string[];
          trend?: 'increasing' | 'decreasing' | 'stable';
        };
      };
      itineraries: {
        Row: {
          id: string;
          user_id: string;
          park_id: string;
          visit_date: string;
          name: string;
          activities: any;
          estimated_metrics: any;
          optimization_score: number;
          created_at: string;
          updated_at: string;
          shared_with?: string[];
        };
        Insert: {
          id?: string;
          user_id: string;
          park_id: string;
          visit_date: string;
          name: string;
          activities: any;
          estimated_metrics: any;
          optimization_score?: number;
          created_at?: string;
          updated_at?: string;
          shared_with?: string[];
        };
        Update: {
          id?: string;
          user_id?: string;
          park_id?: string;
          visit_date?: string;
          name?: string;
          activities?: any;
          estimated_metrics?: any;
          optimization_score?: number;
          created_at?: string;
          updated_at?: string;
          shared_with?: string[];
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          creator_id: string;
          members: any;
          shared_itinerary_id?: string;
          settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          creator_id: string;
          members: any;
          shared_itinerary_id?: string;
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          creator_id?: string;
          members?: any;
          shared_itinerary_id?: string;
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}