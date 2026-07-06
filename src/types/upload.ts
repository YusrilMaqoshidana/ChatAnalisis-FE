// types/upload.ts

export interface UploadResponse {
  success: boolean
  message: string
  analysisId?: string
}

export interface UploadState {
  file: File | null
  loading: boolean
  error: string | null
}
