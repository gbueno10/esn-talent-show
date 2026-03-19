export type RoomStatus = 'waiting' | 'intro' | 'voting' | 'closed'

export interface Room {
  id: string
  pin: string
  status: RoomStatus
  current_performer_id: string | null
  created_by: string
  created_at: string
}

export interface Performer {
  id: string
  room_id: string
  name: string
  act_description: string | null
  display_order: number
  performed: boolean
  created_at: string
}

export interface Vote {
  id: string
  performer_id: string
  user_id: string
  vote: boolean
  created_at: string
}

export interface VoteCount {
  performer_id: string
  yes_count: number
  no_count: number
  total: number
}

export interface RoomWithPerformers extends Room {
  performers: Performer[]
}
