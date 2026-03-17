'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Room, Performer, RoomStatus } from '@/types/talent-show'
import WaitingScreen from './WaitingScreen'
import IntroScreen from './IntroScreen'
import VotingScreen from './VotingScreen'
import ClosedScreen from './ClosedScreen'

export default function PlayApp() {
  const [pin, setPin] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('pin') || ''
    }
    return ''
  })
  const [nickname, setNickname] = useState('')
  const [room, setRoom] = useState<Room | null>(null)
  const [performers, setPerformers] = useState<Performer[]>([])
  const [joined, setJoined] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const currentPerformer = performers.find(p => p.id === room?.current_performer_id) || null

  // Anonymous sign-in
  const ensureAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      await supabase.auth.signInAnonymously()
    }
  }, [supabase])

  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/talent_show/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to join room')
        setLoading(false)
        return
      }

      const data = await res.json()
      setRoom(data)
      setPerformers(data.performers || [])

      // Ensure anonymous auth
      await ensureAuth()

      setJoined(true)
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Realtime subscription for room status changes
  useEffect(() => {
    if (!room) return

    const channel = supabase
      .channel(`play-room-${room.id}`)
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
          setRoom(prev => prev ? { ...prev, ...updated } : null)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [room?.id, supabase, room])

  // Join screen
  if (!joined) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">ESN Talent Show</h1>
            <p className="text-slate-400">Enter the room PIN to join</p>
          </div>

          <form onSubmit={joinRoom} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Room PIN"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white text-center text-3xl tracking-[0.3em] placeholder:text-slate-500 placeholder:text-lg placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              maxLength={6}
              required
              autoFocus
            />
            <input
              type="text"
              placeholder="Your nickname"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white text-center placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              maxLength={30}
              required
            />

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !pin.trim() || !nickname.trim()}
              className="w-full py-4 bg-[var(--primary)] text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : 'Join'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Room screens based on status
  if (!room) return null

  const statusScreens: Record<RoomStatus, React.ReactNode> = {
    waiting: <WaitingScreen />,
    intro: <IntroScreen performer={currentPerformer} />,
    voting: (
      <VotingScreen
        performer={currentPerformer}
        roomId={room.id}
        nickname={nickname}
      />
    ),
    closed: <ClosedScreen />,
  }

  return statusScreens[room.status] || <WaitingScreen />
}
