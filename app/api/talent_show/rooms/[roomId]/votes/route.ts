import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { VoteCount } from '@/types/talent-show'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const supabase = await createClient()
  const { roomId } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all performers for this room
  const { data: performers, error: perfError } = await supabase
    .from('performers')
    .select('id')
    .eq('room_id', roomId)

  if (perfError) {
    return NextResponse.json({ error: perfError.message }, { status: 500 })
  }

  if (!performers || performers.length === 0) {
    return NextResponse.json([])
  }

  const performerIds = performers.map(p => p.id)

  // Get all votes for these performers
  const { data: votes, error: votesError } = await supabase
    .from('votes')
    .select('performer_id, vote')
    .in('performer_id', performerIds)

  if (votesError) {
    return NextResponse.json({ error: votesError.message }, { status: 500 })
  }

  // Aggregate vote counts
  const voteCounts: VoteCount[] = performerIds.map(performerId => {
    const performerVotes = (votes || []).filter(v => v.performer_id === performerId)
    const yesCount = performerVotes.filter(v => v.vote === true).length
    const noCount = performerVotes.filter(v => v.vote === false).length
    return {
      performer_id: performerId,
      yes_count: yesCount,
      no_count: noCount,
      total: yesCount + noCount,
    }
  })

  return NextResponse.json(voteCounts)
}
