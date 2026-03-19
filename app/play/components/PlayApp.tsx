'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [voterId] = useState(() => {
    if (typeof window === 'undefined') return ''
    const stored = localStorage.getItem('esn_voter_id')
    if (stored) return stored
    const id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
        })
    localStorage.setItem('esn_voter_id', id)
    return id
  })
  const [nickname, setNickname] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('esn_nickname') || '' : ''
  )
  const [room, setRoom] = useState<Room | null>(null)
  const [performers, setPerformers] = useState<Performer[]>([])
  const [joined, setJoined] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = useRef(createClient()).current

  const currentPerformer = performers.find(p => p.id === room?.current_performer_id) || null

  const doJoin = async (joinPin: string) => {
    const res = await fetch('/api/talent_show/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: joinPin.trim() }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to join room')
    }
    return res.json()
  }

  // Auto-restore session on mount
  useEffect(() => {
    const savedPin = localStorage.getItem('esn_room_pin')
    const savedNickname = localStorage.getItem('esn_nickname')
    if (!savedPin || !savedNickname) return

    setLoading(true)
    doJoin(savedPin)
      .then(data => {
        setPin(savedPin)
        setRoom(data)
        setPerformers(data.performers || [])
        setJoined(true)
      })
      .catch(() => {
        // Room no longer valid — clear saved session
        localStorage.removeItem('esn_room_pin')
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin.trim()) return

    setLoading(true)
    setError(null)

    try {
      const data = await doJoin(pin)
      setRoom(data)
      setPerformers(data.performers || [])
      localStorage.setItem('esn_room_pin', pin.trim())
      localStorage.setItem('esn_nickname', nickname.trim())
      setJoined(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection error. Please try again.')
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
  }, [room?.id, supabase])

  // Polling fallback — syncs room state every 5s in case realtime drops
  useEffect(() => {
    if (!room) return

    const poll = async () => {
      const { data } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', room.id)
        .single()
      if (data) setRoom(prev => prev ? { ...prev, ...data } : null)
    }

    const interval = setInterval(poll, 5000)
    return () => clearInterval(interval)
  }, [room?.id, supabase])

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
        voterId={voterId}
      />
    ),
    closed: <ClosedScreen />,
  }

  return statusScreens[room.status] || <WaitingScreen />
}
