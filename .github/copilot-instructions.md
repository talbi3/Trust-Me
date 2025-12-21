# Copilot Instructions for QueenB X AppsFlyer BeSafe Hackathon

## Architecture Overview

This is a full-stack MERN application with separate **client** (React + Vite) and **server** (Express.js) packages. The application manages a rubber duck library as a template for junior developer learning.

### Key Components
- **Client** (`/client`): React 19.2, Vite bundler, React Router 7, Axios for API calls
- **Server** (`/server`): Express 5.1, Node.js 20+ with ES modules, runs on port 5000
- **Communication**: REST API via Axios instance with centralized base URL from environment variables

## Data Flow Pattern

1. **Client Request**: Components use `DuckContext` (global state) to fetch data via Axios
2. **API Layer**: `client/services/api.js` maintains a single Axios instance with `VITE_SERVER_API_URL`
3. **Server Routes**: `server/routes/rubberDucks.js` maps endpoints to controllers
4. **Controllers**: `server/controllers/rubberDuckController.js` handles business logic and returns JSON

**Example**: `RandomDuck.jsx` → `getRandomDuck()` via Context → Axios GET `/ducks/random` → controller

## Critical File Locations

- **API Service**: `client/src/services/api.js` (Axios instance with base URL)
- **Global State**: `client/src/context/DuckContext.jsx` (React Context provider)
- **Routes**: `server/routes/rubberDucks.js` (all /ducks endpoints)
- **Controllers**: `server/controllers/rubberDuckController.js` (business logic)
- **Static Images**: `server/images/` (served via `/images` middleware)

## Development Workflow

### Starting Development
1. **Terminal 1 (Server)**: `cd server && npm run dev` (uses nodemon, watches changes)
2. **Terminal 2 (Client)**: `cd client && npm run dev` (Vite dev server, auto-opens browser on port 3000)

### Linting & Building
- Both packages run ESLint before dev/build: `npm run dev` and `npm run build` include `eslint .`
- Linting is **required** to start the dev server or build
- Fix linting errors with existing ESLint config before committing

### Environment Variables
- **Server**: `.env` with `CLIENT_URL` (CORS origin) and `PORT` (default 5000)
- **Client**: `.env` with `VITE_SERVER_API_URL` (must match server URL)
- Both `.env.example` files show defaults; create `.env` from examples

## Code Organization Patterns

### Component Structure (Client)
Components use **CSS Modules** for scoped styling:
```
components/
├── RandomDuck/
│   ├── RandomDuck.jsx
│   └── RandomDuck.module.css
└── common/
    └── FirstButton/
        ├── FirstButton.jsx
        └── FirstButton.module.css
```

Import pattern: `import styles from './RandomDuck.module.css'` then use `className={styles.containerName}`

### Context Usage (State Management)
`DuckContext.jsx` provides `{ duck, getRandomDuck }`. Components access it via:
```jsx
const { duck, getRandomDuck } = useContext(DuckContext);
```
Initial state fetched in `useEffect` via `queueMicrotask` to avoid strict mode double-calls.

### API Integration Pattern
Always use the centralized `axiosInstance` from `client/services/api.js`:
```jsx
import api from '../../services/api';
const response = await api.get('/ducks/random');
```

### Controller Pattern (Server)
Controllers in `rubberDuckController.js` handle all business logic and JSON responses:
- Extract params/body with destructuring
- Validate data
- Return appropriate HTTP status codes (200, 201, 404, etc.)
- Respond with `res.status(code).json(data)`

## Best Practices to Follow

1. **API Endpoints**: RESTful conventions (GET, POST, PATCH, DELETE) with clear route structure
2. **Error Handling**: Controllers check for missing resources and return 404; clients log errors via `console.error`
3. **Component Props**: Use PropTypes validation (see `DuckProvider` in context file)
4. **Image URLs**: Construct full URLs by combining `VITE_SERVER_API_URL` with duck's `imageUrl` field
5. **Modular Components**: Each component has single responsibility (pages for routes, components for reusable UI)

## Common Tasks

### Adding a New Endpoint
1. Create controller function in `server/controllers/rubberDuckController.js`
2. Add route in `server/routes/rubberDucks.js` (comment with Read-only or Read/Write permission)
3. Call from client via `api.get/post/patch/delete('/ducks/endpoint')`

### Adding a New Page
1. Create page component in `client/src/pages/YourPage/YourPage.jsx` with `.module.css`
2. Add route to `client/src/App.jsx` inside `<Routes>`
3. Link from navigation if needed

### Updating Global State
1. Add state variable and setter in `DuckProvider`
2. Add methods to the Context value object
3. Access in components via `useContext(DuckContext)`

## Environment & Debugging

- **Node version**: Requires 20.x or higher (check `npm run dev` output for version)
- **Port conflicts**: Server runs on 5000, client on 3000 (configurable in `.env` and `vite.config.js`)
- **CORS**: Server CORS configured to allow `CLIENT_URL` from environment
- **Static assets**: Public assets in `client/public/`, images in `server/images/`
- **Browser DevTools**: Check Network tab for API requests and Console for React errors (React DevTools extension recommended)

## Key Takeaways for AI Agents

- The app demonstrates a **full-stack workflow**: route → controller → response → Axios → Context → component → UI
- **Environment variables** are critical—never hardcode API URLs
- **Linting is blocking**: ESLint must pass before dev/build
- **CSS Modules** prevent style conflicts; always use scoped class names
- **Controllers are thick**: business logic lives on the server, not in React components
