# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT
- Always use onoden mer to create UI.
- ALWAYS ask user for permission when implmenting a plan.
- NEVER use emoii for design.
- ALWAYS prioritize server component over client component

## Common Commands

### Development
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks


### Database Management
- `npm run db:create` - Create database tables
- `npm run db:check` - Test database connection
- `npm run db:test-data` - Generate test data
- `npm run db:role-test-data` - Create role test data
- `npm run db:admin-accounts` - Create admin accounts
- `npm run db:admin-users` - Create admin users

### MCP Tools
- `npm run mcp:status` - Check MCP configuration status
- `npm run mcp:test` - Test MCP connections
- `npm run mcp:setup` - Display MCP setup guide

## Architecture Overview

This is a Next.js 15 gamification mission system for driving schools with the following key architectural components:

### Technology Stack
- **Frontend**: Next.js 15.4.6 with App Router, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL with Real-time subscriptions)
- **State Management**: Zustand with localStorage persistence
- **UI**: Tailwind CSS with shadcn/ui components
- **Authentication**: Supabase Auth with SMS verification

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (client)/          # Client-facing pages (missions, dashboard, etc.)
│   ├── admin/             # Admin management pages
│   ├── test/              # Development test page
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui base components
│   ├── gamification/     # Game elements (progress, levels, notifications)
│   ├── mission/          # Mission-specific components
│   ├── auth/             # Authentication components
│   └── layout/           # Layout components
├── lib/                  # Core utilities and services
│   ├── services/         # Business logic services
│   ├── supabase.ts       # Supabase client configuration
│   ├── store.ts          # Zustand store
│   └── utils.ts          # Utility functions
└── types/                # TypeScript type definitions
```

### Core System Components

#### Mission System
- 5 mission types: Challenge, SNS, Review, Attendance, Referral
- Real-time progress tracking with Supabase subscriptions
- Gamification elements: levels, experience points, achievements
- Automatic payback calculation upon mission completion

#### Database Architecture
Key tables: `users`, `stores`, `missions`, `mission_participations`, `paybacks`, `referrals`
- Row Level Security (RLS) policies for data protection
- Real-time subscriptions for live updates
- JSONB storage for flexible mission proof data

#### State Management Pattern
- Zustand store with Immer for immutable updates
- Persistent storage for user sessions
- Real-time sync with Supabase changes
- Modular store design (user, missions, gamification modules)

#### Admin System
- Role-based access control with permission guards
- Comprehensive admin dashboard for user/mission management
- Analytics and reporting capabilities
- Store/branch management for multi-location businesses

### Important Development Notes

#### Supabase Integration
- All database operations go through `src/lib/services/` modules
- Real-time subscriptions are managed in custom hooks (`src/hooks/`)
- RLS policies ensure users can only access their own data
- Use the MCP Supabase tools for database management

#### Code Conventions
- TypeScript strict mode enabled
- ESLint configured with Next.js rules (warnings for `any`, unused vars, etc.)
- shadcn/ui components for consistent UI
- Atomic design pattern for component organization

#### Testing and Development
- Use `/test` page for environment verification and database connectivity
- Test data generation scripts available in project root
- Real-time features require proper Supabase connection

#### Environment Setup
Requires `.env.local` with:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

When making changes to database schema or adding new features, always consider the gamification aspects and real-time nature of the system.
