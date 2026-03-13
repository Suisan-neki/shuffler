import { supabase } from './supabase'

export async function upsertMemoToCloud(hash: string, memo: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('memos').upsert(
    { user_id: user.id, hash, memo, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,hash' }
  )
}

export async function fetchMemosFromCloud(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from('memos').select('hash, memo')
  if (error || !data) return {}
  const map: Record<string, string> = {}
  for (const r of data) map[r.hash] = r.memo
  return map
}
