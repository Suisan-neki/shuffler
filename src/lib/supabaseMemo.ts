import { supabase } from './supabase'

export interface CloudMemoRecord {
  memo: string
  bookmarked: boolean
}

export async function upsertMemoToCloud(hash: string, memo: string, bookmarked: boolean = false): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('memos').upsert(
    { user_id: user.id, hash, memo, bookmarked, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,hash' }
  )
}

export async function fetchMemosFromCloud(): Promise<Record<string, CloudMemoRecord>> {
  const { data, error } = await supabase.from('memos').select('hash, memo, bookmarked')
  if (error || !data) return {}
  const map: Record<string, CloudMemoRecord> = {}
  for (const r of data) map[r.hash] = { memo: r.memo, bookmarked: r.bookmarked ?? false }
  return map
}
