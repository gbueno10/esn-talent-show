import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isProjectAdmin } from '@/lib/auth/permissions'

export async function GET(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const roomId = searchParams.get('room_id')

  if (!roomId) {
    return NextResponse.json({ error: 'room_id is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('performers')
    .select('*')
    .eq('room_id', roomId)
    .order('display_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = await isProjectAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  if (!body.room_id || !body.name) {
    return NextResponse.json({ error: 'room_id and name are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('performers')
    .insert({
      room_id: body.room_id,
      name: body.name,
      act_description: body.act_description || null,
      display_order: body.display_order ?? 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function PUT(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = await isProjectAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  if (!body.id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (body.name !== undefined) updates.name = body.name
  if (body.act_description !== undefined) updates.act_description = body.act_description
  if (body.display_order !== undefined) updates.display_order = body.display_order
  if (body.performed !== undefined) updates.performed = body.performed

  const { data, error } = await supabase
    .from('performers')
    .update(updates)
    .eq('id', body.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = await isProjectAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  if (!Array.isArray(body.reorder) || body.reorder.length === 0) {
    return NextResponse.json({ error: 'reorder array is required' }, { status: 400 })
  }

  const errors: string[] = []
  for (const item of body.reorder) {
    if (!item.id || typeof item.display_order !== 'number') {
      errors.push(`Invalid item: ${JSON.stringify(item)}`)
      continue
    }
    const { error } = await supabase
      .from('performers')
      .update({ display_order: item.display_order })
      .eq('id', item.id)

    if (error) {
      errors.push(`Failed to update ${item.id}: ${error.message}`)
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join('; ') }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = await isProjectAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('performers')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
