# Project Structure

## Root Directory

```
├── src/                    # Source code
├── .svelte-kit/           # SvelteKit generated files (auto-generated)
├── node_modules/          # Dependencies (auto-generated)
├── casino.db*             # SQLite database files
├── package.json           # Project dependencies and scripts
├── vite.config.js         # Vite configuration
├── svelte.config.js       # SvelteKit configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── postcss.config.js      # PostCSS configuration
```

## Source Structure (`src/`)

```
src/
├── lib/                   # Shared library code
│   ├── components/        # Reusable Svelte components
│   │   ├── Navigation.svelte    # Main navigation bar
│   │   ├── Footer.svelte        # Site footer
│   │   └── GameCard.svelte      # Game information cards
│   ├── data/             # Static data and constants
│   │   └── games.js      # Game information data
│   ├── server/           # Server-side utilities
│   └── stores/           # Svelte stores for state management
├── routes/               # SvelteKit file-based routing
│   ├── +layout.svelte    # Root layout component
│   ├── +page.svelte      # Homepage
│   ├── api/              # API endpoints
│   │   └── auth/         # Authentication API routes
│   ├── blackjack/        # Blackjack game page
│   ├── baccarat/         # Baccarat game page
│   ├── roulette/         # Roulette game page
│   ├── login/            # Login page
│   └── signup/           # Registration page
├── app.html              # HTML template
└── app.css               # Global styles
```

## Naming Conventions

- **Components**: PascalCase (e.g., `GameCard.svelte`)
- **Routes**: lowercase with hyphens (e.g., `/blackjack`)
- **Files**: camelCase for JS/TS, kebab-case for assets
- **CSS Classes**: Tailwind utility classes + custom casino theme

## Architecture Patterns

- **File-based routing**: SvelteKit's convention for pages and API routes
- **Component composition**: Reusable components in `src/lib/components/`
- **Server-side rendering**: SSR enabled by default
- **API routes**: RESTful endpoints in `src/routes/api/`
- **Database layer**: SQLite with better-sqlite3 for persistence

## Key Directories

- `src/lib/`: Shared code that can be imported with `$lib/` alias
- `src/routes/`: Pages and API endpoints following SvelteKit conventions
- `src/routes/api/`: Server-side API endpoints
- `.svelte-kit/`: Generated files (never edit manually)

## Import Conventions

- Use `$lib/` alias for library imports: `import Component from '$lib/components/Component.svelte'`
- Relative imports for route-specific code
- External dependencies imported by package name
