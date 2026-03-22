# Little Phoenix Frontend - Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Endpoint
The `.env` file is already set up with a default API URL. To change it:

```bash
# Edit .env file
VITE_API_BASE_URL=http://your-backend-url:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
npm run preview
```

## 📁 Project Structure

- **src/components/** - Reusable UI components (Header, Sidebar, ChatInterface, etc.)
- **src/pages/** - Page components (ChatPage)
- **src/layouts/** - Layout wrappers (MainLayout)
- **src/services/** - API client (api.ts)
- **src/context/** - React Context (ThemeContext)
- **src/types/** - TypeScript type definitions
- **tailwind.config.js** - Tailwind CSS configuration
- **postcss.config.js** - PostCSS configuration
- **.env** - Environment variables

## ✨ Features

✅ **Dark/Light Theme Toggle** - Click the theme button in the header
✅ **Responsive Design** - Works on mobile, tablet, and desktop
✅ **Chat Interface** - Ask questions and get AI responses
✅ **Document Upload** - Drag-and-drop to upload documents
✅ **Professional UI** - Built with Tailwind CSS
✅ **Type-Safe** - Full TypeScript support
✅ **Error Handling** - User-friendly error messages

## 🎨 Customization

### Change Colors
Update color references in components or modify `tailwind.config.js`

### Add New Components
1. Create file in `src/components/`
2. Export component
3. Import and use in pages

### Modify Styles
Use Tailwind CSS classes directly in JSX:
- Dark mode: `dark:bg-gray-900`
- Responsive: `md:text-lg lg:text-xl`

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📊 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Modern mobile browsers

## 🐛 Troubleshooting

### Port already in use?
```bash
npm run dev -- --port 3000
```

### API not connecting?
- Check `VITE_API_BASE_URL` in `.env`
- Verify backend is running
- Check CORS settings on backend

### Theme not saving?
- Clear browser cache
- Check localStorage in DevTools

## 📝 Component Overview

### Header
Displays logo, navigation links, and theme toggle button

### Sidebar
Mobile-responsive sidebar with conversation history

### ChatInterface
Main chat window with message display and input

### DocumentUpload
Drag-and-drop document upload component

### ThemeToggle
Dark/light mode switcher

## 🔐 Security Notes

- API endpoint is configurable via environment variables
- Tokens are stored in localStorage
- CORS configured by backend
- Input validation on frontend

## 📞 Need Help?

- Check `.github/copilot-instructions.md` for detailed documentation
- Review component code for examples
- Check console for error messages

## 🎉 Ready to Build!

You now have a professional, production-ready React UI for the Little Phoenix RAG Assistant. Start the dev server and begin building amazing features!

```bash
npm run dev
```

Happy coding! 🚀
