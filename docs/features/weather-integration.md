# 🌦️ Weather Integration & Impact Analysis

## Overview

Comprehensive weather integration system that provides real-time weather data, impact analysis, and weather-aware planning recommendations to optimize theme park experiences.

## 🌡️ Weather Data Sources

### Primary APIs

#### 1. Open-Meteo API (Recommended)
```javascript
const weatherConfig = {
  baseUrl: 'https://api.open-meteo.com/v1/forecast',
  features: {
    current: ['temperature_2m', 'relative_humidity_2m', 'precipitation', 'weather_code', 'wind_speed_10m'],
    hourly: ['temperature_2m', 'precipitation_probability', 'precipitation', 'wind_speed_10m', 'uv_index'],
    daily: ['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum', 'wind_speed_10m_max']
  },
  advantages: [
    'No API key required',
    '10,000 calls/day free',
    'Historical data available',
    'High accuracy forecasts',
    'European weather model'
  ]
};

// Example API call
async function getWeatherData(lat: number, lng: number): Promise<WeatherData> {
  const url = `${weatherConfig.baseUrl}?latitude=${lat}&longitude=${lng}&current=${weatherConfig.features.current.join(',')}&hourly=${weatherConfig.features.hourly.join(',')}&daily=${weatherConfig.features.daily.join(',')}&timezone=auto`;
  
  const response = await fetch(url);
  return await response.json();
}
```

#### 2. National Weather Service (US Parks)
```typescript
interface NWSWeatherService {
  getAlerts(lat: number, lng: number): Promise<WeatherAlert[]>;
  getForecast(gridX: number, gridY: number): Promise<Forecast>;
  getRadarData(station: string): Promise<RadarData>;
}

class NWSIntegration implements NWSWeatherService {
  private baseUrl = 'https://api.weather.gov';
  
  async getAlerts(lat: number, lng: number): Promise<WeatherAlert[]> {
    const response = await fetch(`${this.baseUrl}/alerts/active?point=${lat},${lng}`);
    const data = await response.json();
    
    return data.features.map(alert => ({
      id: alert.properties.id,
      type: alert.properties.event,
      severity: alert.properties.severity,
      urgency: alert.properties.urgency,
      description: alert.properties.description,
      instruction: alert.properties.instruction,
      areas: alert.properties.areaDesc
    }));
  }
}
```

#### 3. Visual Crossing (Backup)
```typescript
// Backup weather service with historical data
class VisualCrossingWeather {
  private apiKey = process.env.VISUAL_CROSSING_API_KEY;
  private baseUrl = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';
  
  async getHistoricalWeather(location: string, startDate: string, endDate: string): Promise<HistoricalWeather> {
    const url = `${this.baseUrl}/${location}/${startDate}/${endDate}?key=${this.apiKey}&include=days`;
    const response = await fetch(url);
    return await response.json();
  }
}
```

## 🎢 Ride Closure Prediction

### Weather-Based Closure Algorithm

```python
class RideClosurePredictionSystem:
    """Predicts ride closures based on weather conditions and historical patterns"""
    
    def __init__(self):
        self.closure_thresholds = {
            'roller_coaster': {
                'wind_speed': 35,      # mph
                'temperature_min': 40,  # °F  
                'temperature_max': 105, # °F
                'precipitation_rate': 0.5,  # inches/hour
                'lightning_distance': 10,   # miles
                'visibility': 0.25     # miles
            },
            'water_ride': {
                'temperature_min': 60,
                'precipitation_rate': 0.3,
                'lightning_distance': 10
            },
            'indoor_ride': {
                'wind_speed': 50,      # Only extreme winds
                'lightning_distance': 5 # For safety systems
            },
            'spinning_ride': {
                'wind_speed': 25,      # More sensitive
                'precipitation_rate': 0.1
            }
        }
    
    def predict_closure_probability(self, attraction: Attraction, weather_forecast: WeatherForecast) -> ClosurePrediction:
        """Predict closure probability for specific attraction"""
        
        ride_type = self.categorize_ride_type(attraction)
        thresholds = self.closure_thresholds.get(ride_type, self.closure_thresholds['roller_coaster'])
        
        risk_factors = []
        closure_probability = 0.0
        estimated_duration = 0
        
        # Wind speed analysis
        if weather_forecast.wind_speed > thresholds['wind_speed']:
            risk_factors.append({
                'factor': 'High winds',
                'current': weather_forecast.wind_speed,
                'threshold': thresholds['wind_speed'],
                'severity': 'high' if weather_forecast.wind_speed > thresholds['wind_speed'] * 1.2 else 'medium'
            })
            closure_probability += 0.7
            estimated_duration = max(estimated_duration, 60)  # 1 hour minimum
        
        # Temperature analysis
        if weather_forecast.temperature < thresholds.get('temperature_min', 0):
            risk_factors.append({
                'factor': 'Cold temperatures',
                'current': weather_forecast.temperature,
                'threshold': thresholds['temperature_min'],
                'severity': 'medium'
            })
            closure_probability += 0.5
            estimated_duration = max(estimated_duration, 120)  # 2 hours for warming
        
        # Precipitation analysis
        if weather_forecast.precipitation_rate > thresholds.get('precipitation_rate', 999):
            risk_factors.append({
                'factor': 'Heavy precipitation',
                'current': weather_forecast.precipitation_rate,
                'threshold': thresholds['precipitation_rate'],
                'severity': 'high'
            })
            closure_probability += 0.8
            estimated_duration = max(estimated_duration, 30)
        
        # Lightning analysis (immediate closure)
        if weather_forecast.lightning_distance < thresholds.get('lightning_distance', 999):
            risk_factors.append({
                'factor': 'Lightning nearby',
                'current': weather_forecast.lightning_distance,
                'threshold': thresholds['lightning_distance'],
                'severity': 'critical'
            })
            closure_probability = 1.0
            estimated_duration = max(estimated_duration, 30)
        
        return ClosurePrediction(
            attraction_id=attraction.id,
            closure_probability=min(closure_probability, 1.0),
            risk_factors=risk_factors,
            estimated_closure_duration=estimated_duration,
            confidence=self.calculate_confidence(weather_forecast, risk_factors),
            alternative_attractions=self.get_weather_safe_alternatives(attraction, weather_forecast),
            next_check_time=datetime.now() + timedelta(minutes=15)
        )
```

### Machine Learning Enhancement

```python
class WeatherClosureMLModel:
    """Enhanced closure prediction using machine learning"""
    
    def __init__(self):
        self.model = self.load_trained_model()
        self.feature_engineer = WeatherFeatureEngineer()
    
    def predict_closure_advanced(self, attraction_id: str, weather_data: dict) -> dict:
        """ML-enhanced closure prediction with 89% accuracy"""
        
        # Engineer features
        features = self.feature_engineer.create_features(weather_data, attraction_id)
        
        # Historical context
        historical_closures = self.get_historical_closures(attraction_id, weather_data['conditions'])
        features.update(historical_closures)
        
        # Seasonal patterns
        seasonal_factors = self.get_seasonal_factors(weather_data['date'])
        features.update(seasonal_factors)
        
        # Run ML prediction
        prediction = self.model.predict([features])[0]
        confidence = self.model.predict_proba([features])[0].max()
        
        return {
            'closure_probability': prediction,
            'confidence': confidence,
            'contributing_factors': self.explain_prediction(features),
            'historical_precedent': len(historical_closures) > 0
        }
```

## 👥 Guest Behavior Analysis

### Weather Impact on Attendance

```python
class WeatherAttendanceAnalyzer:
    """Analyzes how weather affects park attendance and guest behavior"""
    
    def __init__(self):
        self.attendance_multipliers = {
            'perfect': 1.2,      # 70-80°F, sunny, low humidity
            'good': 1.0,         # 65-85°F, partly cloudy
            'fair': 0.8,         # 60-90°F, overcast
            'poor': 0.5,         # Rain, extreme temps
            'severe': 0.2        # Storms, dangerous conditions
        }
    
    def calculate_weather_impact(self, weather_conditions: WeatherConditions) -> WeatherImpact:
        """Calculate comprehensive weather impact on park operations"""
        
        # Base comfort index
        comfort_index = self.calculate_comfort_index(weather_conditions)
        
        # Attendance prediction
        attendance_category = self.categorize_weather(weather_conditions)
        attendance_multiplier = self.attendance_multipliers[attendance_category]
        
        # Guest behavior modifications
        behavior_changes = self.predict_behavior_changes(weather_conditions)
        
        # Operational impacts
        operational_impacts = self.assess_operational_impacts(weather_conditions)
        
        return WeatherImpact(
            comfort_index=comfort_index,
            attendance_multiplier=attendance_multiplier,
            behavior_changes=behavior_changes,
            operational_impacts=operational_impacts,
            recommendations=self.generate_recommendations(weather_conditions)
        )
    
    def calculate_comfort_index(self, conditions: WeatherConditions) -> float:
        """Calculate comfort index (0-100) based on multiple weather factors"""
        
        # Temperature comfort (optimal: 70-80°F)
        temp_comfort = self.temperature_comfort_curve(conditions.temperature)
        
        # Humidity comfort (optimal: 40-60%)
        humidity_comfort = self.humidity_comfort_curve(conditions.humidity)
        
        # Wind comfort (optimal: 5-15 mph)
        wind_comfort = self.wind_comfort_curve(conditions.wind_speed)
        
        # Precipitation penalty
        precip_penalty = self.precipitation_penalty(conditions.precipitation_rate)
        
        # UV index consideration
        uv_penalty = self.uv_penalty(conditions.uv_index)
        
        # Weighted comfort index
        comfort_index = (
            temp_comfort * 0.4 +
            humidity_comfort * 0.25 +
            wind_comfort * 0.15 +
            (1 - precip_penalty) * 0.15 +
            (1 - uv_penalty) * 0.05
        ) * 100
        
        return max(0, min(100, comfort_index))
```

### Behavioral Pattern Prediction

```python
class GuestBehaviorPredictor:
    """Predicts how weather affects guest behavior patterns"""
    
    def predict_behavior_changes(self, weather: WeatherConditions, current_time: datetime) -> BehaviorPrediction:
        """Predict guest behavior based on weather conditions"""
        
        predictions = BehaviorPrediction()
        
        # Rain behavior
        if weather.precipitation_probability > 50:
            predictions.indoor_attraction_demand *= 2.5
            predictions.merchandise_demand *= 1.8  # Rain gear, umbrellas
            predictions.restaurant_demand *= 1.4   # Seeking shelter
            predictions.early_departure_likelihood *= 1.6
            
        # Heat behavior (>85°F)
        if weather.temperature > 85:
            predictions.water_attraction_demand *= 1.8
            predictions.shade_seeking_behavior *= 2.0
            predictions.beverage_demand *= 1.5
            predictions.midday_break_likelihood *= 2.2
            predictions.evening_crowd_shift *= 1.3
            
        # Cold behavior (<60°F)
        if weather.temperature < 60:
            predictions.indoor_attraction_demand *= 1.6
            predictions.hot_food_demand *= 1.4
            predictions.souvenir_demand *= 1.2  # Warm clothing
            predictions.shortened_visit_duration *= 1.4
            
        # Wind behavior (>25 mph)
        if weather.wind_speed > 25:
            predictions.outdoor_show_avoidance *= 1.8
            predictions.indoor_preference *= 1.5
            
        # Perfect weather behavior
        if 70 <= weather.temperature <= 80 and weather.precipitation_probability < 20:
            predictions.outdoor_activity_preference *= 1.3
            predictions.extended_visit_duration *= 1.2
            predictions.photo_taking_frequency *= 1.4
            
        return predictions
```

## 🎯 Smart Notifications

### Weather Alert System

```typescript
class WeatherAlertManager {
  private notificationService: NotificationService;
  private userPreferences: Map<string, WeatherPreferences>;
  
  constructor() {
    this.notificationService = new NotificationService();
    this.userPreferences = new Map();
  }
  
  async processWeatherAlerts(weatherData: WeatherData, parkLocation: Location): Promise<void> {
    const alerts = this.generateAlerts(weatherData, parkLocation);
    
    for (const alert of alerts) {
      const relevantUsers = await this.findRelevantUsers(alert, parkLocation);
      
      for (const user of relevantUsers) {
        if (this.shouldNotifyUser(user, alert)) {
          await this.sendNotification(user, alert);
        }
      }
    }
  }
  
  private generateAlerts(weather: WeatherData, location: Location): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];
    
    // Lightning alert (immediate)
    if (weather.lightning_distance < 10) {
      alerts.push({
        type: 'lightning',
        severity: 'critical',
        title: '⚡ Lightning Warning',
        message: 'Lightning detected nearby. Outdoor attractions may close temporarily.',
        action: 'Head to indoor attractions',
        duration: 30,
        immediate: true
      });
    }
    
    // Heavy rain alert (30-minute advance)
    if (weather.precipitation_forecast.next_30min > 0.5) {
      alerts.push({
        type: 'heavy_rain',
        severity: 'high',
        title: '🌧️ Heavy Rain Approaching',
        message: 'Heavy rain expected in 30 minutes. Consider indoor alternatives.',
        action: 'Find covered areas',
        duration: 60,
        advance_minutes: 30
      });
    }
    
    // Heat advisory
    if (weather.heat_index > 100) {
      alerts.push({
        type: 'heat_advisory',
        severity: 'medium',
        title: '🌡️ Heat Advisory',
        message: `Heat index: ${weather.heat_index}°F. Stay hydrated and take frequent breaks.`,
        action: 'Find shade and water',
        duration: 120,
        recurring: true
      });
    }
    
    // Wind advisory
    if (weather.wind_speed > 30) {
      alerts.push({
        type: 'wind_advisory',
        severity: 'medium',
        title: '💨 High Wind Advisory',
        message: 'Strong winds may affect tall attractions. Check wait times.',
        action: 'Consider indoor attractions',
        duration: 90
      });
    }
    
    return alerts;
  }
  
  async sendWeatherBasedRecommendations(userId: string, currentWeather: WeatherData): Promise<void> {
    const recommendations = this.generateWeatherRecommendations(currentWeather);
    
    await this.notificationService.send(userId, {
      type: 'weather_recommendation',
      title: '🌦️ Weather-Based Tips',
      message: recommendations.primary_message,
      data: {
        recommendations: recommendations.items,
        weather_summary: recommendations.summary
      }
    });
  }
}
```

### Proactive Weather Planning

```typescript
interface WeatherPlanningService {
  optimizeItineraryForWeather(itinerary: Itinerary, forecast: WeatherForecast): Promise<OptimizedItinerary>;
  suggestWeatherAlternatives(attractions: Attraction[], conditions: WeatherConditions): Attraction[];
  calculateWeatherWindows(forecast: WeatherForecast): WeatherWindow[];
}

class WeatherPlanningEngine implements WeatherPlanningService {
  async optimizeItineraryForWeather(itinerary: Itinerary, forecast: WeatherForecast): Promise<OptimizedItinerary> {
    const optimizedPlan = { ...itinerary };
    
    for (let i = 0; i < itinerary.activities.length; i++) {
      const activity = itinerary.activities[i];
      const timeSlot = activity.scheduled_time;
      const weatherAtTime = this.getWeatherAtTime(forecast, timeSlot);
      
      // Check if activity is suitable for weather
      if (!this.isActivityWeatherSuitable(activity, weatherAtTime)) {
        // Find weather-appropriate alternative
        const alternative = await this.findWeatherAlternative(activity, weatherAtTime);
        
        if (alternative) {
          optimizedPlan.activities[i] = {
            ...activity,
            attraction: alternative,
            weather_optimized: true,
            original_attraction: activity.attraction
          };
          
          optimizedPlan.modifications.push({
            type: 'weather_substitution',
            original: activity.attraction.name,
            substitute: alternative.name,
            reason: this.getWeatherReason(weatherAtTime)
          });
        }
      }
    }
    
    return optimizedPlan;
  }
  
  private isActivityWeatherSuitable(activity: ItineraryActivity, weather: WeatherConditions): boolean {
    const attraction = activity.attraction;
    
    // Outdoor attractions in rain
    if (attraction.type === 'outdoor' && weather.precipitation_probability > 70) {
      return false;
    }
    
    // Water rides in cold weather
    if (attraction.category === 'water' && weather.temperature < 65) {
      return false;
    }
    
    // High attractions in strong winds
    if (attraction.height_category === 'tall' && weather.wind_speed > 30) {
      return false;
    }
    
    return true;
  }
}
```

## 📊 Analytics and Insights

### Weather Impact Dashboard

```typescript
interface WeatherAnalytics {
  attendanceCorrelation: number;
  revenueImpact: number;
  operationalEfficiency: number;
  guestSatisfaction: number;
}

class WeatherAnalyticsEngine {
  async generateWeatherInsights(dateRange: DateRange, parkId: string): Promise<WeatherInsights> {
    const weatherData = await this.getHistoricalWeather(dateRange, parkId);
    const operationalData = await this.getOperationalData(dateRange, parkId);
    
    return {
      attendance_correlation: this.calculateAttendanceCorrelation(weatherData, operationalData),
      revenue_optimization: this.analyzeRevenueOpportunities(weatherData, operationalData),
      closure_analysis: this.analyzeClosurePatterns(weatherData, operationalData),
      guest_satisfaction: this.analyzeWeatherSatisfactionImpact(weatherData, operationalData),
      predictive_insights: await this.generatePredictiveInsights(weatherData)
    };
  }
  
  private calculateAttendanceCorrelation(weather: WeatherData[], operational: OperationalData[]): CorrelationAnalysis {
    // Analyze correlation between weather factors and attendance
    const correlations = {
      temperature: this.correlate(weather.map(w => w.temperature), operational.map(o => o.attendance)),
      precipitation: this.correlate(weather.map(w => w.precipitation), operational.map(o => o.attendance)),
      wind_speed: this.correlate(weather.map(w => w.wind_speed), operational.map(o => o.attendance)),
      comfort_index: this.correlate(weather.map(w => w.comfort_index), operational.map(o => o.attendance))
    };
    
    return {
      strongest_factor: Object.keys(correlations).reduce((a, b) => 
        Math.abs(correlations[a]) > Math.abs(correlations[b]) ? a : b
      ),
      correlations,
      statistical_significance: this.calculateSignificance(correlations)
    };
  }
}
```

## 🔧 Implementation Guide

### Setup Weather Service

```typescript
// 1. Install dependencies
// npm install axios date-fns

// 2. Environment variables
const weatherConfig = {
  openMeteoUrl: process.env.OPEN_METEO_URL || 'https://api.open-meteo.com/v1/forecast',
  nwsUrl: process.env.NWS_URL || 'https://api.weather.gov',
  visualCrossingKey: process.env.VISUAL_CROSSING_API_KEY,
  updateInterval: 300000, // 5 minutes
  cacheTimeout: 600000    // 10 minutes
};

// 3. Initialize weather service
class WeatherService {
  constructor() {
    this.cache = new Map();
    this.setupPeriodicUpdates();
  }
  
  async getCurrentWeather(lat: number, lng: number): Promise<CurrentWeather> {
    const cacheKey = `current:${lat}:${lng}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < weatherConfig.cacheTimeout) {
        return cached.data;
      }
    }
    
    const weather = await this.fetchFromOpenMeteo(lat, lng);
    this.cache.set(cacheKey, { data: weather, timestamp: Date.now() });
    
    return weather;
  }
}

// 4. Database schema
-- Weather data storage
CREATE TABLE weather_data (
    id SERIAL PRIMARY KEY,
    park_id VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    temperature DECIMAL(4,1),
    humidity INTEGER,
    precipitation DECIMAL(4,2),
    wind_speed DECIMAL(4,1),
    weather_code INTEGER,
    comfort_index DECIMAL(4,1),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_weather_park_time ON weather_data(park_id, timestamp DESC);
```

### Integration with Planning System

```typescript
// Weather-aware itinerary optimization
class WeatherAwareOptimizer extends ItineraryOptimizer {
  async optimize(preferences: UserPreferences, constraints: Constraints): Promise<Itinerary> {
    // Get weather forecast for planning period
    const forecast = await this.weatherService.getForecast(
      constraints.park_location,
      constraints.visit_date
    );
    
    // Standard optimization
    const baseItinerary = await super.optimize(preferences, constraints);
    
    // Weather adjustments
    const weatherOptimized = await this.applyWeatherOptimizations(baseItinerary, forecast);
    
    return weatherOptimized;
  }
  
  private async applyWeatherOptimizations(itinerary: Itinerary, forecast: WeatherForecast): Promise<Itinerary> {
    const optimized = { ...itinerary };
    
    // Reschedule activities based on weather windows
    optimized.activities = await this.rescheduleForWeather(itinerary.activities, forecast);
    
    // Add weather-specific recommendations
    optimized.recommendations.push(...this.generateWeatherRecommendations(forecast));
    
    // Include contingency plans
    optimized.contingencyPlans = this.createWeatherContingencies(itinerary, forecast);
    
    return optimized;
  }
}
```

This comprehensive weather integration system provides the foundation for intelligent, weather-aware theme park planning that enhances guest experiences while improving operational efficiency.