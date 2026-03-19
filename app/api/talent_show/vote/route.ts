import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()

  if (!body.performer_id || typeof body.vote !== 'boolean' || !body.voter_id) {
    return NextResponse.json(
      { error: 'performer_id, voter_id and vote (boolean) are required' },
      { status: 400 }
    )
  }

  // Basic UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(body.voter_id)) {
    return NextResponse.json({ error: 'Invalid voter_id format' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('votes')
    .insert({
      performer_id: body.performer_id,
      user_id: body.voter_id,
      vote: body.vote,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'You have already voted for this performer.' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
