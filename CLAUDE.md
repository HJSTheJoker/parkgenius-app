# 🎢 Theme Park Planning Service - Claude Assistant Guide

## Project Overview

This is a comprehensive, AI-powered theme park planning platform that helps visitors optimize their park experiences through intelligent predictions, personalized recommendations, and accessibility-first design.

## 🎯 Core Features

### 1. Predictive Intelligence
- **Wait Time Predictions**: 85%+ accuracy using hybrid CNN-GRU-LSTM models
- **Crowd Flow Analysis**: Real-time crowd density and movement patterns
- **Weather Impact Modeling**: Ride closure predictions and weather-aware planning
- **Dynamic Re-routing**: Real-time itinerary adjustments based on changing conditions

### 2. Accessibility Suite
- **Universal Route Planning**: Wheelchair-accessible pathfinding with rest stops
- **Sensory-Friendly Features**: Autism spectrum support with noise/light indicators
- **Communication Assistance**: AAC boards, voice control, and emergency features
- **Medical Integration**: Medication reminders and emergency contact systems

### 3. Social & Gamification
- **Group Coordination**: Real-time location sharing with privacy controls
- **Achievement System**: NFT collectibles and educational challenges
- **Community Features**: User-generated content and expert recommendations
- **Safety Features**: Emergency assistance and family coordination

### 4. Technical Excellence
- **Edge Computing**: Sub-20ms response times via Cloudflare Workers
- **Multi-Database Architecture**: Supabase + PlanetScale + FaunaDB + Redis
- **Progressive Web App**: Offline functionality and mobile optimization
- **Real-time Updates**: WebSocket connections for live data

## 🏗️ Technical Stack

### Frontend
- **Next.js 13+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Query** for data fetching
- **Zustand** for state management

### Backend
- **Vercel** for hosting and serverless functions
- **Supabase** (PostgreSQL) for primary data
- **PlanetScale** (MySQL) for high-frequency data
- **FaunaDB** for real-time features
- **Redis** for caching

### AI/ML
- **Hybrid CNN-GRU-LSTM** models for predictions
- **TensorFlow.js** for client-side inference
- **PyTorch** for model training
- **Edge ML** deployment for performance

### External APIs
- **Queue-Times API** for crowd data
- **Open-Meteo** for weather (free tier)
- **National Weather Service** for US parks
- **Theme park APIs** (Disney, Universal, etc.)

## 📁 Project Structure

```
/
├── app/                     # Next.js App Router
│   ├── (auth)/             # Authentication routes
│   ├── (dashboard)/        # Main application
│   └── api/                # API endpoints
├── components/             # React components
│   ├── ui/                 # Base components
│   ├── features/           # Feature-specific
│   └── charts/             # Data visualization
├── lib/                    # Utilities and clients
│   ├── database/           # DB connections
│   ├── ml/                 # ML utilities
│   └── auth/               # Authentication
├── docs/                   # Documentation
│   ├── features/           # Feature specs
│   ├── development/        # Dev guides
│   └── api/                # API docs
└── types/                  # TypeScript definitions
```

## 🛠️ Development Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run start              # Start production server

# Testing
npm run test               # Unit tests
npm run test:e2e           # End-to-end tests
npm run test:coverage      # Coverage report

# Database
npm run db:migrate         # Run migrations
npm run db:seed            # Seed data
npm run db:studio          # Open database studio

# Machine Learning
npm run ml:train           # Train models
npm run ml:evaluate        # Evaluate performance
npm run ml:deploy          # Deploy to edge

# Code Quality
npm run lint               # ESLint
npm run format             # Prettier
npm run type-check         # TypeScript
```

## 🔧 Environment Setup

1. **Copy environment file**: `cp .env.example .env.local`
2. **Install dependencies**: `npm install`
3. **Setup databases**: Configure Supabase, PlanetScale, FaunaDB
4. **Run migrations**: `npm run db:migrate`
5. **Start development**: `npm run dev`

## 📊 Key Metrics & Targets

| Metric | Current Target | Industry Standard |
|--------|----------------|-------------------|
| Wait Time Accuracy | 85%+ | 70% |
| Response Time | <20ms | <100ms |
| User Satisfaction | 4.8+ stars | 4.2 stars |
| Accessibility Coverage | 95% | 60% |
| Cost per User | <$0.05 | $0.20+ |

## 🎮 Claude-Specific Guidelines

### When Working on This Project:

1. **Always Reference Documentation**: Check `/docs` for comprehensive feature specs
2. **Follow Accessibility Standards**: Ensure WCAG 2.1 Level AA compliance
3. **Optimize for Performance**: Target <20ms API responses and <2s page loads
4. **Privacy-First Approach**: Implement granular privacy controls and GDPR compliance
5. **Mobile-First Design**: Ensure excellent mobile and PWA experience

### Common Development Tasks:

#### Adding New Features
1. Create feature specification in `/docs/features/`
2. Implement TypeScript interfaces in `/types/`
3. Build components in `/components/features/`
4. Add API routes in `/app/api/`
5. Update documentation

#### ML Model Updates
1. Train models using `/lib/ml/training.py`
2. Evaluate performance with test datasets
3. Deploy quantized models to edge
4. Update inference endpoints
5. Monitor accuracy metrics

#### Database Changes
1. Create migration files
2. Update TypeScript schemas
3. Test with seed data
4. Deploy to staging first
5. Monitor performance impact

### Testing Requirements

- **Unit Tests**: 90%+ code coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user journeys
- **Accessibility Tests**: Automated and manual
- **Performance Tests**: Load and stress testing

### Security Considerations

- **Authentication**: JWT with secure refresh tokens
- **Authorization**: Row-level security (RLS)
- **Data Encryption**: At rest and in transit
- **API Security**: Rate limiting and input validation
- **Privacy**: GDPR/CCPA compliance

## 🚀 Deployment Process

### Vercel Deployment
- **Automatic**: Push to main branch
- **Preview**: Feature branch deployments
- **Environment**: Production variables in Vercel dashboard

### Database Migrations
- **Staging**: Test migrations first
- **Production**: Automated via CI/CD
- **Rollback**: Always have rollback plan

### ML Model Deployment
- **Edge**: Cloudflare Workers for inference
- **Training**: Scheduled retraining jobs
- **Monitoring**: Model drift detection

## 🔍 Debugging & Monitoring

### Local Development
- **Browser DevTools**: React/Network/Performance tabs
- **Database**: Supabase studio and logs
- **API**: Built-in request logging
- **ML**: Model performance dashboards

### Production Monitoring
- **Uptime**: Vercel analytics
- **Performance**: Web Vitals tracking
- **Errors**: Sentry integration
- **Business**: Custom analytics dashboard

## 📚 Learning Resources

### Project Documentation
- **Executive Summary**: `/docs/executive-summary.md`
- **Technical Architecture**: `/docs/technical-architecture.md`
- **API Documentation**: `/docs/api/overview.md`
- **Development Guide**: `/docs/development/getting-started.md`

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ML Best Practices](https://developers.google.com/machine-learning/guides)

## 🆘 Common Issues & Solutions

### Development Issues
- **Port conflicts**: Use `npx kill-port 3000`
- **Cache issues**: Clear `.next` folder
- **Dependency issues**: Delete `node_modules` and reinstall

### Database Issues
- **Connection errors**: Check environment variables
- **Migration failures**: Rollback and fix conflicts
- **Performance**: Check query optimization

### API Issues
- **Rate limiting**: Implement exponential backoff
- **Timeout errors**: Check external API status
- **Data inconsistency**: Validate data sources

## 🎯 Project Priorities

### Current Phase: Foundation (Months 1-3)
- [ ] Complete database schema
- [ ] Implement basic authentication
- [ ] Build core UI components
- [ ] Integrate external APIs
- [ ] Set up testing framework

### Next Phase: Intelligence (Months 4-6)
- [ ] ML model development
- [ ] Advanced predictions
- [ ] Optimization algorithms
- [ ] Weather integration
- [ ] Performance optimization

### Future Phases
- **Social Features** (Months 7-9)
- **Advanced Accessibility** (Months 10-12)
- **Enterprise Features** (Year 2)

Remember: This project aims to be the most comprehensive, accessible, and intelligent theme park planning platform ever built. Every feature should enhance the magical experience for all users! 🎢✨