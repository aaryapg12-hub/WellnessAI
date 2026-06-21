# WellAI — AI Personal Wellness Coach

WellAI is an AI-powered personal wellness and lifestyle coach. The application is designed to help users manage their health, habits, diet, fitness, mental well-being, and skin health. It is aligned with the **United Nations Sustainable Development Goal 3 (SDG 3): Good Health & Well-being**.

---

## 🛠️ Technology Stack

The project utilizes a modern, highly performant web stack:

### Frontend & Core Framework
* **React 19 & TypeScript**: Provides a robust, type-safe foundation for building component-based user interfaces.
* **TanStack Start (Vite + Nitro)**: A full-stack React framework featuring Server-Side Rendering (SSR) capabilities, fast builds, and client-side hydration.
* **TanStack Router**: A fully type-safe router for React that handles layout routing, search parameter validation, and route-based code splitting.
* **TanStack Query (React Query)**: Manages server state, caching, synchronization, and database mutations.

### Styling & Animation
* **Tailwind CSS v4**: Utility-first CSS framework providing modern, scalable, and responsive styling.
* **Radix UI Primitives**: Accessible, unstyled UI primitives (Accordion, Dialog, Dropdown, Tabs, Tooltip, etc.) that form the core design system.
* **Framer Motion**: Delivers smooth, hardware-accelerated animations, micro-interactions, and page transitions.
* **Lucide React**: Premium icon library.

### Backend & Database (BaaS)
* **Supabase**: Backend-as-a-Service providing:
  * **PostgreSQL Database** with Row Level Security (RLS) for user data safety.
  * **Supabase Auth** for email/password and Google OAuth logins.
  * **Supabase Storage** for uploading and hosting user profile avatars and skin selfies.

---

## 🚀 Key Features & Benefits

1. **AI Skin Analysis**: Allows users to upload a selfie to calculate a skin score, estimate skin age, identify issues, and receive a customized morning/night skincare routine.
2. **Smart Diet Planner**: Adapts breakfast, lunch, dinner, and snack routines according to goals, budget, and culinary preferences.
3. **Fitness Coach**: Offers adaptive daily home, gym, and cardio workouts.
4. **Mental Wellness**: Tracks daily mood, supports digital journaling, and offers breathing/mindfulness routines.
5. **Habit Tracker**: Promotes daily consistency through streaks, badging, and goal-tracking.
6. **Wellness Score**: Aggregates daily statistics (water, sleep, mood, steps) into a single overall health metric.

---

## ⚙️ How it Works & System Flow

### 1. Authentication Flow
* **Sign-Up/Log-In**: Users authenticate using their email/password or Google account.
* **Redirection Control**: On authentication, a global state listener (`onAuthStateChange` in `__root.tsx`) triggers a route invalidation. The auth route automatically redirects the user to the `/dashboard`.
* **Security Guard**: Authenticated routes inside `_authenticated/` contain a `beforeLoad` check that queries `supabase.auth.getUser()`. If a user is not logged in, they are redirected back to the public `/auth` route.

### 2. Database & Data Storage Flow
* **Database Triggers**: When a new user registers in Supabase Auth, a PostgreSQL trigger (`on_auth_user_created`) runs a function that automatically initializes their profile row in the `public.profiles` table.
* **Selfie Storage**: In the skin analysis page, when a user uploads a selfie, it is pushed to the private `skin-uploads` bucket in Supabase Storage. Row Level Security policies ensure that only the owner of the image can read, write, or delete it.

### 3. AI Services (Client-Side Simulation)
* The chat and skin analysis features are currently designed with client-side AI mock responses (`pickReply` and `mockAnalyze`). This allows the user interface to work seamlessly and simulate responses instantly, ready to be connected to a live edge function or third-party AI API (like Gemini or OpenAI) later.

---

## 🔒 Security: Environment Variables Excluded

The local configuration file `.env` (which contains your sensitive Supabase Project ID and Publishable Anon Key) has been **permanently untracked from Git** and appended to the **`.gitignore`** file. 

This guarantees:
* **No Key Leaks**: Your database credentials will never be exposed on your public GitHub repository (`https://github.com/aaryapg12-hub/WellnessAI.git`).
* **Clean Configuration**: Other developers who clone the repository will have to create their own `.env` file to connect to their own Supabase databases, which is standard software engineering practice.

---

## 📁 Repository Organization Audit

The repository is **properly organized and adheres to industry best practices**. Here is an analysis of the file structure:

```
├── .env                  # [EXCLUDED] Local environment variables
├── .gitignore            # Git exclusion rules
├── package.json          # Dependency definitions and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite, Tailwind, & TanStack Router setup
├── supabase/
│   ├── config.toml       # Supabase CLI project settings
│   └── migrations/       # SQL migrations to build the DB schema
└── src/
    ├── assets/           # Media files and images
    ├── components/       # UI Components
    │   ├── dashboard/    # Pages/layout components for authenticated users
    │   └── ui/           # Core Radix-based shadcn UI primitives (Buttons, Inputs, Dialogs)
    ├── hooks/            # Custom reusable hooks (e.g. useAuthUser, useProfile)
    ├── integrations/     # Configurations for Supabase & Lovable client instances
    ├── lib/              # Utility helpers
    ├── routes/           # TanStack Router folder-based routing structure
    │   ├── _authenticated/ # Enforced layout group requiring log-in
    │   ├── __root.tsx    # App root, providers, and global listeners
    │   ├── auth.tsx      # Sign-in/Sign-up/Forgot password pages
    │   └── index.tsx     # Landing page
    ├── start.ts          # TanStack Start entry point
    └── styles.css        # Tailwind config and global css rules
```

### Strengths of the Current Organization:
* **Separation of Concerns**: Reusable components (`components/ui`) are separated from layout/view components (`components/dashboard` and `routes/`).
* **Type-Safe Routing**: Using TanStack Router's folder-based hierarchy makes adding new pages or sub-dashboards intuitive and prevents routing bugs.
* **Integrations Folder**: Isolating API configurations (like the Supabase Client) in `src/integrations` makes updating API endpoints or adding new services extremely clean without cluttering the rest of the application code.
* **Database Version Control**: Saving the database setup as SQL files in `supabase/migrations/` ensures that your database schema is version-controlled alongside your code.
