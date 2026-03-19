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

  // Auto-advance: pick next unplayed performer
  if (body.action === 'next') {
    // Get current room to mark current performer as performed
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('current_performer_id')
      .eq('id', roomId)
      .single()

    if (roomError) {
      return NextResponse.json({ error: roomError.message }, { status: 500 })
    }

    // Mark current performer as performed
    if (room.current_performer_id) {
      const { error: markError } = await supabase
        .from('performers')
        .update({ performed: true })
        .eq('id', room.current_performer_id)

      if (markError) {
        return NextResponse.json({ error: markError.message }, { status: 500 })
      }
    }

    // Find next unplayed performer
    const { data: nextPerformer, error: nextError } = await supabase
      .from('performers')
      .select('id')
      .eq('room_id', roomId)
      .eq('performed', false)
      .order('display_order', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (nextError) {
      return NextResponse.json({ error: nextError.message }, { status: 500 })
    }

    const updates = nextPerformer
      ? { status: 'intro' as RoomStatus, current_performer_id: nextPerformer.id }
      : { status: 'waiting' as RoomStatus, current_performer_id: null }

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

  // Manual status change (existing behavior)
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
