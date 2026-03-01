// =============================================================================
// DATABASE TYPES
// =============================================================================

/**
 * User profile from ESN App (public.profiles)
 */
export interface ESNProfile {
  id: string
  role: 'student' | 'volunteer' | 'admin'
  name?: string
  email?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

/**
 * Project registration (public.projects)
 */
export interface Project {
  slug: string
  name: string
  description?: string
  access_level: 'public' | 'staff_only' | 'admin_only' | 'custom'
  allow_signup: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * User project access (public.user_project_access)
 */
export interface UserProjectAccess {
  id: string
  user_id: string
  project_slug: string
  role: 'user' | 'admin'
  granted_at: string
  granted_by?: string
  revoked_at?: string
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

export interface PageProps {
  params: Promise<Record<string, string>>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// =============================================================================
// PROJECT-SPECIFIC TYPES (customize for your project)
// =============================================================================

/**
 * Example: Project-specific user profile
 * Customize this for your project's needs
 */
export interface ProjectProfile {
  id: string
  user_id: string
  display_name?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}
