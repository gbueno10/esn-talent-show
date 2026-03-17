'use client'

import { useState, useEffect, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import confetti from 'canvas-confetti'
import { createClient } from '@/lib/supabase/client'
import type { Room, Performer, RoomWithPerformers, VoteCount } from '@/types/talent-show'
import VoteBar from './VoteBar'
import EmojiOverlay from './EmojiOverlay'

interface HostScreenProps {
  initialRoom: RoomWithPerformers
}

export default function HostScreen({ initialRoom }: HostScreenProps) {
  const [room, setRoom] = useState<Room>(initialRoom)
  const [performers] = useState<Performer[]>(initialRoom.performers)
  const [voteCounts, setVoteCounts] = useState<VoteCount>({
    performer_id: '',
    yes_count: 0,
    no_count: 0,
    total: 0,
  })
  const [reactions, setReactions] = useState<{ id: number; emoji: string; nickname: string }[]>([])
  const [showConfetti, setShowConfetti] = useState(false)

  const supabase = createClient()
  const currentPerformer = performers.find(p => p.id === room.current_performer_id) || null

  // Fetch vote counts for current performer
  const fetchVotes = useCallback(async () => {
    if (!room.current_performer_id) return

    const { data } = await supabase
      .from('votes')
      .select('vote')
      .eq('performer_id', room.current_performer_id)

    if (data) {
      const yesCount = data.filter(v => v.vote === true).length
      const noCount = data.filter(v => v.vote === false).length
      setVoteCounts({
        performer_id: room.current_performer_id,
        yes_count: yesCount,
        no_count: noCount,
        total: yesCount + noCount,
      })
    }
  }, [room.current_performer_id, supabase])

  // Subscribe to room changes
  useEffect(() => {
    const channel = supabase
      .channel(`screen-room-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'talent_show',
          table: 'rooms',
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          const updated = payload.new as Room
          const previousStatus = room.status

          setRoom(prev => ({ ...prev, ...updated }))

          // Trigger confetti when closing and YES wins
          if (updated.status === 'closed' && previousStatus === 'voting') {
            if (voteCounts.yes_count > voteCounts.no_count) {
              setShowConfetti(true)
              setTimeout(() => setShowConfetti(false), 5000)
            }
          }

          // Reset votes when switching to intro
          if (updated.status === 'intro') {
            setVoteCounts({ performer_id: '', yes_count: 0, no_count: 0, total: 0 })
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [room.id, room.status, voteCounts.yes_count, voteCounts.no_count, supabase])

  // Subscribe to votes
  useEffect(() => {
    if (!room.current_performer_id) return

    // Initial fetch
    fetchVotes()

    const channel = supabase
      .channel(`screen-votes-${room.current_performer_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'talent_show',
          table: 'votes',
        },
        (payload) => {
          const newVote = payload.new as { performer_id: string; vote: boolean }
          if (newVote.performer_id === room.current_performer_id) {
            setVoteCounts(prev => ({
              ...prev,
              yes_count: prev.yes_count + (newVote.vote ? 1 : 0),
              no_count: prev.no_count + (newVote.vote ? 0 : 1),
              total: prev.total + 1,
            }))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [room.current_performer_id, supabase, fetchVotes])

  // Subscribe to reactions broadcast
  useEffect(() => {
    const channel = supabase
      .channel(`room:${room.id}:reactions`)
      .on('broadcast', { event: 'reaction' }, (payload) => {
        const { emoji, nickname } = payload.payload
        const id = Date.now() + Math.random()
        setReactions(prev => [...prev.slice(-30), { id, emoji, nickname }])

        // Auto-remove after animation
        setTimeout(() => {
          setReactions(prev => prev.filter(r => r.id !== id))
        }, 3000)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [room.id, supabase])

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden">
      {/* Emoji overlay */}
      <EmojiOverlay reactions={reactions} />

      {/* Trigger confetti effect */}
      {showConfetti && <ConfettiEffect />}

      {/* Waiting */}
      {room.status === 'waiting' && (
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-10">ESN Talent Show</h1>
          <div className="flex items-center justify-center gap-10">
            <div className="bg-white p-5 rounded-3xl">
              <QRCodeSVG
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/play?pin=${room.pin}`}
                size={200}
                level="M"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            <div className="text-left">
              <p className="text-gray-500 text-lg mb-2 uppercase tracking-widest">Scan to join</p>
              <p className="text-8xl font-black tracking-[0.3em]">{room.pin}</p>
              <p className="text-gray-600 mt-3 text-lg">or go to the app and enter the PIN</p>
            </div>
          </div>
        </div>
      )}

      {/* Intro */}
      {room.status === 'intro' && currentPerformer && (
        <div className="text-center animate-[fadeIn_0.8s_ease-out]">
          <p className="text-gray-500 text-xl mb-4 uppercase tracking-widest">Now on stage</p>
          <h1 className="text-8xl font-bold mb-6">{currentPerformer.name}</h1>
          {currentPerformer.act_description && (
            <p className="text-3xl text-gray-400">{currentPerformer.act_description}</p>
          )}
        </div>
      )}

      {/* Voting */}
      {room.status === 'voting' && currentPerformer && (
        <div className="w-full max-w-4xl px-8">
          <div className="text-center mb-12">
            <p className="text-green-400 text-xl font-semibold uppercase tracking-widest mb-2">
              Vote Now!
            </p>
            <h1 className="text-5xl font-bold">{currentPerformer.name}</h1>
          </div>

          <VoteBar voteCounts={voteCounts} />

          <div className="text-center mt-8">
            <p className="text-gray-600 text-lg">
              {voteCounts.total} vote{voteCounts.total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Closed */}
      {room.status === 'closed' && (
        <div className="text-center">
          {currentPerformer && (
            <>
              <h1 className="text-5xl font-bold mb-8">{currentPerformer.name}</h1>
              <VoteBar voteCounts={voteCounts} />
              <div className="mt-8">
                <p className="text-4xl font-bold">
                  {voteCounts.yes_count > voteCounts.no_count ? (
                    <span className="text-green-400">YES WINS! 🎉</span>
                  ) : voteCounts.no_count > voteCounts.yes_count ? (
                    <span className="text-red-400">NO WINS</span>
                  ) : (
                    <span className="text-yellow-400">TIE!</span>
                  )}
                </p>
                <p className="text-gray-500 text-xl mt-4">
                  {voteCounts.yes_count} Yes vs {voteCounts.no_count} No ({voteCounts.total} total)
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function ConfettiEffect() {
  useEffect(() => {
    const duration = 4000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#00b894', '#00cec9', '#0984e3', '#6c5ce7', '#fdcb6e'],
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#00b894', '#00cec9', '#0984e3', '#6c5ce7', '#fdcb6e'],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }, [])

  return null
}
