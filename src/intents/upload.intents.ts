// src/intents/upload.intents.ts
// ─── MVI: Intent Definitions for Upload Feature ─────────────────────────────
// Intents are typed action descriptors dispatched from the View layer.
// The store acts as the Intent Processor (reducer + side effect handler).

// ─── Intent Type Enum ────────────────────────────────────────────────────────
export const enum UploadIntent {
  SELECT_FILE = 'upload/SELECT_FILE',
  CLEAR_FILE = 'upload/CLEAR_FILE',
  NEXT_STEP = 'upload/NEXT_STEP',
  PREV_STEP = 'upload/PREV_STEP',
  UPDATE_RANGE = 'upload/UPDATE_RANGE',
  START_ANALYSIS = 'upload/START_ANALYSIS',
  CLEANUP = 'upload/CLEANUP',
}

// ─── Intent Payload Types ────────────────────────────────────────────────────
export interface SelectFilePayload {
  file: File
}

export interface UpdateRangePayload {
  range: [number, number]
}

// ─── Intent Union Type ───────────────────────────────────────────────────────
export type UploadIntentAction =
  | { type: UploadIntent.SELECT_FILE; payload: SelectFilePayload }
  | { type: UploadIntent.CLEAR_FILE }
  | { type: UploadIntent.NEXT_STEP }
  | { type: UploadIntent.PREV_STEP }
  | { type: UploadIntent.UPDATE_RANGE; payload: UpdateRangePayload }
  | { type: UploadIntent.START_ANALYSIS }
  | { type: UploadIntent.CLEANUP }

// ─── Intent Creator Factory Functions ───────────────────────────────────────
// These are helper functions used in Views to construct typed intent objects.
export const UploadIntentCreators = {
  selectFile: (file: File): UploadIntentAction => ({
    type: UploadIntent.SELECT_FILE,
    payload: { file },
  }),
  clearFile: (): UploadIntentAction => ({
    type: UploadIntent.CLEAR_FILE,
  }),
  nextStep: (): UploadIntentAction => ({
    type: UploadIntent.NEXT_STEP,
  }),
  prevStep: (): UploadIntentAction => ({
    type: UploadIntent.PREV_STEP,
  }),
  updateRange: (range: [number, number]): UploadIntentAction => ({
    type: UploadIntent.UPDATE_RANGE,
    payload: { range },
  }),
  startAnalysis: (): UploadIntentAction => ({
    type: UploadIntent.START_ANALYSIS,
  }),
  cleanup: (): UploadIntentAction => ({
    type: UploadIntent.CLEANUP,
  }),
}
