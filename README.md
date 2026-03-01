# Standalone App Template

A Next.js 15 template for building apps on the shared Supabase infrastructure with isolated PostgreSQL schemas.

## Quick Start

### 1. Copy this template

```bash
cp -r template my-new-app
cd my-new-app
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your project settings:
- `NEXT_PUBLIC_PROJECT_SLUG` - Your project identifier
- `NEXT_PUBLIC_SUPABASE_SCHEMA` - Your database schema

### 3. Register your project in the database

```sql
INSERT INTO public.projects (slug, name, access_level, allow_signup)
VALUES ('my_project', 'My Project', 'staff_only', false);
```

### 4. Create your schema

```sql
CREATE SCHEMA IF NOT EXISTS my_project;
GRANT USAGE ON SCHEMA my_project TO authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA my_project TO authenticated, service_role;
```

### 5. Install and run

```bash
pnpm install
pnpm dev
```

## Features

- **Authentication** - Login, signup, password reset
- **Authorization** - Project-based access control
- **Middleware** - Automatic auth + project access verification
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling

## Project Structure

```
├── app/
│   ├── (auth)/         # Auth pages
│   ├── (protected)/    # Protected pages
│   └── ...
├── lib/
│   ├── supabase/       # Database clients
│   └── auth/           # Permission helpers
├── components/         # React components
└── types/              # TypeScript types
```

## Documentation

- [Architecture Overview](../docs/ARCHITECTURE.md)
- [Creating New Projects](../docs/CREATING_NEW_PROJECT.md)
- [AI Instructions](.claude/instructions.md)

## Access Levels

| Level | Description |
|-------|-------------|
| `public` | Any authenticated user |
| `staff_only` | Only ESN volunteers/admins |
| `admin_only` | Only ESN admins |
| `custom` | Explicit user list |

## Development

```bash
pnpm dev      # Start dev server
pnpm build    # Build for production
pnpm lint     # Run linter
```

## Need Help?

Check the [AI Instructions](.claude/instructions.md) for detailed context about the codebase.
