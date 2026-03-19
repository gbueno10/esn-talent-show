'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Reorder, useDragControls } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Room, Performer, VoteCount, RoomStatus } from '@/types/talent-show'

const STATUS_LABELS: Record<RoomStatus, string> = {
  waiting: 'Aguardando',
  intro: 'No Palco',
  voting: 'Votando',
  closed: 'Encerrado',
}

const STATUS_COLORS: Record<RoomStatus, string> = {
  waiting: 'bg-yellow-100 text-yellow-800',
  intro: 'bg-blue-100 text-blue-800',
  voting: 'bg-green-100 text-green-800',
  closed: 'bg-slate-100 text-slate-600',
}

function DragHandle({ dragControls }: { dragControls: ReturnType<typeof useDragControls> }) {
  return (
    <button
      className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 touch-none"
      onPointerDown={(e) => dragControls.start(e)}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="5" cy="3" r="1.5" /><circle cx="11" cy="3" r="1.5" />
        <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
        <circle cx="5" cy="13" r="1.5" /><circle cx="11" cy="13" r="1.5" />
      </svg>
    </button>
  )
}

function QueueItem({
  performer,
  zone,
  isEditing,
  editName,
  editAct,
  voteCount,
  onEdit,
  onEditNameChange,
  onEditActChange,
  onSave,
  onCancelEdit,
  onDelete,
  onSkip,
  onReset,
  dragControls,
}: {
  performer: Performer
  zone: 'playing' | 'next' | 'done'
  isEditing: boolean
  editName: string
  editAct: string
  voteCount: VoteCount
  onEdit: () => void
  onEditNameChange: (v: string) => void
  onEditActChange: (v: string) => void
  onSave: () => void
  onCancelEdit: () => void
  onDelete: () => void
  onSkip: () => void
  onReset: () => void
  dragControls?: ReturnType<typeof useDragControls>
}) {
  if (isEditing) {
    return (
      <div className="p-3 bg-slate-50 rounded-xl space-y-2">
        <input value={editName} onChange={e => onEditNameChange(e.target.value)} className="w-full px-2 py-1 border rounded-lg text-sm" />
        <input value={editAct} onChange={e => onEditActChange(e.target.value)} placeholder="Ato" className="w-full px-2 py-1 border rounded-lg text-sm" />
        <div className="flex gap-2">
          <button onClick={onSave} className="px-3 py-1 bg-[var(--accent)] text-white rounded-lg text-xs">Guardar</button>
          <button onClick={onCancelEdit} className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-xs">Cancelar</button>
        </div>
      </div>
    )
  }

  const bgClass = zone === 'playing'
    ? 'bg-[var(--primary)]/10 border border-[var(--primary)]/30'
    : zone === 'done'
    ? 'bg-slate-50 opacity-60'
    : 'bg-slate-50'

  return (
    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors ${bgClass}`}>
      {dragControls && <DragHandle dragControls={dragControls} />}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-slate-900">{performer.name}</span>
        {zone === 'playing' && <span className="ml-1.5 text-xs font-bold text-[var(--primary)]">NO PALCO</span>}
        {zone === 'done' && voteCount.total > 0 && (
          <span className="ml-1.5 text-xs text-slate-400">
            {Math.round((voteCount.yes_count / voteCount.total) * 100)}% SIM
          </span>
        )}
        {performer.act_description && <span className="text-xs text-slate-400 ml-2">{performer.act_description}</span>}
      </div>
      <div className="flex items-center gap-0.5 text-slate-400">
        {zone === 'next' && (
          <button onClick={onSkip} className="p-1 hover:text-orange-600 text-xs" title="Saltar">⏭</button>
        )}
        {zone === 'done' && (
          <button onClick={onReset} className="p-1 hover:text-blue-600 text-xs" title="Voltar à fila">↩</button>
        )}
        {zone !== 'playing' && (
          <>
            <button onClick={onEdit} className="p-1 hover:text-blue-600 text-xs">✎</button>
            <button onClick={onDelete} className="p-1 hover:text-red-600 text-xs">✕</button>
          </>
        )}
      </div>
    </div>
  )
}

function DraggableQueueItem(props: React.ComponentProps<typeof QueueItem> & { performer: Performer }) {
  const dragControls = useDragControls()
  return (
    <Reorder.Item
      value={props.performer}
      dragListener={false}
      dragControls={dragControls}
      className="list-none"
    >
      <QueueItem {...props} dragControls={dragControls} />
    </Reorder.Item>
  )
}

export default function TalentAdminPanel() {
  const [rooms, setRooms] = useState<(Room & { performers?: Performer[] })[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [performers, setPerformers] = useState<Performer[]>([])
  const [voteCounts, setVoteCounts] = useState<VoteCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newName, setNewName] = useState('')
  const [newAct, setNewAct] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editAct, setEditAct] = useState('')

  const selectedRoom = rooms.find(r => r.id === selectedRoomId)
  const currentPerformer = performers.find(p => p.id === selectedRoom?.current_performer_id)

  const upNext = useMemo(
    () => performers.filter(p => !p.performed && p.id !== selectedRoom?.current_performer_id).sort((a, b) => a.display_order - b.display_order),
    [performers, selectedRoom?.current_performer_id]
  )
  const done = useMemo(
    () => performers.filter(p => p.performed),
    [performers]
  )

  const fetchRooms = useCallback(async () => {
    const res = await fetch('/api/talent_show/rooms')
    if (res.ok) {
      const data = await res.json()
      setRooms(data)
      if (data.length > 0 && !selectedRoomId) {
        setSelectedRoomId(data[0].id)
      }
    }
    setLoading(false)
  }, [selectedRoomId])

  const fetchPerformers = useCallback(async () => {
    if (!selectedRoomId) return
    const res = await fetch(`/api/talent_show/performers?room_id=${selectedRoomId}`)
    if (res.ok) setPerformers(await res.json())
  }, [selectedRoomId])

  const fetchVotes = useCallback(async () => {
    if (!selectedRoomId) return
    const res = await fetch(`/api/talent_show/rooms/${selectedRoomId}/votes`)
    if (res.ok) setVoteCounts(await res.json())
  }, [selectedRoomId])

  useEffect(() => { fetchRooms() }, [fetchRooms])
  useEffect(() => { fetchPerformers(); fetchVotes() }, [selectedRoomId, fetchPerformers, fetchVotes])

  // Realtime votes
  useEffect(() => {
    if (!selectedRoomId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`admin-votes-${selectedRoomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'talent_show',
        table: 'votes',
      }, () => fetchVotes())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selectedRoomId, fetchVotes])

  // Realtime room status changes
  useEffect(() => {
    if (!selectedRoomId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`admin-room-${selectedRoomId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'talent_show',
        table: 'rooms',
        filter: `id=eq.${selectedRoomId}`,
      }, (payload) => {
        const updated = payload.new as Room
        setRooms(prev => prev.map(r =>
          r.id === updated.id ? { ...r, status: updated.status, current_performer_id: updated.current_performer_id } : r
        ))
        // Refetch performers to get updated `performed` flags
        fetchPerformers()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selectedRoomId, fetchPerformers])

  // --- Actions ---
  const createRoom = async () => {
    setError(null)
    const res = await fetch('/api/talent_show/rooms', { method: 'POST' })
    if (res.ok) {
      const room = await res.json()
      setRooms(prev => [room, ...prev])
      setSelectedRoomId(room.id)
    } else {
      setError((await res.json()).error)
    }
  }

  const addPerformer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !selectedRoomId) return
    setError(null)
    const res = await fetch('/api/talent_show/performers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_id: selectedRoomId,
        name: newName.trim(),
        act_description: newAct.trim() || null,
        display_order: performers.length,
      }),
    })
    if (res.ok) { setNewName(''); setNewAct(''); fetchPerformers() }
    else setError((await res.json()).error)
  }

  const updatePerformer = async (id: string) => {
    const res = await fetch('/api/talent_show/performers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: editName.trim(), act_description: editAct.trim() || null }),
    })
    if (res.ok) { setEditingId(null); fetchPerformers() }
  }

  const deletePerformer = async (id: string) => {
    const res = await fetch(`/api/talent_show/performers?id=${id}`, { method: 'DELETE' })
    if (res.ok) fetchPerformers()
  }

  const setPerformed = async (id: string, performed: boolean) => {
    const res = await fetch('/api/talent_show/performers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, performed }),
    })
    if (res.ok) fetchPerformers()
  }

  const handleReorder = async (newOrder: Performer[]) => {
    // Optimistic update
    setPerformers(prev => {
      const playing = prev.filter(p => p.id === selectedRoom?.current_performer_id)
      const doneList = prev.filter(p => p.performed)
      return [...playing, ...newOrder, ...doneList]
    })

    // Send bulk reorder
    await fetch('/api/talent_show/performers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reorder: newOrder.map((p, i) => ({ id: p.id, display_order: i })),
      }),
    })
  }

  const changeStatus = async (status: RoomStatus) => {
    if (!selectedRoomId) return
    setError(null)
    const res = await fetch(`/api/talent_show/rooms/${selectedRoomId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const updated = await res.json()
      setRooms(prev => prev.map(r =>
        r.id === updated.id
          ? { ...r, status: updated.status, current_performer_id: updated.current_performer_id }
          : r
      ))
    } else setError((await res.json()).error)
  }

  const handleNext = async () => {
    if (!selectedRoomId) return
    setError(null)
    const res = await fetch(`/api/talent_show/rooms/${selectedRoomId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'next' }),
    })
    if (res.ok) {
      const updated = await res.json()
      setRooms(prev => prev.map(r =>
        r.id === updated.id
          ? { ...r, status: updated.status, current_performer_id: updated.current_performer_id }
          : r
      ))
      fetchPerformers()
    } else setError((await res.json()).error)
  }

  const getVoteCount = (performerId: string) =>
    voteCounts.find(v => v.performer_id === performerId) || { performer_id: performerId, yes_count: 0, no_count: 0, total: 0 }

  // --- Render ---
  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-slate-500">A carregar...</div>

  if (rooms.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🎤</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">ESN Talent Show</h1>
        <p className="text-slate-500 mb-8">Cria uma sala para começar a gerir o evento.</p>
        <button onClick={createRoom} className="px-6 py-3 bg-[var(--primary)] text-white rounded-2xl font-semibold text-lg hover:opacity-90 transition-opacity">
          Criar Sala
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Talent Show</h1>
        <div className="flex items-center gap-3">
          {rooms.length > 1 && (
            <select
              value={selectedRoomId || ''}
              onChange={e => setSelectedRoomId(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
            >
              {rooms.map(r => (
                <option key={r.id} value={r.id}>Sala {r.pin}</option>
              ))}
            </select>
          )}
          <button onClick={createRoom} className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:opacity-90">
            + Nova Sala
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>
      )}

      {selectedRoom && (
        <div className="space-y-4">

          {/* PIN + Status Bar */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <QRCodeSVG
                  value={`${window.location.origin}/play?pin=${selectedRoom.pin}`}
                  size={80}
                  level="M"
                  className="rounded-lg flex-shrink-0"
                />
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">PIN da Sala</div>
                  <div className="text-4xl font-black tracking-[0.2em] text-slate-900">{selectedRoom.pin}</div>
                </div>
                <div className="h-12 w-px bg-slate-200" />
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">Estado</div>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full font-semibold text-sm ${STATUS_COLORS[selectedRoom.status]}`}>
                    {STATUS_LABELS[selectedRoom.status]}
                  </span>
                </div>
                {currentPerformer && (
                  <>
                    <div className="h-12 w-px bg-slate-200" />
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide">No Palco</div>
                      <div className="text-lg font-bold text-slate-900 mt-0.5">{currentPerformer.name}</div>
                    </div>
                  </>
                )}
              </div>
              <div className="text-xs text-slate-400">
                Telão: <span className="font-mono text-slate-600">/screen/{selectedRoom.pin}</span>
              </div>
            </div>
          </div>

          {/* Player Control Bar */}
          <div className="bg-slate-900 p-5 rounded-2xl text-white">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-3">Controle do Palco</div>

            {selectedRoom.status === 'waiting' && (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  {upNext.length > 0 ? (
                    <p className="text-slate-300 text-sm">
                      Próximo: <strong>{upNext[0].name}</strong>
                      {upNext[0].act_description && <span className="text-slate-500 ml-1">— {upNext[0].act_description}</span>}
                      {upNext.length > 1 && <span className="text-slate-500 ml-2">(+{upNext.length - 1} na fila)</span>}
                    </p>
                  ) : done.length > 0 ? (
                    <p className="text-green-400 text-sm font-semibold">Show completo! Todos os artistas já se apresentaram.</p>
                  ) : (
                    <p className="text-slate-500 text-sm">Adiciona artistas na fila abaixo primeiro.</p>
                  )}
                </div>
                <button
                  onClick={handleNext}
                  disabled={upNext.length === 0}
                  className="px-6 py-3 bg-[var(--primary)] hover:opacity-90 disabled:opacity-40 text-white rounded-xl font-bold text-lg transition-opacity whitespace-nowrap"
                >
                  {done.length === 0 ? 'Começar Show' : 'Próximo Artista'}
                </button>
              </div>
            )}

            {selectedRoom.status === 'intro' && (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-slate-300 text-sm">
                    <strong>{currentPerformer?.name}</strong> está no palco. Quando estiver pronto:
                  </p>
                </div>
                <button
                  onClick={() => changeStatus('voting')}
                  className="px-6 py-3 bg-green-500 hover:bg-green-400 text-white rounded-xl font-bold text-lg transition-colors whitespace-nowrap"
                >
                  Abrir Votação
                </button>
              </div>
            )}

            {selectedRoom.status === 'voting' && (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-slate-300 text-sm">Votação aberta para <strong>{currentPerformer?.name}</strong>!</p>
                  {(() => {
                    const v = currentPerformer ? getVoteCount(currentPerformer.id) : null
                    if (!v || v.total === 0) return <p className="text-slate-500 text-xs mt-1">Aguardando votos...</p>
                    const pct = Math.round((v.yes_count / v.total) * 100)
                    return (
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-mono">{v.yes_count}S / {v.no_count}N ({v.total})</span>
                      </div>
                    )
                  })()}
                </div>
                <button
                  onClick={() => changeStatus('closed')}
                  className="px-6 py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl font-bold text-lg transition-colors whitespace-nowrap"
                >
                  Fechar Votação
                </button>
              </div>
            )}

            {selectedRoom.status === 'closed' && (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-slate-300 text-sm">Votação encerrada para <strong>{currentPerformer?.name}</strong>.</p>
                  {(() => {
                    const v = currentPerformer ? getVoteCount(currentPerformer.id) : null
                    if (!v || v.total === 0) return null
                    const pct = Math.round((v.yes_count / v.total) * 100)
                    return (
                      <p className="text-sm mt-1">
                        <span className={pct >= 50 ? 'text-green-400' : 'text-red-400'}>
                          {pct}% SIM
                        </span>
                        <span className="text-slate-500 ml-2">({v.yes_count}S / {v.no_count}N — {v.total} votos)</span>
                      </p>
                    )
                  })()}
                </div>
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-[var(--primary)] hover:opacity-90 text-white rounded-xl font-bold text-lg transition-opacity whitespace-nowrap"
                >
                  {upNext.length > 0 ? 'Próximo Artista' : 'Finalizar Show'}
                </button>
              </div>
            )}
          </div>

          {/* Two columns: Queue + Results */}
          <div className="grid gap-4 lg:grid-cols-2">

            {/* Queue */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Fila de Artistas</h2>

              <form onSubmit={addPerformer} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Nome"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Ato (opcional)"
                  value={newAct}
                  onChange={e => setNewAct(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
                <button type="submit" className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:opacity-90">
                  +
                </button>
              </form>

              <div className="space-y-1.5">
                {performers.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-6">Nenhum artista adicionado</p>
                )}

                {/* Now Playing */}
                {currentPerformer && (
                  <QueueItem
                    performer={currentPerformer}
                    zone="playing"
                    isEditing={editingId === currentPerformer.id}
                    editName={editName}
                    editAct={editAct}
                    voteCount={getVoteCount(currentPerformer.id)}
                    onEdit={() => { setEditingId(currentPerformer.id); setEditName(currentPerformer.name); setEditAct(currentPerformer.act_description || '') }}
                    onEditNameChange={setEditName}
                    onEditActChange={setEditAct}
                    onSave={() => updatePerformer(currentPerformer.id)}
                    onCancelEdit={() => setEditingId(null)}
                    onDelete={() => deletePerformer(currentPerformer.id)}
                    onSkip={() => {}}
                    onReset={() => {}}
                  />
                )}

                {/* Up Next — draggable */}
                {upNext.length > 0 && (
                  <>
                    {(currentPerformer || done.length > 0) && (
                      <div className="text-xs text-slate-400 uppercase tracking-wide pt-2 pb-1">A seguir</div>
                    )}
                    <Reorder.Group axis="y" values={upNext} onReorder={handleReorder} className="space-y-1.5">
                      {upNext.map(p => (
                        <DraggableQueueItem
                          key={p.id}
                          performer={p}
                          zone="next"
                          isEditing={editingId === p.id}
                          editName={editName}
                          editAct={editAct}
                          voteCount={getVoteCount(p.id)}
                          onEdit={() => { setEditingId(p.id); setEditName(p.name); setEditAct(p.act_description || '') }}
                          onEditNameChange={setEditName}
                          onEditActChange={setEditAct}
                          onSave={() => updatePerformer(p.id)}
                          onCancelEdit={() => setEditingId(null)}
                          onDelete={() => deletePerformer(p.id)}
                          onSkip={() => setPerformed(p.id, true)}
                          onReset={() => {}}
                        />
                      ))}
                    </Reorder.Group>
                  </>
                )}

                {/* Already Performed */}
                {done.length > 0 && (
                  <>
                    <div className="text-xs text-slate-400 uppercase tracking-wide pt-2 pb-1">Já se apresentaram</div>
                    {done.map(p => (
                      <QueueItem
                        key={p.id}
                        performer={p}
                        zone="done"
                        isEditing={editingId === p.id}
                        editName={editName}
                        editAct={editAct}
                        voteCount={getVoteCount(p.id)}
                        onEdit={() => { setEditingId(p.id); setEditName(p.name); setEditAct(p.act_description || '') }}
                        onEditNameChange={setEditName}
                        onEditActChange={setEditAct}
                        onSave={() => updatePerformer(p.id)}
                        onCancelEdit={() => setEditingId(null)}
                        onDelete={() => deletePerformer(p.id)}
                        onSkip={() => {}}
                        onReset={() => setPerformed(p.id, false)}
                      />
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Vote Results */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Resultados</h2>
              {performers.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">Adiciona artistas para ver votos</p>
              ) : (
                <div className="space-y-3">
                  {[...performers]
                    .sort((a, b) => {
                      const va = getVoteCount(a.id)
                      const vb = getVoteCount(b.id)
                      const pctA = va.total > 0 ? va.yes_count / va.total : -1
                      const pctB = vb.total > 0 ? vb.yes_count / vb.total : -1
                      return pctB - pctA
                    })
                    .map(p => {
                      const v = getVoteCount(p.id)
                      const pct = v.total > 0 ? Math.round((v.yes_count / v.total) * 100) : 0
                      const isOnStage = selectedRoom.current_performer_id === p.id
                      return (
                        <div key={p.id} className={`p-3 rounded-xl ${isOnStage ? 'bg-[var(--primary)]/5 border border-[var(--primary)]/20' : 'bg-slate-50'}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-slate-900">{p.name}</span>
                            <span className="text-xs text-slate-400">{v.total} votos</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                            <span className={`text-sm font-bold w-12 text-right ${pct >= 50 ? 'text-green-600' : pct > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                              {v.total > 0 ? `${pct}%` : '--'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
