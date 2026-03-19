'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Performer } from '@/types/talent-show'

interface VotingScreenProps {
  performer: Performer | null
  roomId: string
  nickname: string
  voterId: string
}

const REACTION_EMOJIS = ['👏', '🔥', '❤️', '😍', '🎉', '🤮']

export default function VotingScreen({ performer, roomId, nickname, voterId }: VotingScreenProps) {
  const [voted, setVoted] = useState(false)
  const [voteValue, setVoteValue] = useState<boolean | null>(null)
  const [voting, setVoting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Reset vote state when performer changes
  useEffect(() => {
    setVoted(false)
    setVoteValue(null)
    setError(null)
  }, [performer?.id])

  const submitVote = async (vote: boolean) => {
    if (!performer || voted || voting) return
    setVoting(true)
    setError(null)

    try {
      const res = await fetch('/api/talent_show/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ performer_id: performer.id, vote, voter_id: voterId }),
      })

      if (res.ok) {
        setVoted(true)
        setVoteValue(vote)
      } else if (res.status === 409) {
        setVoted(true)
        setVoteValue(vote)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to vote')
      }
    } catch {
      setError('Connection error. Try again.')
    } finally {
      setVoting(false)
    }
  }

  const sendReaction = (emoji: string) => {
    supabase
      .channel(`room:${roomId}:reactions`)
      .send({
        type: 'broadcast',
        event: 'reaction',
        payload: { emoji, nickname },
      })
  }

  if (!performer) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6 text-center">
        <p className="text-slate-400 text-lg">Waiting for voting to start...</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6">
      {/* Performer info */}
      <div className="text-center mb-8">
        <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">
          VOTE NOW
        </span>
        <h2 className="text-2xl font-bold text-white mt-3">{performer.name}</h2>
        {performer.act_description && (
          <p className="text-slate-400 mt-1">{performer.act_description}</p>
        )}
      </div>

      {/* Voting buttons */}
      {!voted ? (
        <div className="w-full max-w-sm space-y-4">
          {error && (
            <div className="p-2 bg-red-500/20 text-red-300 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={() => submitVote(true)}
            disabled={voting}
            className="w-full py-8 bg-green-500 hover:bg-green-400 text-white rounded-3xl font-bold text-3xl transition-all active:scale-95 disabled:opacity-50"
          >
            {voting ? '...' : 'YES 👍'}
          </button>
          <button
            onClick={() => submitVote(false)}
            disabled={voting}
            className="w-full py-8 bg-red-500 hover:bg-red-400 text-white rounded-3xl font-bold text-3xl transition-all active:scale-95 disabled:opacity-50"
          >
            {voting ? '...' : 'NO 👎'}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-6xl mb-4">
            {voteValue ? '👍' : '👎'}
          </div>
          <p className="text-white text-xl font-semibold">
            Vote recorded!
          </p>
          <p className="text-slate-400 mt-1">
            You voted {voteValue ? 'YES' : 'NO'}
          </p>
        </div>
      )}

      {/* Reaction buttons */}
      <div className="mt-10 w-full max-w-sm">
        <p className="text-slate-500 text-xs text-center mb-3">Send reactions</p>
        <div className="flex justify-center gap-3">
          {REACTION_EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-90 transition-all flex items-center justify-center text-2xl"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
