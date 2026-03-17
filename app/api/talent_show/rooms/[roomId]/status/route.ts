import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isProjectAdmin } from '@/lib/auth/permissions'
import type { RoomStatus } from '@/types/talent-show'

const VALID_STATUSES: RoomStatus[] = ['waiting', 'intro', 'voting', 'closed']

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const supabase = await createClient()
  const { roomId } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = await isProjectAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()

  if (!body.status || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 }
    )
  }

  const updates: Record<string, unknown> = { status: body.status }
  if (body.current_performer_id !== undefined) {
    updates.current_performer_id = body.current_performer_id
  }

  const { data, error } = await supabase
    .from('rooms')
    .update(updates)
    .eq('id', roomId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
