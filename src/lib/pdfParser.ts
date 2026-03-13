import * as pdfjsLib from 'pdfjs-dist'

// pdf.js のワーカーを設定（CDN経由）
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

export interface ParsedPage {
  blob: Blob
  pageNumber: number
}

/**
 * PDF ファイルを各ページの画像 Blob に変換する
 */
export async function parsePDF(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<ParsedPage[]> {
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
  const pdf = await loadingTask.promise
  const total = pdf.numPages
  const pages: ParsedPage[] = []

  for (let i = 1; i <= total; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 2.0 })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height

    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport }).promise

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b)
          else reject(new Error('canvas.toBlob failed'))
        },
        'image/jpeg',
        0.92
      )
    })

    pages.push({ blob, pageNumber: i })
    onProgress?.(i, total)
  }

  return pages
}
