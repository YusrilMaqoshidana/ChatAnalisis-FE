// src/stores/upload.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import router from '@/router'
import { useResultsStore } from './results'
import type { DailyActivity, AnalysisStep } from '@/types/upload'
import { extractTxtFromZip, parsingTxtToMessages, convertToCSV } from '@/services/chatParser'
import { anonymizeMessages } from '@/services/anonimization'
import { calculateDailyActivity } from '@/services/rangeFilter'
import { getOrCreateSessionId } from '@/services/sessionId'
import { uploadChatFile } from '@/services/api'

export const useUploadStore = defineStore('upload', () => {
  const resultsStore = useResultsStore()

  // State
  const selectedFile = ref<File | null>(null)
  const uploadError = ref<string | null>(null)
  const uploadErrorDetail = ref<string | null>(null)
  const parsedCSVString = ref<string>('')
  const dailyActivity = ref<DailyActivity | null>(null)
  const isAnalyzing = ref(false)
  const currentStep = ref(1)
  const rangeValues = ref<[number, number]>([0, 100])
  const activeStepIdx = ref(-1)
  const activeTimeoutId = ref<number | null>(null)

  const analysisSteps = ref<AnalysisStep[]>([
    { id: 1, label: 'Mengunggah berkas obrolan ke server analisis', status: 'pending' },
    { id: 2, label: 'Preprocessing teks & pembersihan pesan', status: 'pending' },
    { id: 3, label: 'Ekstraksi embedding kalimat (IndoBERTweet)', status: 'pending' },
    { id: 4, label: 'Reduksi dimensi vektor embedding dengan UMAP', status: 'pending' },
    { id: 5, label: 'Pengelompokan dokumen dengan BIRCH Clustering', status: 'pending' },
    { id: 6, label: 'Ekstraksi representasi kata kunci topik menggunakan c-TF-IDF / BM25', status: 'pending' }
  ])

  // Initialize Session ID
  getOrCreateSessionId()

  // Computed Date Helpers
  const computeDate = (percent: number): Date | null => {
    if (!dailyActivity.value) return null
    const date = new Date(dailyActivity.value.startDateObj)
    const daysToAdd = Math.round((percent / 100) * dailyActivity.value.totalDays)
    date.setDate(date.getDate() + daysToAdd)
    return date
  }

  const startDate = computed(() => computeDate(rangeValues.value[0]))
  const endDate = computed(() => computeDate(rangeValues.value[1]))

  const startDateFormatted = computed(() => {
    return startDate.value?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) ?? '1 Juni 2026'
  })

  const endDateFormatted = computed(() => {
    return endDate.value?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) ?? '4 Juli 2026'
  })

  const startDateParam = computed(() => {
    return startDate.value?.toISOString().split('T')[0] ?? ''
  })

  const endDateParam = computed(() => {
    return endDate.value?.toISOString().split('T')[0] ?? ''
  })

  // Actions
  const handleFileSelect = async (file: File) => {
    uploadError.value = null
    selectedFile.value = file

    const extension = file.name.split('.').pop()?.toLowerCase()
    if (extension !== 'txt' && extension !== 'zip') {
      uploadError.value = 'Warning: Format berkas tidak didukung. Harap unggah berkas .zip atau .txt.'
      selectedFile.value = null
      parsedCSVString.value = ''
      dailyActivity.value = null
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

      // Parse txt contents
      const messages = await parsingTxtToMessages(txtContent)

      // Anonymize senders
      const anonymized = await anonymizeMessages(messages)

      // Convert anonymized data to CSV string
      parsedCSVString.value = convertToCSV(anonymized)

      // Calculate daily activity frequency
      dailyActivity.value = calculateDailyActivity(anonymized)

      // Reset range values
      rangeValues.value = [0, 100]

    } catch (err: unknown) {
      const errorObj = err as Error
      uploadError.value = errorObj.message || 'Gagal memproses berkas chat.'
      selectedFile.value = null
      parsedCSVString.value = ''
      dailyActivity.value = null
    }
  }

  const handleFileClear = () => {
    selectedFile.value = null
    uploadError.value = null
    uploadErrorDetail.value = null
    parsedCSVString.value = ''
    dailyActivity.value = null
    currentStep.value = 1
    isAnalyzing.value = false
    activeStepIdx.value = -1
    cleanupTimeout()
    analysisSteps.value.forEach(s => s.status = 'pending')
  }

  const nextStep = () => {
    if (selectedFile.value && !uploadError.value && currentStep.value === 1) {
      currentStep.value = 2
    }
  }

  const prevStep = () => {
    if (currentStep.value === 2) {
      currentStep.value = 1
    }
  }

  const runRemainingSteps = () => {
    const idx = activeStepIdx.value
    if (idx >= analysisSteps.value.length) {
      activeTimeoutId.value = window.setTimeout(() => {
        resultsStore.setAnalyzed(true)
        router.push('/results')
      }, 500)
      return
    }

    const step = analysisSteps.value[idx]
    if (step) {
      step.status = 'running'
    }

    activeTimeoutId.value = window.setTimeout(() => {
      const currentStepObj = analysisSteps.value[idx]
      if (currentStepObj) {
        currentStepObj.status = 'completed'
        currentStepObj.timeElapsed = `${Math.round(250 + Math.random() * 350)}ms`
      }
      activeStepIdx.value++
      runRemainingSteps()
    }, 800)
  }

  const startAnalysis = async () => {
    if (!selectedFile.value || !parsedCSVString.value) return
    currentStep.value = 3
    isAnalyzing.value = true
    activeStepIdx.value = 0
    uploadErrorDetail.value = null

    // Reset all steps to pending
    analysisSteps.value.forEach(s => s.status = 'pending')

    const sessionId = getOrCreateSessionId()
    const csvBlob = new Blob([parsedCSVString.value], { type: 'text/csv;charset=utf-8' })

    // Mark step 1 as running
    const firstStep = analysisSteps.value[0]
    if (firstStep) {
      firstStep.status = 'running'
    }
    const startTime = Date.now()

    try {
      await uploadChatFile(csvBlob, sessionId, startDateParam.value || '', endDateParam.value || '')

      if (firstStep) {
        firstStep.status = 'completed'
        firstStep.timeElapsed = `${Math.round(Date.now() - startTime)}ms`
      }

      activeStepIdx.value = 1
      runRemainingSteps()
    } catch (err: unknown) {
      console.error('API Error during analysis upload:', err)
      let apiErrorMsg = 'Gagal mengunggah berkas analisis ke server.'
      if (axios.isAxiosError(err)) {
        apiErrorMsg = (err.response?.data as { message?: string })?.message || err.message || apiErrorMsg
      } else if (err instanceof Error) {
        apiErrorMsg = err.message
      }

      if (firstStep) {
        firstStep.status = 'failed'
      }
      isAnalyzing.value = false
      uploadErrorDetail.value = apiErrorMsg
    }
  }

  const cleanupTimeout = () => {
    if (activeTimeoutId.value !== null) {
      clearTimeout(activeTimeoutId.value)
      activeTimeoutId.value = null
    }
  }

  const proceedToResultsWithDemoData = () => {
    resultsStore.setAnalyzed(true)
    router.push('/results')
  }

  return {
    selectedFile,
    uploadError,
    uploadErrorDetail,
    parsedCSVString,
    dailyActivity,
    isAnalyzing,
    currentStep,
    rangeValues,
    activeStepIdx,
    analysisSteps,
    startDate,
    endDate,
    startDateFormatted,
    endDateFormatted,
    startDateParam,
    endDateParam,
    handleFileSelect,
    handleFileClear,
    nextStep,
    prevStep,
    startAnalysis,
    cleanupTimeout,
    proceedToResultsWithDemoData
  }
})
