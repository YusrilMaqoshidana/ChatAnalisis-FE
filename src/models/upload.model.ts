// src/models/upload.model.ts
// ─── MVI: Model (State Shape) for Upload Feature ────────────────────────────
// The Model defines the complete, immutable-by-convention state shape.
// It is the single source of truth managed by the Pinia store.

import type { DailyActivity, AnalysisStep } from '@/types/upload'
import type { ParsedMessage } from '@/types/chat'

/**
 * UploadModel: Complete state shape for the upload wizard feature.
 * This represents the "M" in MVI — the application's data layer for upload.
 */
export interface UploadModel {
  // File state
  selectedFile: File | null
  uploadError: string | null
  uploadErrorDetail: string | null
  parsedCSVString: string
  rawMessages: ParsedMessage[]
  dailyActivity: DailyActivity | null

  // Wizard navigation state
  currentStep: 1 | 2 | 3
  isAnalyzing: boolean
  isParsing: boolean

  // Date range filter state (percentages 0-100)
  rangeValues: [number, number]

  // Analysis progress state
  activeStepIdx: number
  activeTimeoutId: number | null
  analysisSteps: AnalysisStep[]
}

/**
 * Initial state factory — always returns a fresh, default UploadModel.
 * Used to initialize the store and reset on clear.
 */
export function createInitialUploadModel(): UploadModel {
  return {
    selectedFile: null,
    uploadError: null,
    uploadErrorDetail: null,
    parsedCSVString: '',
    rawMessages: [],
    dailyActivity: null,
    currentStep: 1,
    isAnalyzing: false,
    isParsing: false,
    rangeValues: [0, 100],
    activeStepIdx: -1,
    activeTimeoutId: null,
    analysisSteps: [
      { id: 1, label: 'Filter data berdasarkan rentang tanggal', status: 'pending' },
      { id: 2, label: 'Preprocessing teks & Pembersihan pesan bahasa Indonesia', status: 'pending' },
      { id: 3, label: 'Vektorisasi teks menggunakan IndoBERTweet', status: 'pending' },
      { id: 4, label: 'Reduksi dimensi fitur vektor dengan UMAP', status: 'pending' },
      { id: 5, label: 'Klasterisasi pesan dengan BIRCH Clustering', status: 'pending' },
      { id: 6, label: 'Ekstraksi kata kunci representatif per klaster dengan BM25', status: 'pending' },
      { id: 7, label: 'Hitung metrik evaluasi: Diversity, Coherence C-NPMI, Density, Similarity', status: 'pending' },
      { id: 8, label: 'Simpan hasil analisis', status: 'pending' },
    ],
  }
}
