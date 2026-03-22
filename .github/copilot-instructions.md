# Little Phoenix RAG Assistant - Frontend
## Project Information

This is a professional React + TypeScript frontend application for the Little Phoenix RAG Assistant. The application provides a beautiful, responsive UI for interacting with RAG endpoints, uploading documents, and managing conversations.

## Architecture & Tech Stack

- **React 19** with TypeScript for type-safe components
- **Vite** as the build tool for fast HMR and optimized builds
- **Tailwind CSS 4** for utility-first styling with dark mode support
- **Axios** for API communication with the backend
- **Lucide React** for beautiful, consistent icons
- **Custom Theme System** using React Context for dark/light mode

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React Context providers (Theme)
├── layouts/        # Page layout wrappers
├── pages/          # Page components
├── services/       # API client and external services
├── types/          # TypeScript type definitions
├── utils/          # Utility functions (if needed)
└── index.css       # Global Tailwind styles
```

## Key Features Implemented

1. **Theme Toggle** - Dark/light mode with system preference detection
2. **Responsive Design** - Mobile-first approach with breakpoints for all devices
3. **Chat Interface** - Real-time messaging with the RAG assistant
4. **Document Upload** - Drag-and-drop file upload functionality
5. **Professional UI** - Gradient backgrounds, smooth animations, glass-morphism effects
6. **API Integration** - Fully typed API client for backend communication
7. **Error Handling** - Comprehensive error messages and user feedback

## Configuration Files

- **tailwind.config.js** - Tailwind CSS configuration with custom theme
- **postcss.config.js** - PostCSS configuration for CSS processing
- **.env.example** - Environment variables template
- **vite.config.ts** - Vite bundler configuration
- **tsconfig.json** - TypeScript configuration
- **eslint.config.js** - ESLint linting rules

## Development Workflow

### Installation
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Linter
```bash
npm run lint
```

## API Integration Points

The frontend communicates with a .NET backend with these main endpoints:

1. **POST /api/ask** - Submit questions to the RAG system
2. **POST /api/add-document** - Upload documents for RAG knowledge base
3. **POST /api/search** - Internal search (used internally)
4. **GET /api/health** - Health check endpoint

Set the backend URL in `.env` file:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Component Overview

### Header
- Logo and branding
- Navigation links (Chat, Documents, History, Settings)
- Theme toggle button

### Sidebar
- Mobile-responsive with collapsible menu
- New conversation button
- Recent conversations list
- Navigation actions

### ChatInterface
- Message display with timestamps
- User and assistant message differentiation
- Input field with Shift+Enter for multiline
- Loading states and error messages
- Auto-scroll to latest message

### DocumentUpload
- Drag-and-drop support
- File type validation
- Upload progress indication
- Success/error feedback

### ThemeToggle
- Smooth rotation animation
- Icon changes based on current theme
- Accessibility support

## Styling Approach

All styling uses Tailwind CSS with these principles:

- **Dark Mode**: Fully supported with CSS `dark:` prefix
- **Responsive**: Mobile-first with `md:` and `lg:` breakpoints
- **Animations**: Smooth transitions and keyframe animations
- **Accessibility**: Proper contrast ratios and semantic HTML

### Custom Component Classes

```css
.btn-primary     - Primary action button
.btn-secondary   - Secondary action button
.btn-outline     - Outlined button
.card            - Card component container
.input-field     - Input/textarea styling
.glass           - Glass morphism effect
.container-custom - Responsive container
```

## Authentication & Security

- Environment variables are kept in `.env` (not committed)
- API tokens can be stored in localStorage (consider secure cookies for production)
- All API requests include proper error handling
- CORS configuration managed by backend

## Performance Considerations

- Lazy loading of DocumentUpload component with Suspense
- Optimized re-renders with React hooks
- Tailwind CSS purging unused styles in production
- Code splitting with Vite for smaller chunks
- Image optimization and caching

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- User authentication system
- Conversation persistence
- Advanced search filtering
- Markdown rendering
- Code syntax highlighting
- Voice input/output
- Real-time collaboration features

## Common Development Tasks

### Add New Component
1. Create file in `src/components/`
2. Export from component
3. Import and use in pages
4. Add types to `src/types/` if needed

### Add New Page
1. Create file in `src/pages/`
2. Import in `App.tsx` or use routes
3. Add navigation link in Header/Sidebar

### Modify Styles
1. Use Tailwind classes in JSX
2. Add custom CSS to `src/index.css` using `@layer`
3. Update `tailwind.config.js` for new colors/spacing

### Update API Integration
1. Modify types in `src/types/index.ts`
2. Update methods in `src/services/api.ts`
3. Use in components via `api` instance

## Troubleshooting

### Port already in use
```bash
npm run dev -- --port 3000
```

### Clear build cache
```bash
rm -rf node_modules dist
npm install
```

### API connection fails
- Check `VITE_API_BASE_URL` in `.env`
- Verify backend is running
- Check browser console for CORS errors

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Documentation](https://vite.dev)
- [Axios Documentation](https://axios-http.com)

## Team Notes

- This is a professional-grade UI ready for selling
- Fully typed TypeScript codebase
- Responsive and accessible design
- Dark mode support throughout
- Production-ready build configuration
