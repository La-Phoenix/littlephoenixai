# Little Phoenix - RAG Assistant UI

A beautiful, professional React + TypeScript application for the Little Phoenix RAG (Retrieval Augmented Generation) Assistant. Features theme toggle, responsive design, and seamless backend integration.

## 🚀 Features

- **Dark/Light Theme Toggle** - Beautiful theme switching with system preference detection
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **Chat Interface** - Real-time conversation with the AI assistant
- **Document Upload** - Drag-and-drop document upload support
- **Conversation History** - Track and manage past conversations
- **Professional UI** - Built with Tailwind CSS for modern aesthetics
- **Type-Safe** - Full TypeScript support throughout the application

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Theme Management**: Custom React Context

## 📋 Prerequisites

- Node.js 18+ or higher
- npm or yarn

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Endpoint

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Then update the API base URL in `.env`:

```
VITE_API_BASE_URL=http://your-backend-url:5000/api
```

### 3. Development

```bash
npm run dev
```

The app will open at http://localhost:5173

### 4. Production Build

```bash
npm run build
npm run preview
```

### 5. Linting

```bash
npm run lint
```

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── ChatInterface.tsx    # Main chat UI
│   ├── DocumentUpload.tsx   # File upload component
│   ├── Header.tsx          # Top navigation
│   ├── Sidebar.tsx         # Side navigation
│   └── ThemeToggle.tsx      # Theme switcher
├── context/            # React Context providers
│   └── ThemeContext.tsx    # Theme management
├── layouts/            # Page layout components
│   └── MainLayout.tsx      # Main layout wrapper
├── pages/              # Page components
│   └── ChatPage.tsx        # Chat interface page
├── services/           # API and external services
│   └── api.ts             # Backend API client
├── types/              # TypeScript type definitions
│   └── index.ts           # Shared types
├── App.tsx             # Root component
├── main.tsx            # Entry point
└── index.css           # Global Tailwind styles
```

## 🎨 Theme System

The application includes a sophisticated theme system:

- **Light Mode**: Clean white interface optimized for daytime use
- **Dark Mode**: Dark interface optimized for low-light environments
- **System Preference**: Automatically detects and respects user's OS theme preference
- **Manual Toggle**: Users can override system preference with the theme toggle button

## 🔌 API Integration

### Backend Endpoints Expected

The frontend expects the following endpoints from your .NET backend:

1. **POST /ask**
   ```json
   {
     "question": "string",
     "conversationHistory": ["string"]
   }
   ```
   Response:
   ```json
   {
     "answer": "string",
     "sources": ["string"],
     "confidence": number
   }
   ```

2. **POST /add-document**
   ```json
   {
     "text": "string",
     "metadata": {}
   }
   ```
   Response:
   ```json
   {
     "success": boolean,
     "message": "string",
     "documentId": "string"
   }
   ```

3. **POST /search** (Internal)
   ```json
   {
     "query": "string",
     "limit": number
   }
   ```

4. **GET /health**
   - Health check endpoint

## 🎯 Component Architecture

### ThemeProvider

Wraps the entire application to provide theme context to all components.

```typescript
import { ThemeProvider } from './context/ThemeContext';

<ThemeProvider>
  <App />
</ThemeProvider>
```

### useTheme Hook

Access theme in any component:

```typescript
import { useTheme } from './context/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return <button onClick={toggleTheme}>Toggle Theme</button>;
}
```

### API Service

Singleton service for all backend calls:

```typescript
import { api } from './services/api';

// Ask a question
const response = await api.ask('What is RAG?');

// Upload document
const result = await api.addDocument(documentText);

// Set auth token
api.setAuthToken(token);
```

## 📱 Responsive Design

The application is fully responsive:

- **Mobile (< 768px)**: Full-width layout with collapsible sidebar
- **Tablet (768px - 1024px)**: Side-by-side chat and upload
- **Desktop (> 1024px)**: Optimal three-column layout

## 🌈 Styling with Tailwind CSS

All styling uses Tailwind CSS with custom configuration:

- Custom color palette (Primary Purple, Secondary Green)
- Custom shadows and depth effects
- Smooth animations and transitions
- Dark mode support
- Responsive breakpoints
- Component utilities (`.btn`, `.card`, `.input-field`, `.glass`)

### Custom Component Classes

```css
.btn-primary        /* Primary button */
.btn-secondary      /* Secondary button */
.btn-outline        /* Outline button */
.card               /* Card component */
.input-field        /* Input field */
.glass              /* Glass morphism effect */
.container-custom   /* Responsive container */
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

Available variables:
- `VITE_API_BASE_URL` - Backend API base URL
- All variables must start with `VITE_` to be exposed to the frontend

## 📦 Dependencies

### Production

- `react` - UI framework
- `react-dom` - React DOM rendering
- `tailwindcss` - Utility-first CSS
- `next-themes` - Theme management (can be integrated)
- `axios` - HTTP client
- `lucide-react` - Icon library
- `clsx` - Utility for conditional classnames
- `tailwind-merge` - Tailwind class merging

### Development

- `typescript` - Type checking
- `vite` - Build tool
- `eslint` - Code linting
- `@vitejs/plugin-react` - React plugin for Vite

## 🚀 Performance Optimizations

- Lazy-loaded components with React Suspense
- Code splitting with Vite
- Optimized images and assets
- CSS minification
- Tree shaking of unused code
- Tailwind CSS purging of unused styles

## 🔒 Security Best Practices

1. **Environment Variables**: Sensitive data is kept in environment variables
2. **Input Validation**: User input is validated before sending to API
3. **CORS**: Backend should configure CORS for the frontend domain
4. **Authentication**: Support for token-based authentication
5. **Error Handling**: Graceful error handling and user-friendly messages

## 📊 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🐛 Troubleshooting

### Port Already in Use

If port 5173 is already in use:

```bash
npm run dev -- --port 3000
```

### API Connection Issues

Ensure:
1. Backend server is running on the correct URL
2. `VITE_API_BASE_URL` in `.env` matches your backend
3. CORS is enabled on the backend

### Theme Not Persisting

Clear browser cache and localStorage, then reload the page.

## 🚀 Future Enhancements

- [ ] User authentication and profiles
- [ ] Conversation persistence to database
- [ ] Advanced search and filtering
- [ ] Markdown rendering in chat
- [ ] Code syntax highlighting
- [ ] Export conversations to PDF
- [ ] Real-time typing indicators
- [ ] Message reactions and emoji support
- [ ] File upload with progress tracking
- [ ] Voice input/output support

## 📝 Code Style

This project follows these conventions:

- ESLint rules defined in `eslint.config.js`
- TypeScript strict mode enabled
- Prettier formatting (optional, can be added)
- Tailwind CSS for all styling
- React functional components with hooks

## 🤝 Contributing

When contributing:

1. Ensure TypeScript types are complete
2. Follow ESLint rules
3. Use Tailwind CSS for styling
4. Test responsive design
5. Update this README if adding new features

## 📞 Support

For issues, questions, or contributions, please reference the Little Phoenix documentation or create an issue in the repository.

---

Built with ❤️ for the Little Phoenix RAG Assistant

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
