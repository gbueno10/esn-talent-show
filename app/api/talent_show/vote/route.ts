import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'You must be signed in to vote. Please refresh the page.' },
      { status: 401 }
    )
  }

  const body = await request.json()
  if (!body.performer_id || typeof body.vote !== 'boolean') {
    return NextResponse.json(
      { error: 'performer_id and vote (boolean) are required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('votes')
    .insert({
      performer_id: body.performer_id,
      user_id: user.id,
      vote: body.vote,
    })
    .select()
    .single()

  if (error) {
    // Unique constraint violation = already voted
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
