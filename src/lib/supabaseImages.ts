import { supabase } from './supabase'

export interface CloudImageMeta {
  id: string
  hash: string
  name: string
  setId: string
  setName: string
  order: number
}

export async function uploadImageToCloud(userId: string, hash: string, blob: Blob): Promise<void> {
  const path = `${userId}/${hash}`
  const { error } = await supabase.storage.from('slides').upload(path, blob, {
    contentType: blob.type || 'image/webp',
    upsert: false,
  })
  if (error && !error.message.includes('already exists') && !error.message.includes('The resource already exists')) {
    console.error('uploadImageToCloud:', error.message)
  }
}

export async function saveImageMetadataToCloud(userId: string, meta: CloudImageMeta): Promise<void> {
  await supabase.from('image_metadata').upsert(
    {
      user_id: userId,
      id: meta.id,
      hash: meta.hash,
      name: meta.name,
      set_id: meta.setId,
      set_name: meta.setName,
      order_index: meta.order,
    },
    { onConflict: 'user_id,id' }
  )
}

export async function fetchImageMetadataFromCloud(): Promise<CloudImageMeta[]> {
  const { data, error } = await supabase
    .from('image_metadata')
    .select('id, hash, name, set_id, set_name, order_index')
    .order('order_index')
  if (error || !data) return []
  return data.map((r) => ({
    id: r.id,
    hash: r.hash,
    name: r.name,
    setId: r.set_id,
    setName: r.set_name,
    order: r.order_index,
  }))
}

export async function downloadImageFromCloud(userId: string, hash: string): Promise<Blob | null> {
  const { data, error } = await supabase.storage.from('slides').download(`${userId}/${hash}`)
  if (error || !data) return null
  return data
}
