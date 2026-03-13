import { create } from 'zustand'
import type { ImageItem, ImageSet, CardCount } from '../types'
import {
  saveMemo,
  saveImage,
  saveImageSet,
  loadAllImages,
  loadAllImageSets,
  getAllMemos,
  deleteImageRecord,
  deleteImageSet,
} from '../lib/indexedDB'
import { shuffle } from '../lib/shuffle'

interface FlashStore {
  imageSets: ImageSet[]
  activeSetId: string | null
  hydrated: boolean           // IndexedDB からの復元が完了したか

  selectionMode: boolean
  selectedIds: Set<string>

  memoPanelOpen: boolean
  memoPanelImageId: string | null

  flashDuration: number
  flashCardCount: CardCount
  repeatMode: boolean

  sessionImages: ImageItem[]
  currentIndex: number
  paused: boolean

  // --- actions ---
  hydrate: () => Promise<void>           // 起動時に IndexedDB から復元
  addImageSet: (set: ImageSet, blobs: Map<string, Blob>) => void
  setActiveSet: (id: string) => void
  updateMemo: (imageId: string, memo: string) => void
  deleteImages: (ids: string[]) => void

  enterSelectionMode: () => void
  exitSelectionMode: () => void
  toggleSelect: (id: string) => void
  selectAll: () => void
  deselectAll: () => void

  toggleMemoPanel: () => void
  openMemoPanel: (imageId: string) => void
  closeMemoPanel: () => void

  setFlashDuration: (duration: number) => void
  setFlashCardCount: (count: CardCount) => void
  setRepeatMode: (v: boolean) => void

  startSession: (images: ImageItem[]) => void
  nextCard: () => void
  prevCard: () => void
  togglePause: () => void
  endSession: () => void
}

export const useFlashStore = create<FlashStore>((set, get) => ({
  imageSets: [],
  activeSetId: null,
  hydrated: false,
  selectionMode: false,
  selectedIds: new Set(),
  memoPanelOpen: false,
  memoPanelImageId: null,
  flashDuration: 10,
  flashCardCount: 20,
  repeatMode: false,
  sessionImages: [],
  currentIndex: 0,
  paused: false,

  // ── 起動時復元 ──────────────────────────────────────────────────────────
  hydrate: async () => {
    const [storedSets, storedImages, memos] = await Promise.all([
      loadAllImageSets(),
      loadAllImages(),
      getAllMemos(),
    ])

    // Blob → BlobURL を再生成
    const sets: ImageSet[] = storedSets.map((s) => ({
      id: s.id,
      name: s.name,
      images: storedImages
        .filter((img) => img.setId === s.id)
        .map((img) => ({
          id: img.id,
          src: URL.createObjectURL(img.blob),
          hash: img.hash,
          memo: memos[img.hash] ?? '',
          name: img.name,
        })),
    }))

    set({
      imageSets: sets,
      activeSetId: sets.length > 0 ? sets[sets.length - 1].id : null,
      hydrated: true,
    })
  },

  // ── 画像セット追加 ──────────────────────────────────────────────────────
  addImageSet: (imageSet, blobs) => {
    set((state) => ({
      imageSets: [...state.imageSets, imageSet],
      activeSetId: imageSet.id,
    }))

    // IndexedDB に永続化（非同期・バックグラウンド）
    saveImageSet({ id: imageSet.id, name: imageSet.name }).catch(console.error)

    imageSet.images.forEach((img, order) => {
      const blob = blobs.get(img.id)
      if (!blob) return
      saveImage({
        id: img.id,
        hash: img.hash,
        name: img.name,
        setId: imageSet.id,
        blob,
        order,
      }).catch(console.error)
    })
  },

  setActiveSet: (id) => set({ activeSetId: id }),

  updateMemo: (imageId, memo) => {
    set((state) => ({
      imageSets: state.imageSets.map((s) => ({
        ...s,
        images: s.images.map((img) =>
          img.id === imageId ? { ...img, memo } : img
        ),
      })),
      sessionImages: state.sessionImages.map((img) =>
        img.id === imageId ? { ...img, memo } : img
      ),
    }))
    const allImages = get().imageSets.flatMap((s) => s.images)
    const target = allImages.find((img) => img.id === imageId)
    if (target) saveMemo(target.hash, memo).catch(console.error)
  },

  deleteImages: (ids) => {
    const idSet = new Set(ids)

    set((state) => {
      const nextSets = state.imageSets.map((s) => ({
        ...s,
        images: s.images.filter((img) => !idSet.has(img.id)),
      }))
      return { imageSets: nextSets, selectionMode: false, selectedIds: new Set() }
    })

    // IndexedDB からも削除し、空になったセットも削除
    ids.forEach((id) => deleteImageRecord(id).catch(console.error))

    // セットが空になったら ImageSet レコードも削除
    const sets = get().imageSets
    sets.forEach((s) => {
      if (s.images.length === 0) {
        deleteImageSet(s.id).catch(console.error)
      }
    })
  },

  enterSelectionMode: () => set({ selectionMode: true }),
  exitSelectionMode: () => set({ selectionMode: false, selectedIds: new Set() }),

  toggleSelect: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { selectedIds: next }
    }),

  selectAll: () => {
    const { imageSets, activeSetId } = get()
    const active = imageSets.find((s) => s.id === activeSetId)
    if (!active) return
    set({ selectedIds: new Set(active.images.map((img) => img.id)) })
  },

  deselectAll: () => set({ selectedIds: new Set() }),

  toggleMemoPanel: () => set((s) => ({ memoPanelOpen: !s.memoPanelOpen })),
  openMemoPanel: (imageId) => set({ memoPanelOpen: true, memoPanelImageId: imageId }),
  closeMemoPanel: () => set({ memoPanelOpen: false, memoPanelImageId: null }),

  setFlashDuration: (duration) => set({ flashDuration: duration }),
  setFlashCardCount: (count) => set({ flashCardCount: count }),
  setRepeatMode: (v) => set({ repeatMode: v }),

  startSession: (images) => {
    const { flashCardCount, repeatMode } = get()
    const count = flashCardCount === 'ALL' ? images.length : flashCardCount

    let result: ImageItem[]
    if (repeatMode) {
      result = Array.from({ length: count }, () =>
        images[Math.floor(Math.random() * images.length)]
      )
    } else {
      const shuffled = shuffle(images)
      result = flashCardCount === 'ALL' ? shuffled : shuffled.slice(0, count)
    }

    set({ sessionImages: result, currentIndex: 0, paused: false })
  },

  nextCard: () =>
    set((state) => ({
      currentIndex:
        state.currentIndex < state.sessionImages.length - 1
          ? state.currentIndex + 1
          : state.currentIndex,
    })),

  prevCard: () =>
    set((state) => ({
      currentIndex: state.currentIndex > 0 ? state.currentIndex - 1 : 0,
    })),

  togglePause: () => set((state) => ({ paused: !state.paused })),

  endSession: () => set({ sessionImages: [], currentIndex: 0, paused: false }),
}))
