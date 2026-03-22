# Little Phoenix RAG Assistant - Frontend

A professional, production-ready React + TypeScript frontend for the Little Phoenix RAG (Retrieval-Augmented Generation) Assistant. Beautiful, responsive UI with dark mode support, document management, and real-time chat capabilities.

## 🎯 Features

- **Professional UI/UX** - Beautiful gradient designs, glass-morphism effects, smooth animations
- **Dark/Light Mode** - System preference detection with persistent theme storage
- **Real-time Chat** - Connect to RAG backend for intelligent question answering
- **Document Management** - Upload and manage documents via file drag-drop or text input
- **Smart Search** - Query uploaded documents and retrieve relevant results
- **Toast Notifications** - Toast feedback system with auto-dismiss
- **Fully Responsive** - Mobile-first design with optimized layouts for all devices
- **TypeScript** - 100% type-safe codebase with strict type checking
- **Production Ready** - Optimized builds with code splitting for better performance

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Backend API running at `https://localhost:7268` (for development)

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Starts the Vite dev server at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Generates optimized build in `dist/` directory with code splitting:
- `vendor-react.js` - React library bundle
- `vendor-axios.js` - HTTP client bundle  
- `vendor-other.js` - Other dependencies
- Component bundles for better caching
- `index.css` - Compiled Tailwind CSS

### Linting

```bash
npm run lint
```

## 🏗️ Architecture

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | 19 |
| Language | TypeScript | 5.x |
| Build Tool | Vite | 8.x |
| Styling | Tailwind CSS | 4 |
| Icons | Lucide React | Latest |
| HTTP Client | Axios | Latest |

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ChatInterface.tsx
│   ├── DocumentUpload.tsx
│   ├── Search.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Toast.tsx
│   └── ThemeToggle.tsx
├── context/            # React Context providers
│   ├── ThemeContext.tsx
│   └── ToastContext.tsx
├── layouts/
│   └── MainLayout.tsx
├── pages/
│   ├── ChatPage.tsx
│   └── App.tsx
├── services/
│   └── api.ts         # Axios API client
├── types/
│   └── index.ts       # TypeScript type definitions
├── index.css          # Global Tailwind styles
└── main.tsx           # React entry point
```

## 🔌 API Integration

### Backend Endpoints

The frontend connects to a .NET backend with the following API structure:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/chat` | Submit questions to RAG system |
| POST | `/api/vendor/add` | Upload documents (text or file) |
| GET | `/api/search` | Search uploaded documents |

### Base URL Configuration

Set the backend API base URL in `.env`:

```env
VITE_API_BASE_URL=https://localhost:7268
```

For Vercel deployment, this is configured via environment variables in the Vercel project settings.

### Response Format

All API responses follow this structure:

```typescript
{
  isSuccess: boolean
  message: string
  data?: T
}
```

## 🎨 Theme System

- **Light Mode**: Clean white interface optimized for daytime use
- **Dark Mode**: Dark interface optimized for low-light environments
- **System Preference**: Automatically detects and respects user's OS theme preference
- **Manual Toggle**: Users can override system preference with the theme toggle button
- **Persistence**: Theme choice is saved in localStorage

### Using Theme in Components

```typescript
import { useTheme } from './context/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

## 📱 Responsive Design

The application is fully responsive:

- **Mobile (< 768px)**: Full-width chat with upload/search at top (scrollable)
- **Tablet (768px - 1024px)**: Side-by-side layout
- **Desktop (> 1024px)**: Optimized three-column layout with proper spacing

## 🌈 Styling with Tailwind CSS

All styling uses Tailwind CSS with dark mode support:

- Custom color palette integrated with theme system
- Smooth animations and transitions
- Dark mode support via class strategy
- Responsive breakpoints (mobile, tablet, desktop)
- Glass-morphism and gradient effects

## 🚀 Deployment to Vercel

### Prerequisites

1. Vercel account (free tier available)
2. GitHub repository with this code
3. Backend API with HTTPS endpoint

### Step-by-Step Deployment

#### 1. Connect GitHub Repository

Push code to GitHub:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### 2. Import Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repository
4. Click "Import"

#### 3. Configure Environment Variables

In Vercel project settings, add:

```
VITE_API_BASE_URL = https://your-production-api.com
```

Replace `https://your-production-api.com` with your actual backend URL.

#### 4. Configure Deployment Settings

Vercel automatically detects Vite configuration. Verify:

- **Build Command**: `npm run build` ✓ (pre-configured in `vercel.json`)
- **Output Directory**: `dist` ✓ (pre-configured in `vercel.json`)
- **Install Command**: `npm install` ✓ (default)

#### 5. Deploy

1. Click "Deploy"
2. Wait for build to complete (~1-2 minutes)
3. Your app will be live at `https://your-project.vercel.app`

### Production Checklist

- [ ] Backend API URL configured in Vercel environment variables
- [ ] Backend supports HTTPS (required by browsers)
- [ ] Backend CORS settings allow requests from your Vercel domain
- [ ] All API endpoints tested in production environment
- [ ] Theme persistence verified across different browsers
- [ ] Mobile layout tested on target devices
- [ ] Search functionality returns expected results
- [ ] Document upload works in production

### SPA Routing Configuration

The `vercel.json` file handles SPA routing configuration:

```json
{
  "routes": [
    {
      "src": "/assets/.*",
      "headers": { "cache-control": "public, max-age=31536000, immutable" }
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

This prevents 404 errors when users directly navigate to routes like `/search` or `/chat`.

### Automatic Deploys

Once connected, Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Previews**: Every push to other branches
- **Rollback**: Can revert to previous deployments instantly

### Monitoring & Debugging

1. View build logs in Vercel dashboard
2. Check preview deployments for testing
3. Monitor performance with Vercel Analytics
4. View error logs in browser DevTools

## 🔐 Environment Variables

### Development (.env)
```
VITE_API_BASE_URL=https://localhost:7268
```

### Production (Vercel)
```
VITE_API_BASE_URL=https://your-production-api.com
```

**Important**: Environment variables must start with `VITE_` to be exposed to the frontend.

## 📦 Build Optimization

### Code Splitting

The build creates separate bundles for:
- **vendor-react.js** (~60 KB gzipped) - React and DOM
- **vendor-axios.js** (~14 KB gzipped) - HTTP client
- **vendor-other.js** - Other dependencies
- **Main bundle** - Application code
- **Styles** - Tailwind CSS (~7 KB gzipped)

### Caching Strategy

- Assets are cached for 1 year with immutable headers
- CSS files are split per route for optimal caching
- Source maps are excluded from production builds

### Total Bundle Size
**~86 KB gzipped** - Excellent performance

## 🧪 Quality Assurance

### Type Checking
```bash
npm run build  # Includes TypeScript verification
```

### Linting
```bash
npm run lint
```

### Best Practices
- TypeScript strict mode enabled
- ESLint rules configured
- React 19 with latest features
- Proper error boundaries
- Graceful error handling

## 🐛 Troubleshooting

### Port Already in Use
```bash
npm run dev -- --port 3000
```

### Clear Build Cache
```bash
rm -rf node_modules dist .next
npm install
npm run build
```

### API Connection Fails
- Verify `VITE_API_BASE_URL` in `.env`
- Check backend is running on correct port
- Look for CORS errors in browser console
- Verify backend returns valid JSON

### Theme Not Persisting
- Check localStorage is enabled
- Clear browser cache and localStorage
- Verify ThemeContext is wrapping app

### Build Size Too Large
- Check for unused dependencies in `package.json`
- Verify code splitting is working
- Review `dist/` file structure

## 📚 Documentation

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Documentation](https://vite.dev)
- [Axios Documentation](https://axios-http.com)
- [Vercel Documentation](https://vercel.com/docs)
- [Lucide Icons](https://lucide.dev)

## 🚀 Performance Tips

1. **Network**: Content is delivered via Vercel's global CDN
2. **Caching**: Static assets cached aggressively
3. **Compression**: Automatic gzip compression
4. **Optimization**: Production builds minified and optimized
5. **Monitoring**: Use Vercel Analytics to track performance

## 🔒 Security

- Environment variables in `.env` (never committed)
- API calls over HTTPS
- Input sanitization for file uploads
- No sensitive data in localStorage
- CORS configured on backend
- Content Security Policy ready

## 📝 Contributing

When contributing:

1. Ensure TypeScript types are complete
2. Follow ESLint rules (`npm run lint`)
3. Use Tailwind CSS for all styling
4. Test responsive design on mobile
5. Update this README for new features

---

Built with ❤️ for the Little Phoenix RAG Assistant

**Version**: 1.0.0  
**License**: Proprietary
