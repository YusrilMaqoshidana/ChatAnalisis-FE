<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import { useResultsStore } from '@/stores/results'
import DropZone from '../components/DropZone.vue'
import TimeRangeFilter from '../components/TimeRangeFilter.vue'
import TerminalSimulator from '../components/TerminalSimulator.vue'
import {
  extractTxtFromZip,
  parsingTxtToMessages,
  anonymizeMessages,
  convertToCSV,
  calculateDailyActivity,
  getOrCreateSessionId,
  type DailyActivity
} from '@/services/chatParser'
import { uploadChatFile } from '@/services/api'

const router = useRouter()
const store = useResultsStore()

const selectedFile = ref<File | null>(null)
const uploadError = ref<string | null>(null)
const uploadErrorDetail = ref<string | null>(null)
const parsedCSVString = ref<string>('')
const dailyActivity = ref<DailyActivity | null>(null)
const isAnalyzing = ref(false)
const activeTimeoutId = ref<number | null>(null)

// Active Wizard Step: 1 = Upload, 2 = Date Filter, 3 = Terminal Simulation
const currentStep = ref(1)

// Slider values representing percentage from 0 to 100
const rangeValues = ref<[number, number]>([0, 100])

// Helper for date calculation to avoid duplication
const computeDate = (percent: number): Date | null => {
  if (!dailyActivity.value) return null
  const date = new Date(dailyActivity.value.startDateObj)
  const daysToAdd = Math.round((percent / 100) * dailyActivity.value.totalDays)
  date.setDate(date.getDate() + daysToAdd)
  return date
}

const startDate = computed(() => computeDate(rangeValues.value[0]))
const endDate = computed(() => computeDate(rangeValues.value[1]))

// Calculate date params for endpoints and display formatting
const startDateFormatted = computed(() => {
  return startDate.value?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) ?? '1 Juni 2026'
})

const endDateFormatted = computed(() => {
  return endDate.value?.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) ?? '4 Juli 2026'
})

// ISO Date formats for API call
const startDateParam = computed(() => {
  return startDate.value?.toISOString().split('T')[0] ?? ''
})

const endDateParam = computed(() => {
  return endDate.value?.toISOString().split('T')[0] ?? ''
})

// Initialize Session ID on mount
onMounted(() => {
  getOrCreateSessionId()
})

// Clean up timers on unmount
onBeforeUnmount(() => {
  if (activeTimeoutId.value !== null) {
    clearTimeout(activeTimeoutId.value)
  }
})

// Terminal loading steps representation
interface AnalysisStep {
  id: number
  label: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  timeElapsed?: string
}

const analysisSteps = ref<AnalysisStep[]>([
  { id: 1, label: 'Mengunggah berkas obrolan ke server analisis', status: 'pending' },
  { id: 2, label: 'Preprocessing teks & pembersihan pesan', status: 'pending' },
  { id: 3, label: 'Ekstraksi embedding kalimat (IndoBERTweet)', status: 'pending' },
  { id: 4, label: 'Reduksi dimensi vektor embedding dengan UMAP', status: 'pending' },
  { id: 5, label: 'Pengelompokan dokumen dengan BIRCH Clustering', status: 'pending' },
  { id: 6, label: 'Ekstraksi representasi kata kunci topik menggunakan c-TF-IDF / BM25', status: 'pending' }
])

const activeStepIdx = ref(-1)

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
  parsedCSVString.value = ''
  dailyActivity.value = null
  currentStep.value = 1
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

// Fallback method for presentational mockup/demo mode in case backend isn't running
const proceedToResultsWithDemoData = () => {
  // TODO: Hubungkan dengan integrasi kemajuan WebSocket real-time sesungguhnya untuk production
  store.setAnalyzed(true)
  router.push('/results')
}

// Run terminal simulation steps & call backend upload
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
    // Panggil API upload riil
    await uploadChatFile(csvBlob, sessionId, startDateParam.value || '', endDateParam.value || '')

    // Step 1 selesai sukses
    if (firstStep) {
      firstStep.status = 'completed'
      firstStep.timeElapsed = `${Math.round(Date.now() - startTime)}ms`
    }

    // Lanjutkan langkah visual berikutnya
    activeStepIdx.value = 1
    runRemainingSteps()
  } catch (err: any) {
    console.error('API Error during analysis upload:', err)
    const apiErrorMsg = err.response?.data?.message || err.message || 'Gagal mengunggah berkas analisis ke server.'

    // Set step 1 to failed
    if (firstStep) {
      firstStep.status = 'failed'
    }
    isAnalyzing.value = false
    uploadErrorDetail.value = apiErrorMsg
  }
}

// Sequence remaining timers to simulate terminal outputs
const runRemainingSteps = () => {
  const idx = activeStepIdx.value
  if (idx >= analysisSteps.value.length) {
    // Completed all steps successfully
    activeTimeoutId.value = window.setTimeout(() => {
      store.setAnalyzed(true)
      router.push('/results')
    }, 500)
    return
  }

  // Set current step to running
  const step = analysisSteps.value[idx]
  if (step) {
    step.status = 'running'
  }

  activeTimeoutId.value = window.setTimeout(() => {
    // Complete current step
    const currentStepObj = analysisSteps.value[idx]
    if (currentStepObj) {
      currentStepObj.status = 'completed'
      currentStepObj.timeElapsed = `${Math.round(250 + Math.random() * 350)}ms`
    }
    activeStepIdx.value++
    runRemainingSteps()
  }, 800)
}
</script>


<template>
  <div class="max-w-2xl mx-auto px-4 py-8 lg:py-16 flex flex-col justify-center min-h-[75vh]">

    <!-- Wizard Progress Stepper Header -->
    <div class="mb-8 flex items-center justify-between px-4">
      <div class="flex items-center gap-2">
        <span
          :class="[
            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
            currentStep >= 1 ? 'bg-accent text-bg' : 'bg-surface border border-border text-muted'
          ]"
        >
          1
        </span>
        <span :class="[currentStep >= 1 ? 'text-ink font-bold' : 'text-muted', 'text-xs transition-colors']">Upload</span>
      </div>

      <div class="flex-grow h-[1px] bg-border mx-4"></div>

      <div class="flex items-center gap-2">
        <span
          :class="[
            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
            currentStep >= 2 ? 'bg-accent text-bg' : 'bg-surface border border-border text-muted'
          ]"
        >
          2
        </span>
        <span :class="[currentStep >= 2 ? 'text-ink font-bold' : 'text-muted', 'text-xs transition-colors']">Filter Tanggal</span>
      </div>

      <div class="flex-grow h-[1px] bg-border mx-4"></div>

      <div class="flex items-center gap-2">
        <span
          :class="[
            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
            currentStep >= 3 ? 'bg-accent text-bg' : 'bg-surface border border-border text-muted'
          ]"
        >
          3
        </span>
        <span :class="[currentStep >= 3 ? 'text-ink font-bold' : 'text-muted', 'text-xs transition-colors']">Analisis AI</span>
      </div>
    </div>

    <!-- Main Wizard Card Container -->
    <div class="bg-surface/30 border border-border/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">

      <!-- STEP 1: Upload File -->
      <div v-if="currentStep === 1" class="space-y-6 transition-all duration-300">
        <div class="space-y-1">
          <h2 class="text-xl font-bold text-ink">Pilih Berkas Grup WhatsApp</h2>
          <p class="text-xs text-muted">Seret berkas hasil ekspor log obrolan WhatsApp (.txt atau .zip) Anda.</p>
        </div>

        <!-- Warning or Error Alert -->
        <div v-if="uploadError" class="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 animate-fade-in">
          <i class="pi pi-exclamation-triangle text-sm mt-0.5 flex-shrink-0"></i>
          <div>
            <span class="font-bold">Gagal memproses berkas:</span>
            <p class="mt-0.5 leading-relaxed">{{ uploadError }}</p>
          </div>
        </div>

        <DropZone
          accept=".txt,.zip"
          :isAnalyzing="isAnalyzing"
          @select="handleFileSelect"
          @clear="handleFileClear"
        />

        <div v-if="selectedFile && !uploadError" class="bg-surface/50 border border-border/80 rounded-xl p-3 flex items-center justify-between text-xs animate-fade-in">
          <div class="flex items-center gap-2 min-w-0">
            <i class="pi pi-file text-accent text-sm flex-shrink-0"></i>
            <span class="text-ink font-semibold truncate block">{{ selectedFile.name }}</span>
          </div>
          <span class="text-muted flex-shrink-0 font-mono pl-2">
            {{ (selectedFile.size / 1024).toFixed(1) }} KB
          </span>
        </div>

        <!-- Navigation Buttons Step 1 -->
        <div class="flex items-center justify-between pt-4 border-t border-border/40">
          <router-link
            to="/"
            class="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink transition-colors duration-200"
          >
            <i class="pi pi-arrow-left text-[9px]"></i>
            Kembali ke Beranda
          </router-link>

          <Button
            @click="nextStep"
            :disabled="!selectedFile || !!uploadError"
            label="Selanjutnya"
            icon="pi pi-arrow-right"
            iconPos="right"
            class="w-full sm:w-auto !px-5 !py-2.5 !text-sm !font-semibold !rounded-xl !bg-accent hover:opacity-90 disabled:!bg-surface disabled:!text-muted/60 disabled:!cursor-not-allowed !border-none !text-bg !shadow-lg !shadow-accent/20 disabled:!shadow-none transition-all cursor-pointer"
          />
        </div>
      </div>

      <!-- STEP 2: Filter Chat History -->
      <div v-else-if="currentStep === 2" class="space-y-6 transition-all duration-300">
        <div class="space-y-1">
          <h2 class="text-xl font-bold text-ink">Filter Rentang Waktu</h2>
          <p class="text-xs text-muted">Sesuaikan tanggal mulai dan akhir untuk memfokuskan data yang dianalisis.</p>
        </div>

        <TimeRangeFilter
          :enabled="true"
          v-model="rangeValues"
          :startDate="startDateFormatted"
          :endDate="endDateFormatted"
          :chartData="dailyActivity ? { labels: dailyActivity.labels, values: dailyActivity.values } : undefined"
        />

        <!-- Navigation Buttons Step 2 -->
        <div class="flex items-center justify-between pt-4 border-t border-border/40 gap-4">
          <Button
            @click="prevStep"
            label="Kembali"
            icon="pi pi-arrow-left"
            class="!px-5 !py-2.5 !text-sm !font-semibold !rounded-xl !bg-surface hover:!bg-border !border !border-border !text-ink transition-all cursor-pointer"
          />

          <Button
            @click="startAnalysis"
            label="Mulai Analisis"
            icon="pi pi-chart-bar"
            class="!px-6 !py-2.5 !text-sm !font-semibold !rounded-xl !bg-accent hover:opacity-90 !border-none !text-bg !shadow-lg !shadow-accent/20 transition-all cursor-pointer"
          />
        </div>
      </div>

      <!-- STEP 3: AI Modeling Loading terminal -->
      <div v-else-if="currentStep === 3" class="space-y-6 transition-all duration-300">
        <div class="space-y-1">
          <h2 class="text-xl font-bold text-ink">Memproses Analisis...</h2>
          <p class="text-xs text-muted font-light">Model NLP dan algoritma pengklasteran sedang berjalan di latar belakang.</p>
        </div>

        <TerminalSimulator
          :visible="true"
          :steps="analysisSteps"
        />

        <div v-if="analysisSteps[0] && analysisSteps[0].status !== 'failed'" class="text-center text-xs text-muted animate-pulse">
          Harap jangan menutup halaman ini selama proses analisis.
        </div>

        <!-- Error actions when upload fails -->
        <div v-if="analysisSteps[0] && analysisSteps[0].status === 'failed'" class="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-3 animate-fade-in text-left">
          <div class="text-xs text-red-400 font-semibold flex items-start gap-2.5">
            <i class="pi pi-exclamation-circle text-sm mt-0.5 flex-shrink-0"></i>
            <div>
              <span class="font-bold block">Detail Kegagalan API Backend:</span>
              <p class="mt-0.5 leading-relaxed font-mono text-[10px]">{{ uploadErrorDetail || 'Koneksi ke backend server gagal.' }}</p>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-3 pt-1">
            <Button
              @click="startAnalysis"
              label="Coba Lagi"
              icon="pi pi-refresh"
              class="!text-xs !px-4 !py-2 !rounded-lg !bg-red-500 !text-white hover:!bg-red-600 !border-none cursor-pointer"
            />
            <Button
              @click="currentStep = 2"
              label="Kembali ke Filter Tanggal"
              icon="pi pi-arrow-left"
              class="!text-xs !px-4 !py-2 !rounded-lg !bg-surface hover:!bg-border !border !border-border !text-ink cursor-pointer"
            />
            <!-- Fallback button for presentation safety -->
            <Button
              @click="proceedToResultsWithDemoData"
              label="Lanjutkan dengan Data Demo (Sidang Fallback)"
              icon="pi pi-eye"
              class="!text-xs !px-4 !py-2 !rounded-lg !bg-accent hover:opacity-90 !border-none !text-bg cursor-pointer"
            />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

