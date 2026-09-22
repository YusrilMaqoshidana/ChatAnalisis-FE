// src/stores/upload.ts
// ─── MVI: Intent Processor for Upload Feature ───────────────────────────────
//
// In MVI (Model-View-Intent), the Store serves as the "Intent Processor":
//   - It holds the reactive Model (state).
//   - It exposes a single `dispatch(intent)` method to process all intents.
//   - It exposes derived read-only state (Computed) for the View.
//   - Views must NOT mutate state directly — they only dispatch intents.
//
// Data flow: View → Intent → dispatch() → State mutation + Side Effects → View re-renders
// ─────────────────────────────────────────────────────────────────────────────────────────

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import router from '@/router'
import { useResultsStore } from './results'
import { createInitialUploadModel } from '@/models/upload.model'
import { UploadIntent } from '@/intents/upload.intents'
import type { UploadIntentAction } from '@/intents/upload.intents'
import { ResultsIntent } from '@/intents/results.intents'
import { extractTxtFromZip, parsingTxtToMessages, convertToCSV } from '@/services/chatParser'
import { anonymizeMessages } from '@/services/anonimization'
import { calculateDailyActivity } from '@/services/rangeFilter'
import { getOrCreateSessionId } from '@/services/sessionId'
import { uploadChatFile } from '@/services/api'
import type { ParsedMessage } from '@/types/chat'

export const useUploadStore = defineStore('upload', () => {
  const resultsStore = useResultsStore()

  // ── Model (State) ──────────────────────────────────────────────────────────
  // Initialize from the canonical model shape defined in models/upload.model.ts
  const _initial = createInitialUploadModel()
  const selectedFile = ref<File | null>(_initial.selectedFile)
  const uploadError = ref<string | null>(_initial.uploadError)
  const uploadErrorDetail = ref<string | null>(_initial.uploadErrorDetail)
  const parsedCSVString = ref<string>(_initial.parsedCSVString)
  const rawMessages = ref<ParsedMessage[]>(_initial.rawMessages)
  const dailyActivity = ref(_initial.dailyActivity)
  const isAnalyzing = ref(_initial.isAnalyzing)
  const isParsing = ref(_initial.isParsing)
  const currentStep = ref<1 | 2 | 3>(_initial.currentStep)
  const rangeValues = ref<[number, number]>(_initial.rangeValues)
  const activeStepIdx = ref(_initial.activeStepIdx)
  const activeTimeoutId = ref<number | null>(_initial.activeTimeoutId)
  const analysisSteps = ref(_initial.analysisSteps)

  // ── Derived State (Computed) ───────────────────────────────────────────────
  // Pure computed values derived from the model — read-only for the View.
  const _computeDate = (percent: number): Date | null => {
    if (!dailyActivity.value) return null
    const date = new Date(dailyActivity.value.startDateObj)
    const daysToAdd = Math.round((percent / 100) * dailyActivity.value.totalDays)
    date.setDate(date.getDate() + daysToAdd)
    return date
  }

  const startDate = computed(() => _computeDate(rangeValues.value[0]))
  const endDate = computed(() => _computeDate(rangeValues.value[1]))

  const startDateFormatted = computed(() =>
    startDate.value?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) ?? '1 Juni 2026',
  )
  const endDateFormatted = computed(() =>
    endDate.value?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) ?? '4 Juli 2026',
  )
  const startDateParam = computed(() => startDate.value?.toISOString().split('T')[0] ?? '')
  const endDateParam = computed(() => endDate.value?.toISOString().split('T')[0] ?? '')

  // ── Private Side-Effect Handlers ──────────────────────────────────────────
  // These are async operations triggered by intents. Not exposed to the View.

  const _handleSelectFile = async (file: File) => {
    uploadError.value = null
    selectedFile.value = file
    isParsing.value = true

    const extension = file.name.split('.').pop()?.toLowerCase()
    if (extension !== 'txt' && extension !== 'zip') {
      uploadError.value = 'Warning: Format berkas tidak didukung. Harap unggah berkas .zip atau .txt.'
      selectedFile.value = null
      rawMessages.value = []
      parsedCSVString.value = ''
      dailyActivity.value = null
      isParsing.value = false
      return
    }

    try {
      let txtContent = ''
      if (extension === 'zip') {
        const extracted = await extractTxtFromZip(file)
        txtContent = extracted.content
      } else {
        txtContent = await file.text()
      }
      const messages = await parsingTxtToMessages(txtContent)
      rawMessages.value = messages
      parsedCSVString.value = '' // Will be generated after range filter during analysis start
      dailyActivity.value = calculateDailyActivity(messages)
      rangeValues.value = [0, 100]
    } catch (err: unknown) {
      const errorObj = err as Error
      uploadError.value = errorObj.message || 'Gagal memproses berkas chat.'
      selectedFile.value = null
      rawMessages.value = []
      parsedCSVString.value = ''
      dailyActivity.value = null
    } finally {
      isParsing.value = false
    }
  }

  const _handleClearFile = () => {
    const fresh = createInitialUploadModel()
    selectedFile.value = fresh.selectedFile
    uploadError.value = fresh.uploadError
    uploadErrorDetail.value = fresh.uploadErrorDetail
    parsedCSVString.value = fresh.parsedCSVString
    rawMessages.value = fresh.rawMessages
    dailyActivity.value = fresh.dailyActivity
    currentStep.value = fresh.currentStep
    isAnalyzing.value = fresh.isAnalyzing
    isParsing.value = fresh.isParsing
    activeStepIdx.value = fresh.activeStepIdx
    _cleanupTimeout()
    analysisSteps.value.forEach((s) => (s.status = 'pending'))
  }

  const _handleNextStep = () => {
    if (selectedFile.value && !uploadError.value && currentStep.value === 1) {
      currentStep.value = 2
    }
  }

  const _handlePrevStep = () => {
    if (currentStep.value === 2) {
      currentStep.value = 1
    }
  }

  const _handleUpdateRange = (range: [number, number]) => {
    rangeValues.value = range
  }

  const _handleStartAnalysis = async () => {
    if (!selectedFile.value || rawMessages.value.length === 0) return
    currentStep.value = 3
    isAnalyzing.value = true
    activeStepIdx.value = 0
    uploadErrorDetail.value = null

    analysisSteps.value.forEach((s) => (s.status = 'pending'))

    const firstStep = analysisSteps.value[0]
    if (firstStep) firstStep.status = 'running'
    const startTime = Date.now()

    try {
      // 1. Slice raw messages based on selected date range on client-side
      const filterStartDate = startDate.value
      const filterEndDate = endDate.value

      let filteredMessages = rawMessages.value
      if (filterStartDate || filterEndDate) {
        const startMs = filterStartDate ? new Date(filterStartDate.setHours(0, 0, 0, 0)).getTime() : 0
        const endMs = filterEndDate ? new Date(filterEndDate.setHours(23, 59, 59, 999)).getTime() : Infinity

        filteredMessages = rawMessages.value.filter((msg) => {
          const msgTime = new Date(msg.timestamp).getTime()
          return msgTime >= startMs && msgTime <= endMs
        })
      }

      if (filteredMessages.length === 0) {
        throw new Error('Tidak ada pesan dalam rentang tanggal yang dipilih.')
      }

      // 2. Anonymize only the sliced messages (more efficient)
      const anonymized = await anonymizeMessages(filteredMessages)

      // 3. Convert the anonymized slice to CSV string
      const csvStr = convertToCSV(anonymized)
      parsedCSVString.value = csvStr

      const sessionId = getOrCreateSessionId()
      const csvBlob = new Blob([csvStr], { type: 'text/csv;charset=utf-8' })

      await uploadChatFile(csvBlob, sessionId, startDateParam.value || '', endDateParam.value || '')

      if (firstStep) {
        firstStep.status = 'completed'
        firstStep.timeElapsed = `${Math.round(Date.now() - startTime)}ms`
      }

      const baseUrl = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000'
      let sseUrl = ''
      if (baseUrl === '/') {
        sseUrl = `/api/analysis/events/${sessionId}`
      } else {
        sseUrl = `${baseUrl.replace(/\/$/, '')}/api/analysis/events/${sessionId}`
      }

      const eventSource = new EventSource(sseUrl)

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.status === 'failed') {
            isAnalyzing.value = false
            uploadErrorDetail.value = data.error || 'Terjadi kesalahan pada proses analisis.'
            const activeStep = analysisSteps.value.find((s) => s.status === 'running')
            if (activeStep) {
              activeStep.status = 'failed'
            } else {
              const fallbackStep = analysisSteps.value[activeStepIdx.value]
              if (fallbackStep) fallbackStep.status = 'failed'
            }
            eventSource.close()
            return
          }

          if (data.step_id) {
            const stepObj = analysisSteps.value.find((s) => s.id === data.step_id)
            if (stepObj) {
              stepObj.status = data.status
              if (data.time_elapsed) stepObj.timeElapsed = data.time_elapsed
            }
            if (data.status === 'running') activeStepIdx.value = data.step_id - 1
          }

          if (data.done) {
            eventSource.close()
            setTimeout(() => {
              resultsStore.dispatch({ type: ResultsIntent.SET_ANALYZED, payload: { value: true } })
              router.push('/results')
            }, 800)
          }
        } catch (e) {
          console.error('Error parsing progress SSE message:', e)
        }
      }

      eventSource.onerror = (err) => {
        console.error('EventSource Error:', err)
        if (eventSource.readyState === EventSource.CLOSED) {
          isAnalyzing.value = false
          uploadErrorDetail.value = 'Koneksi ke server terputus.'
        }
      }
    } catch (err: unknown) {
      console.error('API Error during analysis upload:', err)
      let apiErrorMsg = 'Gagal mengunggah berkas analisis ke server.'
      if (axios.isAxiosError(err)) {
        apiErrorMsg = (err.response?.data as { message?: string })?.message || err.message || apiErrorMsg
      } else if (err instanceof Error) {
        apiErrorMsg = err.message
      }
      if (firstStep) firstStep.status = 'failed'
      isAnalyzing.value = false
      uploadErrorDetail.value = apiErrorMsg
    }
  }

  const _cleanupTimeout = () => {
    if (activeTimeoutId.value !== null) {
      clearTimeout(activeTimeoutId.value)
      activeTimeoutId.value = null
    }
  }

  // ── Intent Dispatcher ──────────────────────────────────────────────────────
  // The single entry point for all state mutations from the View.
  // The View dispatches typed intents; the store handles them.
  async function dispatch(intent: UploadIntentAction): Promise<void> {
    switch (intent.type) {
      case UploadIntent.SELECT_FILE:
        await _handleSelectFile(intent.payload.file)
        break
      case UploadIntent.CLEAR_FILE:
        _handleClearFile()
        break
      case UploadIntent.NEXT_STEP:
        _handleNextStep()
        break
      case UploadIntent.PREV_STEP:
        _handlePrevStep()
        break
      case UploadIntent.UPDATE_RANGE:
        _handleUpdateRange(intent.payload.range)
        break
      case UploadIntent.START_ANALYSIS:
        await _handleStartAnalysis()
        break
      case UploadIntent.CLEANUP:
        _cleanupTimeout()
        break
      default:
        console.warn('[UploadStore] Unknown intent dispatched:', intent)
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────
  // Only state refs, computed values, and the dispatch function are exposed.
  // No individual action methods are exposed — use dispatch() from the View.
  return {
    // Model (state)
    selectedFile,
    uploadError,
    uploadErrorDetail,
    parsedCSVString,
    rawMessages,
    dailyActivity,
    isAnalyzing,
    isParsing,
    currentStep,
    rangeValues,
    activeStepIdx,
    analysisSteps,
    // Derived state
    startDate,
    endDate,
    startDateFormatted,
    endDateFormatted,
    startDateParam,
    endDateParam,
    // Intent Dispatcher
    dispatch,
  }
})
