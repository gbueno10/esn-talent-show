'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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

  const supabase = useRef(createClient()).current
  const voteCountsRef = useRef(voteCounts)
  voteCountsRef.current = voteCounts

  const currentPerformer = performers.find(p => p.id === room.current_performer_id) || null
  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/play?pin=${room.pin}` : ''

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
            if (voteCountsRef.current.yes_count > voteCountsRef.current.no_count) {
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
  }, [room.id, supabase])

  // Polling fallback — syncs room state every 5s in case realtime drops
  useEffect(() => {
    const poll = async () => {
      const { data } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', room.id)
        .single()
      if (data) setRoom(prev => ({ ...prev, ...data }))
    }

    const interval = setInterval(poll, 5000)
    return () => clearInterval(interval)
  }, [room.id, supabase])

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

  // Small QR code + PIN badge (always visible in corner)
  const qrBadge = (
    <div className="absolute top-6 right-6 flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-3 z-30">
      <div className="bg-white p-2 rounded-xl">
        <QRCodeSVG
          value={joinUrl}
          size={64}
          level="M"
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-400 uppercase tracking-widest">PIN</p>
        <p className="text-2xl font-black tracking-[0.15em]">{room.pin}</p>
      </div>
    </div>
  )

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden">
      {/* Emoji overlay */}
      <EmojiOverlay reactions={reactions} />

      {/* Trigger confetti effect */}
      {showConfetti && <ConfettiEffect />}

      {/* Waiting — full join screen */}
      {room.status === 'waiting' && (
        <div className="text-center">
          <h1 className="text-7xl font-bold mb-4">ESN Talent Show</h1>
          <p className="text-xl text-gray-500 mb-12">Scan to join and vote live!</p>
          <div className="flex items-center justify-center gap-10">
            <div className="bg-white p-5 rounded-3xl">
              <QRCodeSVG
                value={joinUrl}
                size={200}
                level="M"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            <div className="text-left">
              <p className="text-gray-500 text-lg mb-2 uppercase tracking-widest">Enter PIN</p>
              <p className="text-8xl font-black tracking-[0.3em]">{room.pin}</p>
            </div>
          </div>
          {performers.length > 0 && (
            <div className="mt-16">
              <p className="text-gray-600 text-sm uppercase tracking-widest mb-4">Lineup</p>
              <div className="flex flex-wrap justify-center gap-3">
                {performers.map(p => (
                  <span key={p.id} className="px-4 py-2 bg-white/5 rounded-full text-gray-400 text-sm">
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Intro — performer spotlight */}
      {room.status === 'intro' && currentPerformer && (
        <>
          {qrBadge}
          <div className="text-center animate-[fadeIn_0.8s_ease-out] px-8">
            <p className="text-gray-500 text-2xl mb-6 uppercase tracking-[0.3em]">Now on stage</p>
            <h1 className="text-9xl font-black mb-6 leading-tight">{currentPerformer.name}</h1>
            {currentPerformer.act_description && (
              <p className="text-4xl text-gray-400 font-light">{currentPerformer.act_description}</p>
            )}
          </div>
        </>
      )}

      {/* Voting */}
      {room.status === 'voting' && currentPerformer && (
        <>
          {qrBadge}
          <div className="w-full max-w-4xl px-8">
            <div className="text-center mb-10">
              <p className="text-green-400 text-2xl font-semibold uppercase tracking-[0.3em] mb-3 animate-pulse">
                Vote Now!
              </p>
              <h1 className="text-7xl font-black">{currentPerformer.name}</h1>
              {currentPerformer.act_description && (
                <p className="text-2xl text-gray-500 mt-3">{currentPerformer.act_description}</p>
              )}
            </div>

            <VoteBar voteCounts={voteCounts} />

            <div className="text-center mt-8">
              <p className="text-gray-600 text-xl">
                {voteCounts.total} vote{voteCounts.total !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Closed — results */}
      {room.status === 'closed' && currentPerformer && (
        <>
          {qrBadge}
          <div className="text-center w-full max-w-4xl px-8">
            <h1 className="text-7xl font-black mb-4">{currentPerformer.name}</h1>
            {currentPerformer.act_description && (
              <p className="text-2xl text-gray-500 mb-8">{currentPerformer.act_description}</p>
            )}
            <VoteBar voteCounts={voteCounts} />
            <div className="mt-10">
              <p className="text-5xl font-bold">
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
          </div>
        </>
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
