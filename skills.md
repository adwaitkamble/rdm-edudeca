# Technical Skills & Domain Knowledge

## 1. Monorepo & Tooling
* **Workspace Engine**: Turborepo with `pnpm` workspaces for isolated dependency resolution and caching.
* **Shared Packages**: Abstracting shared TypeScript configs, ESLint configs, and reusable UI tokens into `packages/*`.

## 2. Frontend Framework & Navigation
* **Core Runtime**: React Native with Expo (Managed Workflow).
* **Routing**: React Navigation implementing:
  - `AuthStackNavigator`: Marketing Home, Pick Path, and Sign-In screens.
  - `MainTabNavigator`: Dashboard, Levels, Rank, and Rewards bottom tabs.
  - `DashboardStackNavigator`: Nested stack for Level Select, Quiz Engine, Results, and Refer screens.
  - `Drawer/Modal Overlay`: Custom sliding right burger menu panel.

## 3. Identity & Authentication
* **Provider**: Clerk (`@clerk/clerk-expo`).
* **Storage**: `expo-secure-store` for persistent, encrypted session and JWT caching.
* **OAuth Flow**: Google Single Sign-On integration aligned with science stream validation requirements.

## 4. State & Interactive Logic
* **Global State**: Zustand for synchronous UI state (selected tracks, streaks, RDM points balance, quiz configurations).
* **Quiz Engine**: High-precision countdown timer hook (20s interval), automated score evaluation, and tier-based XP calculator.
* **Mock Service Layer**: Fully typed local JSON mock providers mimicking future REST/GraphQL endpoints for leaderboards, user profiles, and referrals.