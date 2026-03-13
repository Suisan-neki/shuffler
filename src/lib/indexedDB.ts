/**
 * IndexedDB スキーマ
 *
 * memos    : { hash: string, memo: string }
 * images   : { id: string, hash: string, name: string, setId: string, blob: Blob, order: number }
 * imageSets: { id: string, name: string }
 */

const DB_NAME = 'flashcard-db'
const DB_VERSION = 2   // memos のみ(v1) → images / imageSets 追加(v2)

let db: IDBDatabase | null = null

function openDB(): Promise<IDBDatabase> {
  if (db) return Promise.resolve(db)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      if (!database.objectStoreNames.contains('memos')) {
        database.createObjectStore('memos', { keyPath: 'hash' })
      }
      if (!database.objectStoreNames.contains('images')) {
        const imgStore = database.createObjectStore('images', { keyPath: 'id' })
        imgStore.createIndex('setId', 'setId', { unique: false })
      }
      if (!database.objectStoreNames.contains('imageSets')) {
        database.createObjectStore('imageSets', { keyPath: 'id' })
      }
    }

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result
      resolve(db)
    }

    request.onerror = () => reject(request.error)
  })
}

// ────────── helpers ──────────────────────────────────────────────────────────

function put<T>(storeName: string, value: T): Promise<void> {
  return openDB().then(
    (database) =>
      new Promise((resolve, reject) => {
        const tx = database.transaction(storeName, 'readwrite')
        const req = tx.objectStore(storeName).put(value)
        req.onsuccess = () => resolve()
        req.onerror = () => reject(req.error)
      })
  )
}

function getAll<T>(storeName: string): Promise<T[]> {
  return openDB().then(
    (database) =>
      new Promise((resolve, reject) => {
        const tx = database.transaction(storeName, 'readonly')
        const req = tx.objectStore(storeName).getAll()
        req.onsuccess = () => resolve(req.result as T[])
        req.onerror = () => reject(req.error)
      })
  )
}

function deleteRecord(storeName: string, key: string): Promise<void> {
  return openDB().then(
    (database) =>
      new Promise((resolve, reject) => {
        const tx = database.transaction(storeName, 'readwrite')
        const req = tx.objectStore(storeName).delete(key)
        req.onsuccess = () => resolve()
        req.onerror = () => reject(req.error)
      })
  )
}

// ────────── メモ ─────────────────────────────────────────────────────────────

export async function saveMemo(hash: string, memo: string): Promise<void> {
  return put('memos', { hash, memo })
}

export async function getMemo(hash: string): Promise<string> {
  const database = await openDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction('memos', 'readonly')
    const req = tx.objectStore('memos').get(hash)
    req.onsuccess = () => {
      resolve((req.result as { hash: string; memo: string } | undefined)?.memo ?? '')
    }
    req.onerror = () => reject(req.error)
  })
}

// ────────── 画像セット ────────────────────────────────────────────────────────

export interface StoredImageSet {
  id: string
  name: string
}

export async function saveImageSet(set: StoredImageSet): Promise<void> {
  return put('imageSets', set)
}

export async function loadAllImageSets(): Promise<StoredImageSet[]> {
  return getAll<StoredImageSet>('imageSets')
}

export async function deleteImageSet(id: string): Promise<void> {
  return deleteRecord('imageSets', id)
}

// ────────── 画像 ─────────────────────────────────────────────────────────────

export interface StoredImage {
  id: string
  hash: string
  name: string
  setId: string
  blob: Blob
  order: number   // グリッド表示順を保持
}

export async function saveImage(img: StoredImage): Promise<void> {
  return put('images', img)
}

export async function loadAllImages(): Promise<StoredImage[]> {
  const all = await getAll<StoredImage>('images')
  return all.sort((a, b) => a.order - b.order)
}

export async function deleteImageRecord(id: string): Promise<void> {
  return deleteRecord('images', id)
}

export async function getAllMemos(): Promise<Record<string, string>> {
  const all = await getAll<{ hash: string; memo: string }>('memos')
  const map: Record<string, string> = {}
  for (const r of all) map[r.hash] = r.memo
  return map
}
