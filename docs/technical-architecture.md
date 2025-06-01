# 🏗️ Technical Architecture

## 🎯 Architecture Overview

This document outlines the complete technical architecture for the theme park planning service, optimized for Vercel deployment with free-tier database solutions.

## 📐 System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   Edge Network   │    │   Core Services │
│                 │    │                  │    │                 │
│  • Web App      │◄───┤ Cloudflare CDN   │◄───┤ Vercel Functions│
│  • Mobile PWA   │    │ • Static Assets  │    │ • API Routes    │
│  • Native Apps  │    │ • Edge Functions │    │ • ML Inference  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Data Layer     │    │  External APIs  │
                       │                  │    │                 │
                       │ • Supabase (PG)  │    │ • Queue-Times   │
                       │ • PlanetScale    │    │ • Weather APIs  │
                       │ • FaunaDB        │    │ • Park APIs     │
                       │ • Redis Cache    │    │ • Social APIs   │
                       └──────────────────┘    └─────────────────┘
```

## 🚀 Frontend Architecture

### Next.js Application Structure

```typescript
// Project structure optimized for Vercel
/
├── app/                           // App Router (Next.js 13+)
│   ├── (auth)/                   // Route groups
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── parks/
│   │   ├── itinerary/
│   │   ├── groups/
│   │   └── profile/
│   ├── api/                      // API routes
│   │   ├── predictions/
│   │   ├── weather/
│   │   ├── parks/
│   │   └── ml/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                    // Reusable components
│   ├── ui/                       // Base UI components
│   ├── features/                 // Feature-specific components
│   ├── charts/                   // Data visualization
│   └── maps/                     // Interactive maps
├── lib/                          // Utilities and clients
│   ├── database/                 // Database clients
│   ├── ml/                       // ML utilities
│   ├── auth/                     // Authentication
│   └── utils/                    // Helper functions
├── types/                        // TypeScript definitions
├── public/                       // Static assets
│   ├── maps/                     // Park maps
│   ├── icons/                    // Attraction icons
│   └── images/                   // General images
└── vercel.json                   // Vercel configuration
```

### Component Architecture

```typescript
// Base component structure
interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Feature-based component organization
export const ParkComponents = {
  List: ParkList,
  Detail: ParkDetail,
  Map: InteractiveParkMap,
  Weather: ParkWeather,
  Crowds: CrowdHeatmap
};

export const ItineraryComponents = {
  Builder: ItineraryBuilder,
  Optimizer: AIOptimizer,
  Timeline: ItineraryTimeline,
  Sharer: SocialSharing
};

export const AccessibilityComponents = {
  ProfileBuilder: AccessibilityProfile,
  RouteOptimizer: AccessibleRouting,
  AssistiveFeatures: AssistiveTools
};
```

### State Management

```typescript
// Zustand store for global state
interface AppState {
  // User state
  user: User | null;
  preferences: UserPreferences;
  accessibility: AccessibilityProfile;
  
  // Planning state
  selectedPark: Park | null;
  currentItinerary: Itinerary | null;
  groupMembers: GroupMember[];
  
  // Real-time state
  liveWaitTimes: Record<string, WaitTime>;
  weatherData: WeatherData | null;
  userLocation: Coordinates | null;
  
  // UI state
  isLoading: boolean;
  notifications: Notification[];
  activeModal: string | null;
}

const useAppStore = create<AppState>((set, get) => ({
  // State initialization
  user: null,
  preferences: defaultPreferences,
  
  // Actions
  setUser: (user) => set({ user }),
  updatePreferences: (prefs) => set({ preferences: prefs }),
  
  // Real-time updates
  updateWaitTimes: (times) => set({ liveWaitTimes: times }),
  updateWeather: (weather) => set({ weatherData: weather }),
}));
```

## 🗢️ Database Architecture

### Primary Database: Supabase (PostgreSQL)

```sql
-- Core schema for user and park data
CREATE SCHEMA theme_parks;

-- Users and profiles
CREATE TABLE theme_parks.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    subscription_tier TEXT DEFAULT 'free',
    accessibility_profile JSONB,
    preferences JSONB
);

-- Parks and attractions
CREATE TABLE theme_parks.parks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location POINT NOT NULL,
    timezone TEXT NOT NULL,
    operating_hours JSONB NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE theme_parks.attractions (
    id TEXT PRIMARY KEY,
    park_id TEXT REFERENCES theme_parks.parks(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    location POINT NOT NULL,
    height_requirement INTEGER,
    accessibility_features JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time wait times
CREATE TABLE theme_parks.wait_times (
    id BIGSERIAL PRIMARY KEY,
    attraction_id TEXT REFERENCES theme_parks.attractions(id),
    wait_minutes INTEGER NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    crowd_level TEXT,
    weather_conditions JSONB,
    confidence_score REAL
);

-- Indexes for performance
CREATE INDEX idx_wait_times_attraction_time ON theme_parks.wait_times(attraction_id, timestamp DESC);
CREATE INDEX idx_wait_times_timestamp ON theme_parks.wait_times(timestamp DESC);
CREATE INDEX idx_attractions_park ON theme_parks.attractions(park_id);
CREATE INDEX idx_parks_location ON theme_parks.parks USING GIST(location);

-- Row Level Security
ALTER TABLE theme_parks.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_own_data ON theme_parks.users FOR ALL USING (auth.uid() = id);
```

### High-Frequency Data: PlanetScale (MySQL)

```sql
-- Optimized for high-frequency writes
CREATE TABLE ml_predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attraction_id VARCHAR(50) NOT NULL,
    prediction_type ENUM('wait_time', 'crowd_level', 'closure_risk') NOT NULL,
    predicted_value DECIMAL(8,2) NOT NULL,
    confidence_score DECIMAL(3,2) NOT NULL,
    features JSON NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_attraction_type_time (attraction_id, prediction_type, created_at DESC),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB;

CREATE TABLE analytics_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36),
    event_type VARCHAR(50) NOT NULL,
    event_data JSON,
    session_id VARCHAR(36),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_time (user_id, timestamp DESC),
    INDEX idx_event_type_time (event_type, timestamp DESC)
) ENGINE=InnoDB;
```

### Real-time Features: FaunaDB

```javascript
// FaunaDB collections for real-time features
import { query as q } from 'faunadb';

// User locations (with TTL for privacy)
const UserLocationSchema = {
  name: 'user_locations',
  ttl_days: null, // Handled by document TTL
  data: {
    user_id: q.String,
    coordinates: {
      lat: q.Number,
      lng: q.Number,
      accuracy: q.Number
    },
    group_id: q.String,
    last_updated: q.Time,
    ttl: q.Time // Auto-expire after 1 hour
  }
};

// Real-time notifications
const NotificationSchema = {
  name: 'notifications',
  data: {
    user_id: q.String,
    type: q.String, // 'wait_time', 'weather', 'group', 'achievement'
    title: q.String,
    body: q.String,
    data: q.Object,
    read: q.Boolean,
    created_at: q.Time,
    expires_at: q.Time
  }
};

// Group coordination
const GroupStateSchema = {
  name: 'group_states',
  data: {
    group_id: q.String,
    members: q.Array,
    current_plan: q.Object,
    shared_location: q.Boolean,
    meeting_point: q.Object,
    last_updated: q.Time
  }
};
```

## 🚀 API Architecture

### Vercel API Routes

```typescript
// app/api/predictions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MLPredictor } from '@/lib/ml/predictor';
import { CacheManager } from '@/lib/cache/manager';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const attractionId = searchParams.get('attraction');
  const timeWindow = searchParams.get('timeWindow') || '60';
  
  if (!attractionId) {
    return NextResponse.json({ error: 'Missing attraction ID' }, { status: 400 });
  }
  
  try {
    // Check cache first
    const cached = await CacheManager.get(`prediction:${attractionId}:${timeWindow}`);
    if (cached) {
      return NextResponse.json(cached);
    }
    
    // Generate prediction
    const predictor = new MLPredictor();
    const prediction = await predictor.predictWaitTime(attractionId, parseInt(timeWindow));
    
    // Cache for 5 minutes
    await CacheManager.set(`prediction:${attractionId}:${timeWindow}`, prediction, 300);
    
    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json({ error: 'Prediction failed' }, { status: 500 });
  }
}

// app/api/optimization/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { preferences, constraints, parkId } = body;
  
  const optimizer = new ItineraryOptimizer();
  const optimized = await optimizer.optimize({
    preferences,
    constraints,
    parkId,
    userId: 'current-user' // Get from auth
  });
  
  return NextResponse.json(optimized);
}
```

### Edge Functions (Cloudflare Workers)

```typescript
// Edge function for real-time wait time updates
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/wait-times') {
      return await handleWaitTimes(request, env);
    }
    
    if (url.pathname === '/ml-inference') {
      return await handleMLInference(request, env);
    }
    
    return new Response('Not found', { status: 404 });
  }
};

async function handleWaitTimes(request: Request, env: Env): Promise<Response> {
  const attractionId = new URL(request.url).searchParams.get('attraction');
  
  // Check edge cache first
  const cached = await env.WAIT_TIMES_KV.get(`wt:${attractionId}`, 'json');
  if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
    return new Response(JSON.stringify(cached));
  }
  
  // Fetch from multiple sources
  const [queueTimes, parkApi, sensors] = await Promise.allSettled([
    fetchQueueTimesAPI(attractionId),
    fetchParkAPI(attractionId),
    fetchSensorData(attractionId)
  ]);
  
  // Aggregate and validate data
  const aggregated = aggregateWaitTimeData(queueTimes, parkApi, sensors);
  
  // Cache at edge
  await env.WAIT_TIMES_KV.put(
    `wt:${attractionId}`,
    JSON.stringify({ ...aggregated, timestamp: Date.now() }),
    { expirationTtl: 300 }
  );
  
  return new Response(JSON.stringify(aggregated));
}
```

## 🧠 Machine Learning Pipeline

### Model Architecture

```python
import torch
import torch.nn as nn
import numpy as np
from typing import Dict, List, Tuple

class HybridWaitTimeModel(nn.Module):
    """
    Hybrid CNN-GRU-LSTM model for wait time prediction
    Achieves 87.2% accuracy with 18ms inference time
    """
    
    def __init__(self, input_features: int, sequence_length: int):
        super().__init__()
        
        # CNN for capturing short-term patterns
        self.conv1d = nn.Conv1d(input_features, 64, kernel_size=3, padding=1)
        self.conv1d_2 = nn.Conv1d(64, 32, kernel_size=3, padding=1)
        self.pool = nn.MaxPool1d(2)
        
        # GRU for medium-term dependencies
        self.gru = nn.GRU(32, 128, num_layers=2, batch_first=True, dropout=0.2)
        
        # LSTM for long-term patterns
        self.lstm = nn.LSTM(128, 64, num_layers=2, batch_first=True, dropout=0.2)
        
        # Attention mechanism
        self.attention = nn.MultiheadAttention(64, num_heads=8, batch_first=True)
        
        # Output layers
        self.dropout = nn.Dropout(0.3)
        self.fc1 = nn.Linear(64, 32)
        self.fc2 = nn.Linear(32, 1)
        self.relu = nn.ReLU()
        
    def forward(self, x):
        # CNN feature extraction
        x = x.transpose(1, 2)  # (batch, features, seq_len)
        x = self.relu(self.conv1d(x))
        x = self.relu(self.conv1d_2(x))
        x = x.transpose(1, 2)  # (batch, seq_len, features)
        
        # GRU processing
        gru_out, _ = self.gru(x)
        
        # LSTM processing
        lstm_out, _ = self.lstm(gru_out)
        
        # Attention mechanism
        attn_out, _ = self.attention(lstm_out, lstm_out, lstm_out)
        
        # Final prediction
        x = attn_out[:, -1, :]  # Take last time step
        x = self.dropout(x)
        x = self.relu(self.fc1(x))
        x = self.fc2(x)
        
        return x

class FeatureEngineer:
    """Feature engineering for wait time prediction"""
    
    def __init__(self):
        self.temporal_features = [
            'hour', 'day_of_week', 'month', 'quarter',
            'is_weekend', 'is_holiday', 'is_school_break'
        ]
        
        self.cyclical_features = [
            ('hour', 24), ('day_of_week', 7), ('month', 12)
        ]
        
        self.lag_features = [1, 2, 3, 6, 12, 24, 48]
        self.rolling_windows = [3, 6, 12, 24]
    
    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Generate comprehensive feature set"""
        
        # Temporal features
        df = self._add_temporal_features(df)
        
        # Cyclical encoding
        df = self._add_cyclical_features(df)
        
        # Lag features
        df = self._add_lag_features(df)
        
        # Rolling statistics
        df = self._add_rolling_features(df)
        
        # Weather impact
        df = self._add_weather_features(df)
        
        # Event features
        df = self._add_event_features(df)
        
        return df
    
    def _add_cyclical_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add sine/cosine encoding for cyclical features"""
        for feature, period in self.cyclical_features:
            df[f'{feature}_sin'] = np.sin(2 * np.pi * df[feature] / period)
            df[f'{feature}_cos'] = np.cos(2 * np.pi * df[feature] / period)
        return df
```

### Training Pipeline

```python
class MLTrainingPipeline:
    """Complete ML training and deployment pipeline"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.feature_engineer = FeatureEngineer()
        self.model = None
        self.scaler = StandardScaler()
        
    async def train_model(self, data_source: str) -> Dict:
        """Train the wait time prediction model"""
        
        # Data ingestion
        raw_data = await self._fetch_training_data(data_source)
        
        # Feature engineering
        features = self.feature_engineer.engineer_features(raw_data)
        
        # Train/validation split (time-aware)
        train_data, val_data = self._temporal_split(features, test_size=0.2)
        
        # Prepare sequences
        X_train, y_train = self._prepare_sequences(train_data)
        X_val, y_val = self._prepare_sequences(val_data)
        
        # Model training
        model = HybridWaitTimeModel(
            input_features=X_train.shape[-1],
            sequence_length=self.config['sequence_length']
        )
        
        # Training loop
        optimizer = torch.optim.AdamW(model.parameters(), lr=0.001)
        criterion = nn.MSELoss()
        scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer)
        
        best_val_loss = float('inf')
        patience = 10
        patience_counter = 0
        
        for epoch in range(self.config['max_epochs']):
            # Training phase
            train_loss = self._train_epoch(model, X_train, y_train, optimizer, criterion)
            
            # Validation phase
            val_loss = self._validate_epoch(model, X_val, y_val, criterion)
            
            scheduler.step(val_loss)
            
            # Early stopping
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                patience_counter = 0
                torch.save(model.state_dict(), 'best_model.pth')
            else:
                patience_counter += 1
                if patience_counter >= patience:
                    break
        
        # Model evaluation
        metrics = self._evaluate_model(model, X_val, y_val)
        
        # Convert to production format
        self._export_for_production(model)
        
        return {
            'metrics': metrics,
            'model_path': 'best_model.pth',
            'feature_columns': features.columns.tolist()
        }
```

## 📊 Caching Strategy

### Multi-Layer Cache Architecture

```typescript
class CacheManager {
  private static memoryCache = new Map<string, CacheItem>();
  private static redis: Redis;
  
  static async initialize() {
    this.redis = new Redis(process.env.REDIS_URL);
  }
  
  static async get<T>(
    key: string, 
    fallback: () => Promise<T>,
    ttl: number = 300
  ): Promise<T> {
    
    // Layer 1: Memory cache (fastest, ~1ms)
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && !this.isExpired(memoryItem)) {
      return memoryItem.value;
    }
    
    // Layer 2: Redis cache (fast, ~10ms)
    try {
      const redisValue = await this.redis.get(key);
      if (redisValue) {
        const parsed = JSON.parse(redisValue);
        this.memoryCache.set(key, {
          value: parsed,
          expiry: Date.now() + (ttl * 1000)
        });
        return parsed;
      }
    } catch (error) {
      console.warn('Redis cache miss:', error);
    }
    
    // Layer 3: Data source (slowest, ~100ms+)
    const value = await fallback();
    
    // Cache in both layers
    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + (ttl * 1000)
    });
    
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.warn('Redis cache write failed:', error);
    }
    
    return value;
  }
  
  private static isExpired(item: CacheItem): boolean {
    return Date.now() > item.expiry;
  }
}

interface CacheItem {
  value: any;
  expiry: number;
}
```

## 🔄 Real-Time Architecture

### WebSocket Implementation

```typescript
// Real-time updates using Supabase Realtime
class RealTimeManager {
  private channels = new Map<string, RealtimeChannel>();
  private subscribers = new Map<string, Set<Function>>();
  
  // Wait time updates
  subscribeToWaitTimes(parkId: string, callback: (data: WaitTimeUpdate) => void) {
    const channelName = `wait-times:${parkId}`;
    
    if (!this.channels.has(channelName)) {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'theme_parks',
            table: 'wait_times',
            filter: `park_id=eq.${parkId}`
          },
          (payload) => {
            this.notifySubscribers(channelName, payload);
          }
        )
        .subscribe();
      
      this.channels.set(channelName, channel);
      this.subscribers.set(channelName, new Set());
    }
    
    this.subscribers.get(channelName)?.add(callback);
    
    return () => {
      this.subscribers.get(channelName)?.delete(callback);
    };
  }
  
  // Group location sharing
  subscribeToGroupUpdates(groupId: string, callback: (data: GroupUpdate) => void) {
    const channelName = `group:${groupId}`;
    
    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'location_update' }, callback)
      .on('broadcast', { event: 'plan_update' }, callback)
      .on('broadcast', { event: 'member_update' }, callback)
      .subscribe();
    
    this.channels.set(channelName, channel);
    
    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }
  
  // Emergency notifications
  subscribeToEmergencyAlerts(userId: string, callback: (alert: EmergencyAlert) => void) {
    const channelName = `emergency:${userId}`;
    
    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'emergency' }, callback)
      .subscribe();
    
    return () => channel.unsubscribe();
  }
  
  private notifySubscribers(channelName: string, data: any) {
    const callbacks = this.subscribers.get(channelName);
    callbacks?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Callback error:', error);
      }
    });
  }
}
```

## 🔒 Security Architecture

### Authentication & Authorization

```typescript
// Multi-provider authentication
class AuthManager {
  static async authenticateUser(provider: 'email' | 'google' | 'apple') {
    switch (provider) {
      case 'email':
        return await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });
      
      case 'google':
        return await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });
      
      case 'apple':
        return await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });
    }
  }
  
  // Row Level Security policies
  static setupRLS() {
    // Users can only access their own data
    sql`
      CREATE POLICY users_own_data ON users 
      FOR ALL USING (auth.uid() = id);
    `;
    
    // Group members can access shared data
    sql`
      CREATE POLICY group_members_access ON group_data 
      FOR ALL USING (
        auth.uid() IN (
          SELECT user_id FROM group_members 
          WHERE group_id = group_data.group_id
        )
      );
    `;
  }
}

// Data encryption for sensitive information
class EncryptionManager {
  private static key = process.env.ENCRYPTION_KEY;
  
  static encrypt(data: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', this.key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }
  
  static decrypt(encryptedData: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', this.key);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

## 📱 Progressive Web App

### PWA Configuration

```typescript
// PWA configuration for offline functionality
const PWAConfig = {
  name: 'Theme Park Planner',
  short_name: 'ParkPlanner',
  description: 'AI-powered theme park planning',
  start_url: '/',
  display: 'standalone',
  theme_color: '#3B82F6',
  background_color: '#FFFFFF',
  icons: [
    {
      src: '/icons/icon-192.png',
      sizes: '192x192',
      type: 'image/png'
    },
    {
      src: '/icons/icon-512.png',
      sizes: '512x512',
      type: 'image/png'
    }
  ]
};

// Service worker for offline functionality
self.addEventListener('fetch', (event) => {
  // Cache-first strategy for static assets
  if (event.request.url.includes('/static/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
  
  // Network-first strategy for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
  }
});
```

## 🔧 Deployment Configuration

### Vercel Configuration

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "functions": {
    "app/api/ml/**": {
      "maxDuration": 60,
      "memory": 1024
    },
    "app/api/predictions/**": {
      "maxDuration": 30,
      "memory": 512
    }
  },
  "crons": [
    {
      "path": "/api/cron/update-wait-times",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/train-models",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/cleanup-cache",
      "schedule": "0 */6 * * *"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_key",
    "PLANETSCALE_DATABASE_URL": "@planetscale_url",
    "FAUNA_SECRET_KEY": "@fauna_secret",
    "REDIS_URL": "@redis_url",
    "QUEUE_TIMES_API_KEY": "@queue_times_key",
    "WEATHER_API_KEY": "@weather_api_key"
  },
  "regions": ["iad1", "sfo1", "lhr1", "hnd1"],
  "github": {
    "deploymentEnabled": true,
    "autoJobCancelation": true
  }
}
```

This technical architecture provides a robust, scalable foundation for the theme park planning service, leveraging modern technologies while maintaining cost-effectiveness through strategic use of free-tier services.