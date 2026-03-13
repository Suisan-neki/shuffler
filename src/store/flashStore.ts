import { create } from 'zustand'
import type { ImageItem, ImageSet, CardCount } from '../types'
import {
  saveMemo,
  saveBookmark,
  saveImage,
  saveImageSet,
  loadAllImages,
  loadAllImageSets,
  getAllMemos,
  getAllBookmarks,
  deleteImageRecord,
  deleteImageSet,
} from '../lib/indexedDB'
import { shuffle } from '../lib/shuffle'
import { upsertMemoToCloud, fetchMemosFromCloud } from '../lib/supabaseMemo'

interface FlashStore {
  imageSets: ImageSet[]
  activeSetId: string | null
  hydrated: boolean

  selectionMode: boolean
  selectedIds: Set<string>

  memoPanelOpen: boolean
  homeMemoImageId: string | null

  flashDuration: number
  flashCardCount: CardCount
  repeatMode: boolean

  sessionImages: ImageItem[]
  currentIndex: number
  paused: boolean

  // --- actions ---
  hydrate: () => Promise<void>
  addImageSet: (set: ImageSet, blobs: Map<string, Blob>) => void
  setActiveSet: (id: string) => void
  updateMemo: (imageId: string, memo: string) => void
  toggleBookmark: (imageId: string) => void
  deleteImages: (ids: string[]) => void

  enterSelectionMode: () => void
  exitSelectionMode: () => void
  toggleSelect: (id: string) => void
  selectAll: () => void
  deselectAll: () => void

  openMemoPanel: (imageId: string) => void
  closeMemoPanel: () => void
  toggleMemoPanel: () => void
  syncMemosFromCloud: () => Promise<void>

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
  homeMemoImageId: null,
  flashDuration: 10,
  flashCardCount: 20,
  repeatMode: false,
  sessionImages: [],
  currentIndex: 0,
  paused: false,

  hydrate: async () => {
    const [storedSets, storedImages, memos, bookmarks] = await Promise.all([
      loadAllImageSets(),
      loadAllImages(),
      getAllMemos(),
      getAllBookmarks(),
    ])

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
          bookmarked: bookmarks.has(img.hash),
          name: img.name,
        })),
    }))

    set({
      imageSets: sets,
      activeSetId: sets.length > 0 ? sets[sets.length - 1].id : null,
      hydrated: true,
    })
  },

  addImageSet: (imageSet, blobs) => {
    set((state) => ({
      imageSets: [...state.imageSets, imageSet],
      activeSetId: imageSet.id,
    }))

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
    const target = get().imageSets.flatMap((s) => s.images).find((img) => img.id === imageId)
    if (target) {
      saveMemo(target.hash, memo).catch(console.error)
      upsertMemoToCloud(target.hash, memo, target.bookmarked).catch(console.error)
    }
  },

  toggleBookmark: (imageId) => {
    const target = get().imageSets.flatMap((s) => s.images).find((img) => img.id === imageId)
      ?? get().sessionImages.find((img) => img.id === imageId)
    if (!target) return
    const newBookmarked = !target.bookmarked

    set((state) => ({
      imageSets: state.imageSets.map((s) => ({
        ...s,
        images: s.images.map((img) =>
          img.id === imageId ? { ...img, bookmarked: newBookmarked } : img
        ),
      })),
      sessionImages: state.sessionImages.map((img) =>
        img.id === imageId ? { ...img, bookmarked: newBookmarked } : img
      ),
    }))

    saveBookmark(target.hash, newBookmarked).catch(console.error)
    upsertMemoToCloud(target.hash, target.memo, newBookmarked).catch(console.error)
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

    ids.forEach((id) => deleteImageRecord(id).catch(console.error))

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

  openMemoPanel: (imageId) => set({ homeMemoImageId: imageId }),
  closeMemoPanel: () => set({ homeMemoImageId: null }),
  toggleMemoPanel: () => set((s) => ({ memoPanelOpen: !s.memoPanelOpen })),

  syncMemosFromCloud: async () => {
    const cloudRecords = await fetchMemosFromCloud()
    if (Object.keys(cloudRecords).length === 0) return

    set((state) => ({
      imageSets: state.imageSets.map((s) => ({
        ...s,
        images: s.images.map((img) =>
          cloudRecords[img.hash] !== undefined
            ? { ...img, memo: cloudRecords[img.hash].memo, bookmarked: cloudRecords[img.hash].bookmarked }
            : img
        ),
      })),
      sessionImages: state.sessionImages.map((img) =>
        cloudRecords[img.hash] !== undefined
          ? { ...img, memo: cloudRecords[img.hash].memo, bookmarked: cloudRecords[img.hash].bookmarked }
          : img
      ),
    }))

    for (const [hash, record] of Object.entries(cloudRecords)) {
      await saveMemo(hash, record.memo)
      await saveBookmark(hash, record.bookmarked)
    }
  },

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
