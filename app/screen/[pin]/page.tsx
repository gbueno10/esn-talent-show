import { createClient } from '@/lib/supabase/server'
import HostScreen from './components/HostScreen'
import type { RoomWithPerformers } from '@/types/talent-show'

export const metadata = {
  title: 'ESN Talent Show - Live Screen',
}

export default async function ScreenPage({
  params,
}: {
  params: Promise<{ pin: string }>
}) {
  const { pin } = await params
  const supabase = await createClient()

  const { data: room } = await supabase
    .from('rooms')
    .select('*')
    .eq('pin', pin)
    .single()

  if (!room) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Room Not Found</h1>
          <p className="text-gray-400">PIN: {pin}</p>
        </div>
      </div>
    )
  }

  const { data: performers } = await supabase
    .from('performers')
    .select('id, name, act_description, display_order')
    .eq('room_id', room.id)
    .order('display_order')

  const roomData: RoomWithPerformers = {
    ...room,
    performers: performers || [],
  }

  return <HostScreen initialRoom={roomData} />
}
