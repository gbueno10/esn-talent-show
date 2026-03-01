# AI Assistant Instructions

This document provides context for AI code assistants working on this repository.

## Repository Overview

This is a multi-project monorepo using a single self-hosted Supabase instance with PostgreSQL schema isolation.

## Key Architecture Decisions

### 1. Schema Isolation

Each project has its own PostgreSQL schema:
- `public` - ESN App (main app) + shared resources
- `speed_dating` - Speed Dating App
- `email_sender` - Email Sender App
- `asset_management` - Asset Management App

### 2. Shared Authentication

All projects share `auth.users`. A single user account can have access to multiple projects.

### 3. Access Control System

```sql
public.projects        -- Registry of all projects
public.user_project_access  -- Per-user, per-project permissions
public.profiles        -- ESN roles (student/volunteer/admin)
```

**Access levels:**
- `public` - Any authenticated user
- `staff_only` - Volunteers + admins only
- `admin_only` - Admins only
- `custom` - Explicit user list

### 4. Database Functions

```sql
is_staff()                          -- Is user volunteer/admin?
is_esn_admin()                      -- Is user ESN admin?
has_project_access(slug)            -- Can user access project?
is_project_admin(slug)              -- Is user admin of project?
get_user_projects()                 -- List accessible projects
```

## Directory Structure

```
/
├── docs/                    # Architecture documentation
├── template/                # Template for new projects
│   ├── app/                 # Next.js app
│   ├── lib/                 # Libraries
│   │   ├── supabase/        # Supabase clients
│   │   └── auth/            # Permission helpers
│   └── .claude/             # AI instructions
├── esn-app/                 # ESN App (main app)
├── supabase/                # Supabase config & migrations
└── scripts/                 # Utility scripts
```

## Creating a New Project

1. Copy `template/` to new directory
2. Register in `public.projects`
3. Create schema with grants
4. Configure `.env`
5. Run `pnpm install && pnpm dev`

See `docs/CREATING_NEW_PROJECT.md` for details.

## Common Operations

### Query from project schema
```typescript
const supabase = await createClient()  // Uses NEXT_PUBLIC_SUPABASE_SCHEMA
const { data } = await supabase.from('my_table').select('*')
```

### Query from public schema
```typescript
const supabase = await createPublicClient()  // Uses 'public'
const { data } = await supabase.from('profiles').select('*')
```

### Check permissions
```typescript
import { isProjectAdmin, isStaff } from '@/lib/auth/permissions'
const isAdmin = await isProjectAdmin()
```

## Database Conventions

- All tables must have RLS enabled
- Use `auth.uid()` in policies for user checks
- Reference `auth.users(id)` for user foreign keys
- Use `timestamptz` for timestamps
- Default `created_at` to `now()`

## Code Style

- TypeScript strict mode
- Server Components by default
- Tailwind CSS for styling
- `@/` path alias for imports
