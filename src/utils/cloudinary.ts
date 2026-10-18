import type { UploadSignature } from "@/types"

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]

/**
 * Why a file can't be uploaded, or null when it's fine. `key` is a message
 * under `common.upload` (translate with `t(`upload.${key}`, { name })`).
 */
export function imageFileProblem(
  file: File
): { key: "wrongType" | "tooLarge"; name: string } | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { key: "wrongType", name: file.name }
  }
  if (file.size > MAX_UPLOAD_BYTES) return { key: "tooLarge", name: file.name }
  return null
}

/**
 * The messages `uploadToCloudinary` rejects with when Cloudinary gives no
 * reason of its own; callers map them to `common.upload.failed|network`.
 */
export const UPLOAD_ERROR = {
  failed: "Upload failed",
  network: "Upload failed — check your connection",
} as const

/**
 * Uploads straight from the browser to Cloudinary with a server-made
 * signature, reporting progress (0–1). Resolves to the image's https URL.
 */
export function uploadToCloudinary(
  file: File,
  signature: UploadSignature,
  onProgress?: (fraction: number) => void
) {
  return new Promise<string>((resolve, reject) => {
    const form = new FormData()
    form.append("file", file)
    form.append("api_key", signature.apiKey)
    form.append("timestamp", String(signature.timestamp))
    form.append("folder", signature.folder)
    form.append("signature", signature.signature)

    const request = new XMLHttpRequest()
    request.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`
    )
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total)
    }
    request.onload = () => {
      try {
        const body = JSON.parse(request.responseText)
        if (request.status >= 200 && request.status < 300 && body.secure_url) {
          resolve(body.secure_url as string)
        } else {
          reject(new Error(body.error?.message ?? UPLOAD_ERROR.failed))
        }
      } catch {
        reject(new Error(UPLOAD_ERROR.failed))
      }
    }
    request.onerror = () => reject(new Error(UPLOAD_ERROR.network))
    request.send(form)
  })
}

/**
 * A resized, auto-format Cloudinary URL (f_auto,q_auto,w_…) for thumbnails.
 * Other hosts are returned unchanged.
 */
export function cloudinaryThumb(url: string, width: number) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url
  }
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`)
}
