# Technology Stack

## Framework & Runtime

- **Frontend Framework**: SvelteKit 2.0
- **Runtime**: Node.js
- **Build Tool**: Vite 5.0
- **Package Manager**: npm

## Styling & UI

- **CSS Framework**: Tailwind CSS 3.3
- **PostCSS**: Autoprefixer for browser compatibility
- **Custom Design System**: Casino-themed colors and typography
- **Responsive Design**: Mobile-first approach

## Backend & Database

- **Database**: SQLite with better-sqlite3
- **Authentication**: bcrypt for password hashing
- **Session Management**: Cookie-based sessions with UUID
- **API**: SvelteKit server-side API routes

## Development Tools

- **Linting**: ESLint with Svelte plugin
- **Formatting**: Prettier with Svelte plugin
- **TypeScript**: Type definitions for dependencies

## Common Commands

### Development

```bash
npm install          # Install dependencies
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Code Quality

```bash
npm run lint         # Run ESLint and Prettier checks
npm run format       # Format code with Prettier
```

## Configuration Files

- `vite.config.js`: Vite configuration with SvelteKit plugin
- `svelte.config.js`: SvelteKit adapter configuration
- `tailwind.config.js`: Custom Tailwind theme with casino colors
- `postcss.config.js`: PostCSS with Tailwind and Autoprefixer

## Deployment Targets

- Vercel (recommended)
- Netlify
- AWS Amplify
- Static hosting with adapter-static
