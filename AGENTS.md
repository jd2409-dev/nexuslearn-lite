# Repository Guidelines

## Project Structure & Module Organization

- src/app: Next.js App Router entry, global layout (src/app/layout.tsx), styles (src/app/globals.css), and route groups under src/app/(app)/ such as aichat, dashboard, quiz, journal, pomodoro, reflection, study-planner, essay-grader. Each route folder typically contains page.tsx and is wrapped by src/app/(app)/layout.tsx.
- src/components: Reusable UI and layout components. Notable: src/components/ui/* (Radix/Shadcn-based primitives like button.tsx, toast.tsx, sidebar.tsx) and src/components/layout/* (app-sidebar.tsx, header.tsx).
- src/firebase: Client-side Firebase initialization and React context/provider (index.ts, provider.tsx). Firestore-related hooks under src/firebase/firestore (use-collection, use-doc) and utilities (error-emitter.ts, errors.ts, non-blocking-login.tsx, non-blocking-updates.tsx).
- src/ai: AI-specific directories (flows, schemas) for future/related logic.
- src/hooks: Custom hooks (use-mobile.tsx, use-toast.ts).
- src/lib: Utilities and static data (utils.ts, placeholder-images.*).
- public: Static assets served by Next.js.
- Configuration: next.config.ts, tsconfig.json, postcss.config.mjs, tailwind.config.ts. Root .env for environment variables, firebase.json and firestore.rules for Firebase.

## Build, Test, and Development Commands

```bash
# Install dependencies
npm install

# Start development server (Turbopack, binds 0.0.0.0)
npm run dev

# Build production bundle
npm run build

# Start in production
npm run start

# Lint (Next.js lint)
npm run lint

# Type-check
npm run typecheck
```

## Coding Style & Naming Conventions

- Indentation: 2 spaces (TypeScript/TSX typical; follow existing files).
- File naming: kebab-case for files (e.g., app-sidebar.tsx), PascalCase for React components within files. App Router routes use folder names like aichat/page.tsx.
- Function/variable naming: camelCase for variables and functions; PascalCase for components and types.
- Linting/formatting: next lint is configured; no explicit Prettier config found. TypeScript strict mode enabled in tsconfig.json. next.config.ts ignores lint/type errors during build to avoid blocking CI builds.

## Testing Guidelines

- No explicit test framework or test scripts are defined in package.json. package-lock.json references @playwright/test, but there are no tests or scripts present in the repo. If adding tests, prefer colocating under src with .test.ts(x) naming and add an npm script (e.g., "test").

## Commit & Pull Request Guidelines

- Commit history shows inconsistent messages. Prefer Conventional Commits for clarity.
  - Examples to follow: feat(aichat): add streaming chat UI; fix(firebase): handle missing env safely
- PRs: include summary, screenshots for UI changes, and testing steps. Ensure typecheck and lint pass.
- Branch naming: use feature/<brief>, fix/<brief>, chore/<brief>.

---

# Repository Tour

## 🎯 What This Repository Does

NexusLearn Lite (Firebase Studio) is a Next.js 15 App Router application that provides an AI-assisted learning interface integrated with Firebase Auth and Firestore.

Key responsibilities:
- Render feature pages like AI Tutor chat, quizzes, essay grading, study planning
- Initialize and provide Firebase services to the React tree
- Offer a component library (Radix/Shadcn-based) for consistent UI

---

## 🏗️ Architecture Overview

### System Context
```
Browser (User) → Next.js App (App Router) → Firebase (Auth, Firestore)
                              ↓
                        UI Components (Radix/Shadcn)
```

### Key Components
- App Router (src/app/*): Defines layouts and route pages; RootLayout wires Firebase provider and Toaster.
- Firebase Provider (src/firebase/provider.tsx, src/firebase/index.ts): Initializes app, exposes auth, firestore, and user state via React context.
- UI Library (src/components/ui/*, src/components/layout/*): Reusable primitives (toast, sidebar, dialog, forms) and layout shell (header, app-sidebar).
- Feature Routes (src/app/(app)/*): Concrete pages such as aichat, dashboard, quiz, etc.

### Data Flow
1. Root layout loads globals.css and wraps children with FirebaseClientProvider and Toaster.
2. Firebase initialization reads NEXT_PUBLIC_* env vars and creates app/auth/firestore instances when on the client.
3. FirebaseProvider subscribes to onAuthStateChanged and exposes user/loading/error via context hooks.
4. Pages and components consume hooks (useFirebase/useAuth/useFirestore) to access services and render UI; user feedback uses toast.

---

## 📁 Project Structure [Partial Directory Tree]

```
./
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── (app)/
│   │       ├── layout.tsx
│   │       ├── aichat/page.tsx
│   │       ├── dashboard/page.tsx
│   │       ├── essay-grader/page.tsx
│   │       ├── journal/page.tsx
│   │       ├── pomodoro/page.tsx
│   │       ├── quiz/page.tsx
│   │       ├── reflection/page.tsx
│   │       └── study-planner/page.tsx
│   ├── components/
│   │   ├── layout/{app-sidebar.tsx,header.tsx}
│   │   └── ui/{button.tsx,toast.tsx,sidebar.tsx,...}
│   ├── firebase/
│   │   ├── index.ts
│   │   ├── provider.tsx
│   │   ├── error-emitter.ts, errors.ts
│   │   ├── non-blocking-*.tsx
│   │   └── firestore/
│   ├── ai/{flows/,schemas/}
│   ├── hooks/{use-mobile.tsx,use-toast.ts}
│   └── lib/{utils.ts,placeholder-images.*}
├── public/
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── firebase.json
├── firestore.rules
└── package.json
```

### Key Files to Know

- src/app/layout.tsx: Root layout; sets metadata, fonts, FirebaseClientProvider, and Toaster.
- src/app/(app)/layout.tsx: Authenticated app shell with AppSidebar and Header.
- src/firebase/index.ts: initializeFirebase() reading NEXT_PUBLIC_* env; re-exports providers and hooks.
- src/firebase/provider.tsx: FirebaseContext and hooks (useFirebase/useAuth/useFirestore/useUser).
- src/components/layout/app-sidebar.tsx: Left nav items mapping to core routes.
- src/components/ui/toast.tsx: Toast primitives used across app.
- next.config.ts: Build behavior; ignore TypeScript and ESLint errors during builds.
- tsconfig.json: TS compiler options with path alias @/*.
- tailwind.config.ts: Tailwind theme tokens, fonts, and plugins.
- firebase.json, firestore.rules: Firebase hosting and security rules (refer to files for details).
- package.json: Scripts and dependencies.

---

## 🔧 Technology Stack

### Core Technologies
- Language: TypeScript (>=5) for type safety and modern tooling.
- Framework: Next.js 15 (App Router) for SSR/SSG/SPA hybrid routing and performance.
- UI: React 18 with Radix UI primitives and Shadcn-inspired components.
- Styling: Tailwind CSS 3.4 with custom theme tokens.
- Backend-as-a-Service: Firebase (App, Auth, Firestore) for authentication and data storage.

### Key Libraries
- @radix-ui/react-* and class-variance-authority: Accessible UI primitives and variant styling.
- react-hook-form and @hookform/resolvers: Form handling and validation.
- lucide-react: Icon set.
- date-fns, recharts, embla-carousel-react: Utilities for dates, charts, and carousels.

### Development Tools
- next lint: Linting via Next.js ESLint preset.
- TypeScript tsc --noEmit: Type checking.
- Tailwind/postcss: Styling pipeline.

---

## 🌐 External Dependencies

### Required Services
- Firebase: Requires environment variables for client config:
  - NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  - NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, NEXT_PUBLIC_FIREBASE_APP_ID
  Missing API key logs an error and short-circuits initialization on client.

---

## 🔄 Common Workflows

### Adding a new feature page
1. Create src/app/(app)/<feature>/page.tsx.
2. Add nav link in src/components/layout/app-sidebar.tsx if needed.
3. Use hooks from src/firebase/provider.tsx to access user/auth/firestore.
4. Build and test locally: npm run dev.

### Using Firebase in a component
1. Import hooks: import { useAuth, useFirestore } from '@/firebase'.
2. Access services and handle user state via useUser().
3. Emit UX feedback with toast from src/hooks/use-toast.ts and components/ui/toast.

---

## 📈 Performance & Scale

- Lint/type errors are ignored during build per next.config.ts to keep builds unblocked. Prefer fixing issues locally and enabling strict CI checks in PRs.
- Client-only Firebase init: initializeFirebase() returns nulls when window is undefined to prevent SSR errors.

---

## 🚨 Things to Be Careful About

### Security Considerations
- Do not hardcode Firebase credentials; use NEXT_PUBLIC_* env vars in .env for local dev.
- Guard against SSR usage of client-only Firebase APIs; rely on initializeFirebase checks.
- Review firestore.rules for data access; update rules when adding collections.


Updated at: 2025-10-31
