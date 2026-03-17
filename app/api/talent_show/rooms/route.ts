import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isProjectAdmin } from '@/lib/auth/permissions'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = await isProjectAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: rooms, error } = await supabase
    .from('rooms')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch performers for each room
  const roomIds = (rooms || []).map(r => r.id)
  let performers: Record<string, unknown[]> = {}
  if (roomIds.length > 0) {
    const { data: allPerformers } = await supabase
      .from('performers')
      .select('id, name, act_description, display_order, room_id')
      .in('room_id', roomIds)
      .order('display_order')

    for (const p of allPerformers || []) {
      const rid = p.room_id as string
      if (!performers[rid]) performers[rid] = []
      performers[rid].push(p)
    }
  }

  const result = (rooms || []).map(r => ({
    ...r,
    performers: performers[r.id] || [],
  }))

  return NextResponse.json(result)
}

function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = await isProjectAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Retry PIN generation on unique constraint collision
  let attempts = 0
  while (attempts < 5) {
    const pin = generatePin()
    const { data, error } = await supabase
      .from('rooms')
      .insert({ pin, created_by: user.id })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        attempts++
        continue
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  }

  return NextResponse.json({ error: 'Failed to generate unique PIN' }, { status: 500 })
}
