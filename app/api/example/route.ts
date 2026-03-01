import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isProjectAdmin } from '@/lib/auth/permissions'

/**
 * Example API route - DELETE this file and create your own!
 *
 * API routes run on the server and are secure.
 * Use them for all database mutations and sensitive operations.
 */

// GET /api/example
export async function GET() {
  const supabase = await createClient()

  // Always verify the user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Your logic here...
  return NextResponse.json({
    message: 'Hello from the API!',
    user: user.email,
  })
}

// POST /api/example
export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // For admin-only operations, check permissions
  const isAdmin = await isProjectAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Parse the request body
  const body = await request.json()

  // Validate input (always validate!)
  if (!body.name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  // Your database operation here...
  // const { data, error } = await supabase.from('table').insert(body)

  return NextResponse.json({ success: true, received: body }, { status: 201 })
}
