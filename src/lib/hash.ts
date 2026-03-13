/**
 * ArrayBuffer を SHA-256 でハッシュ化して hex 文字列を返す
 */
export async function sha256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Blob を SHA-256 でハッシュ化して hex 文字列を返す
 */
export async function hashBlob(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer()
  return sha256(buffer)
}
