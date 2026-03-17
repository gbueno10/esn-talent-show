import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const body = await request.json()
  if (!body.pin) {
    return NextResponse.json({ error: 'PIN is required' }, { status: 400 })
  }

  const pin = body.pin.toString().trim()

  // Find room by PIN
  const { data: room, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('pin', pin)
    .single()

  if (error || !room) {
    console.error('Join room error:', error)
    return NextResponse.json({ error: 'Room not found. Check your PIN.' }, { status: 404 })
  }

  // Fetch performers separately
  const { data: performers } = await supabase
    .from('performers')
    .select('id, name, act_description, display_order')
    .eq('room_id', room.id)
    .order('display_order')

  return NextResponse.json({ ...room, performers: performers || [] })
}
