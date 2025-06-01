-- ParkGenius Database Schema
-- Initial migration for theme park planning service

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'family', 'enterprise');
CREATE TYPE attraction_status AS ENUM ('open', 'closed', 'down', 'delayed');
CREATE TYPE wait_trend AS ENUM ('increasing', 'decreasing', 'stable');
CREATE TYPE group_role AS ENUM ('admin', 'member', 'viewer');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    subscription_tier subscription_tier DEFAULT 'free',
    preferences JSONB DEFAULT '{}',
    accessibility_profile JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parks table
CREATE TABLE public.parks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location POINT NOT NULL,
    operating_hours JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attractions table
CREATE TABLE public.attractions (
    id TEXT PRIMARY KEY,
    park_id TEXT REFERENCES public.parks(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    location POINT NOT NULL,
    details JSONB DEFAULT '{}',
    accessibility JSONB DEFAULT '{}',
    current_status attraction_status DEFAULT 'open',
    wait_time INTEGER,
    image_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wait times table
CREATE TABLE public.wait_times (
    id BIGSERIAL PRIMARY KEY,
    attraction_id TEXT REFERENCES public.attractions(id) ON DELETE CASCADE,
    wait_minutes INTEGER NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    confidence REAL DEFAULT 1.0,
    factors TEXT[] DEFAULT '{}',
    trend wait_trend DEFAULT 'stable'
);

-- Weather data table
CREATE TABLE public.weather_data (
    id BIGSERIAL PRIMARY KEY,
    park_id TEXT REFERENCES public.parks(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    current_conditions JSONB NOT NULL,
    forecast JSONB DEFAULT '{}',
    alerts JSONB DEFAULT '[]',
    impact JSONB DEFAULT '{}'
);

-- Itineraries table
CREATE TABLE public.itineraries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    park_id TEXT REFERENCES public.parks(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    name TEXT NOT NULL,
    activities JSONB DEFAULT '[]',
    estimated_metrics JSONB DEFAULT '{}',
    optimization_score REAL DEFAULT 0,
    shared_with UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups table
CREATE TABLE public.groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    members JSONB DEFAULT '[]',
    shared_itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE SET NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements table
CREATE TABLE public.achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    criteria JSONB DEFAULT '{}',
    reward JSONB DEFAULT '{}',
    unlocked_at TIMESTAMPTZ DEFAULT NOW()
);

-- User locations table (for real-time group coordination)
CREATE TABLE public.user_locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    location POINT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Analytics events table
CREATE TABLE public.analytics_events (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id UUID,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_attractions_park_id ON public.attractions(park_id);
CREATE INDEX idx_attractions_location ON public.attractions USING GIST(location);
CREATE INDEX idx_wait_times_attraction_time ON public.wait_times(attraction_id, timestamp DESC);
CREATE INDEX idx_wait_times_timestamp ON public.wait_times(timestamp DESC);
CREATE INDEX idx_weather_park_time ON public.weather_data(park_id, timestamp DESC);
CREATE INDEX idx_itineraries_user_id ON public.itineraries(user_id);
CREATE INDEX idx_itineraries_park_date ON public.itineraries(park_id, visit_date);
CREATE INDEX idx_user_locations_group_expires ON public.user_locations(group_id, expires_at);
CREATE INDEX idx_analytics_events_user_time ON public.analytics_events(user_id, timestamp DESC);
CREATE INDEX idx_analytics_events_type_time ON public.analytics_events(event_type, timestamp DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parks_updated_at BEFORE UPDATE ON public.parks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attractions_updated_at BEFORE UPDATE ON public.attractions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itineraries_updated_at BEFORE UPDATE ON public.itineraries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Itineraries policies
CREATE POLICY "Users can view own itineraries" ON public.itineraries
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = ANY(shared_with));

CREATE POLICY "Users can create own itineraries" ON public.itineraries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own itineraries" ON public.itineraries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own itineraries" ON public.itineraries
    FOR DELETE USING (auth.uid() = user_id);

-- Groups policies
CREATE POLICY "Group members can view groups" ON public.groups
    FOR SELECT USING (
        auth.uid() = creator_id OR 
        auth.uid() IN (
            SELECT jsonb_array_elements_text(members->'user_ids')::UUID
        )
    );

CREATE POLICY "Users can create groups" ON public.groups
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Group creators can update groups" ON public.groups
    FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Group creators can delete groups" ON public.groups
    FOR DELETE USING (auth.uid() = creator_id);

-- Achievements policies
CREATE POLICY "Users can view own achievements" ON public.achievements
    FOR SELECT USING (auth.uid() = user_id);

-- User locations policies (for group coordination)
CREATE POLICY "Group members can view locations" ON public.user_locations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.groups 
            WHERE id = group_id 
            AND (
                creator_id = auth.uid() OR
                auth.uid() IN (
                    SELECT jsonb_array_elements_text(members->'user_ids')::UUID
                )
            )
        )
    );

CREATE POLICY "Users can update own location" ON public.user_locations
    FOR ALL USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can view own analytics" ON public.analytics_events
    FOR SELECT USING (auth.uid() = user_id);

-- Function to clean up expired user locations
CREATE OR REPLACE FUNCTION cleanup_expired_locations()
RETURNS void AS $$
BEGIN
    DELETE FROM public.user_locations 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get nearby attractions
CREATE OR REPLACE FUNCTION get_nearby_attractions(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    park_id_param TEXT,
    radius_meters INTEGER DEFAULT 1000
)
RETURNS TABLE (
    attraction_id TEXT,
    distance_meters INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id as attraction_id,
        ST_Distance(
            ST_GeogFromWKB(ST_AsBinary(a.location)),
            ST_GeogFromWKB(ST_AsBinary(ST_Point(user_lng, user_lat)))
        )::INTEGER as distance_meters
    FROM public.attractions a
    WHERE a.park_id = park_id_param
    AND ST_DWithin(
        ST_GeogFromWKB(ST_AsBinary(a.location)),
        ST_GeogFromWKB(ST_AsBinary(ST_Point(user_lng, user_lat))),
        radius_meters
    )
    ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;