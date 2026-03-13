export interface ImageItem {
  id: string
  src: string       // BlobURL
  hash: string
  memo: string
  name: string      // 元ファイル名 or "page N"
}

export interface ImageSet {
  id: string
  name: string
  images: ImageItem[]
}

export interface FlashSession {
  images: ImageItem[]
  duration: number    // 秒
  currentIndex: number
  paused: boolean
}

// number は任意枚数指定、'ALL' は全枚
export type CardCount = number | 'ALL'
