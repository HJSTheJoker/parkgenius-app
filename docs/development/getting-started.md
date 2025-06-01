# 🚀 Getting Started

## Quick Start Guide

This guide will help you set up the development environment and get the theme park planning service running locally.

## 📋 Prerequisites

### Required Software
- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher (comes with Node.js)
- **Git**: For version control
- **VS Code**: Recommended IDE with extensions

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-playwright.playwright",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml"
  ]
}
```

## 🛠️ Environment Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-org/theme-park-planning-service.git
cd theme-park-planning-service

# Create a new branch for your work
git checkout -b feature/your-feature-name
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Verify installation
npm run check-dependencies
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
code .env.local
```

### Required Environment Variables

```bash
# .env.local

# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# External APIs
QUEUE_TIMES_API_KEY=your_queue_times_api_key
WEATHER_API_KEY=your_weather_api_key
OPEN_METEO_API_URL=https://api.open-meteo.com/v1/forecast

# Machine Learning
ML_MODEL_PATH=/models/wait-time-predictor.onnx
TENSORFLOW_JS_BACKEND=webgl

# Caching
REDIS_URL=your_redis_url
REDIS_PASSWORD=your_redis_password

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id

# Development
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

```bash
# Run database migrations
npm run db:migrate

# Seed development data
npm run db:seed

# Verify database setup
npm run db:status
```

### 5. Start Development Server

```bash
# Start the development server
npm run dev

# Open in browser
open http://localhost:3000
```

## 🏗️ Project Structure

```
theme-park-planning-service/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth route group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/             # Main app route group
│   │   ├── parks/
│   │   ├── itinerary/
│   │   ├── groups/
│   │   └── profile/
│   ├── api/                     # API routes
│   │   ├── auth/
│   │   ├── parks/
│   │   ├── predictions/
│   │   ├── weather/
│   │   └── ml/
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── loading.tsx              # Global loading UI
│   ├── error.tsx                # Global error UI
│   └── page.tsx                 # Home page
├── components/                   # Reusable components
│   ├── ui/                      # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   └── index.ts
│   ├── features/                # Feature-specific components
│   │   ├── auth/
│   │   ├── parks/
│   │   ├── itinerary/
│   │   ├── weather/
│   │   └── accessibility/
│   ├── charts/                  # Data visualization
│   ├── maps/                    # Interactive maps
│   └── layout/                  # Layout components
├── lib/                         # Utilities and configurations
│   ├── auth/                    # Authentication utilities
│   ├── database/                # Database clients and schemas
│   │   ├── supabase.ts
│   │   ├── planetscale.ts
│   │   └── schemas.ts
│   ├── ml/                      # Machine learning utilities
│   │   ├── predictor.ts
│   │   ├── features.ts
│   │   └── models/
│   ├── cache/                   # Caching utilities
│   ├── utils/                   # General utilities
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── validation.ts
│   └── hooks/                   # Custom React hooks
├── types/                       # TypeScript type definitions
│   ├── auth.ts
│   ├── parks.ts
│   ├── itinerary.ts
│   ├── weather.ts
│   └── accessibility.ts
├── public/                      # Static assets
│   ├── icons/
│   ├── images/
│   ├── maps/
│   └── models/                  # ML models
├── docs/                        # Documentation
├── tests/                       # Test files
│   ├── __tests__/              # Unit tests
│   ├── e2e/                    # End-to-end tests
│   └── setup/                  # Test configuration
├── scripts/                     # Build and deployment scripts
├── .github/                     # GitHub workflows
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── vercel.json
└── README.md
```

## 🧪 Development Scripts

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:debug        # Start with debugging enabled
npm run dev:turbo        # Start with Turbopack (experimental)

# Building
npm run build            # Build for production
npm run build:analyze    # Build with bundle analyzer
npm run start            # Start production server

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run end-to-end tests
npm run test:e2e:ui      # Run E2E tests with UI

# Linting and Formatting
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
npm run type-check       # Run TypeScript type checking

# Database
npm run db:migrate       # Run database migrations
npm run db:migrate:down  # Rollback migrations
npm run db:seed          # Seed development data
npm run db:reset         # Reset database
npm run db:studio        # Open database studio

# Machine Learning
npm run ml:train         # Train ML models
npm run ml:evaluate      # Evaluate model performance
npm run ml:deploy        # Deploy models to edge

# Utilities
npm run check-deps       # Check for dependency updates
npm run clean            # Clean build artifacts
npm run generate:types   # Generate TypeScript types
```

## 🔧 Development Workflow

### 1. Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes
# ... develop your feature

# 3. Run tests
npm run test
npm run lint
npm run type-check

# 4. Commit changes
git add .
git commit -m "feat: add new feature"

# 5. Push and create PR
git push origin feature/new-feature
```

### 2. Code Quality Checks

```bash
# Pre-commit checks (automated via husky)
npm run lint:fix         # Fix linting errors
npm run format           # Format code
npm run type-check       # Check types
npm run test             # Run tests
```

### 3. Testing Strategy

```bash
# Unit Tests
npm run test components/ui/button.test.tsx

# Integration Tests
npm run test lib/ml/predictor.test.ts

# E2E Tests
npm run test:e2e tests/e2e/auth.spec.ts

# Performance Tests
npm run test:perf
```

## 📊 Debugging and Monitoring

### Development Tools

#### 1. Browser DevTools
- **React DevTools**: Component inspection
- **Performance Tab**: Runtime performance
- **Network Tab**: API request monitoring
- **Console**: Error logging and debugging

#### 2. VS Code Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Next.js: debug client-side",
      "type": "pwa-chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

#### 3. Database Debugging

```bash
# View database logs
npm run db:logs

# Query database directly
npm run db:console

# Monitor database performance
npm run db:monitor
```

#### 4. API Debugging

```bash
# Monitor API requests
npm run api:monitor

# Test API endpoints
npm run api:test

# View API logs
npm run api:logs
```

## 🔐 Security Best Practices

### 1. Environment Security
- Never commit `.env` files
- Use strong, unique API keys
- Rotate secrets regularly
- Use environment-specific configurations

### 2. Code Security
```bash
# Security audit
npm audit

# Dependency vulnerability check
npm run security:check

# OWASP security scan
npm run security:scan
```

### 3. Data Protection
- Encrypt sensitive data
- Implement proper authentication
- Use HTTPS in production
- Follow GDPR/CCPA guidelines

## 📱 Mobile Development

### Progressive Web App Setup

```bash
# Install PWA dependencies
npm install next-pwa workbox-webpack-plugin

# Generate PWA assets
npm run pwa:generate

# Test PWA functionality
npm run pwa:test
```

### Mobile Testing

```bash
# iOS Simulator
npm run test:ios

# Android Emulator
npm run test:android

# Mobile browser testing
npm run test:mobile
```

## 🚀 Deployment

### Local Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm run start

# Analyze bundle size
npm run build:analyze
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## 🆘 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Use different port
npm run dev -- --port 3001
```

#### 2. Dependency Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. Database Connection Issues
```bash
# Check database status
npm run db:status

# Reset database connection
npm run db:reconnect
```

#### 4. Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear all caches
npm run clean
```

### Getting Help

- **Documentation**: Check `/docs` folder
- **GitHub Issues**: Create an issue for bugs
- **Discussions**: Use GitHub Discussions for questions
- **Team Chat**: Use team communication channels

### Development Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Testing Library](https://testing-library.com/docs/)

## 🎯 Next Steps

After setup is complete:

1. **Explore the codebase**: Familiarize yourself with the project structure
2. **Run the test suite**: Ensure everything works correctly
3. **Make a small change**: Test your development workflow
4. **Read the documentation**: Review feature specifications
5. **Join the team**: Participate in team meetings and discussions

Welcome to the team! 🎉