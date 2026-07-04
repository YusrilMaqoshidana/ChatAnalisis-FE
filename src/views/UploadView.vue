<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import { useResultsStore } from '@/stores/results'
import DropZone from '../components/DropZone.vue'
import TimeRangeFilter from '../components/TimeRangeFilter.vue'
import TerminalSimulator from '../components/TerminalSimulator.vue'

const router = useRouter()
const store = useResultsStore()

const selectedFile = ref<File | null>(null)
const isAnalyzing = ref(false)

// Active Wizard Step: 1 = Upload, 2 = Date Filter, 3 = Terminal Simulation
const currentStep = ref(1)

// Slider values representing percentage from 0 to 100
const rangeValues = ref<[number, number]>([0, 100])

// Calculate dates between June 1st and July 4th (33 days total)
const totalDays = 33
const startDateObj = new Date('2026-06-01')

const startDateFormatted = computed(() => {
  const date = new Date(startDateObj)
  const daysToAdd = Math.round((rangeValues.value[0] / 100) * totalDays)
  date.setDate(date.getDate() + daysToAdd)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
})

const endDateFormatted = computed(() => {
  const date = new Date(startDateObj)
  const daysToAdd = Math.round((rangeValues.value[1] / 100) * totalDays)
  date.setDate(date.getDate() + daysToAdd)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
})

// Terminal loading steps representation
interface AnalysisStep {
  id: number
  label: string
  status: 'pending' | 'running' | 'completed'
  timeElapsed?: string
}

const analysisSteps = ref<AnalysisStep[]>([
  { id: 1, label: 'Membaca berkas log obrolan WhatsApp', status: 'pending' },
  { id: 2, label: 'Preprocessing teks & pembersihan pesan', status: 'pending' },
  { id: 3, label: 'Ekstraksi embedding kalimat (IndoBERTweet)', status: 'pending' },
  { id: 4, label: 'Pemodelan topik semantik (BERTopic)', status: 'pending' },
  { id: 5, label: 'Pengelompokan dokumen dengan BIRCH Clustering', status: 'pending' }
])

const activeStepIdx = ref(-1)

const handleFileSelect = (file: File) => {
  selectedFile.value = file
}

const handleFileClear = () => {
  selectedFile.value = null
  currentStep.value = 1
}

const nextStep = () => {
  if (selectedFile.value && currentStep.value === 1) {
    currentStep.value = 2
  }
}

const prevStep = () => {
  if (currentStep.value === 2) {
    currentStep.value = 1
  }
}

// Run terminal simulation steps
const startAnalysis = () => {
  if (!selectedFile.value) return
  currentStep.value = 3
  isAnalyzing.value = true
  activeStepIdx.value = 0
  
  // Reset all steps to pending
  analysisSteps.value.forEach(s => s.status = 'pending')
  
  // Sequence timers to simulate terminal outputs
  const runNextStep = () => {
    const idx = activeStepIdx.value
    if (idx >= analysisSteps.value.length) {
      // Completed all steps
      setTimeout(() => {
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

    setTimeout(() => {
      // Complete current step
      const currentStepObj = analysisSteps.value[idx]
      if (currentStepObj) {
        currentStepObj.status = 'completed'
        currentStepObj.timeElapsed = `${Math.round(200 + Math.random() * 300)}ms`
      }
      activeStepIdx.value++
      runNextStep()
    }, 600)
  }

  runNextStep()
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
          <p class="text-xs text-muted">Seret file berkas hasil ekspor log WhatsApp (.txt) Anda.</p>
        </div>

        <DropZone 
          accept=".txt"
          :isAnalyzing="isAnalyzing"
          @select="handleFileSelect"
          @clear="handleFileClear"
        />

        <div v-if="selectedFile" class="bg-surface/50 border border-border/80 rounded-xl p-3 flex items-center justify-between text-xs animate-fade-in">
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
            :disabled="!selectedFile"
            label="Selanjutnya"
            icon="pi pi-arrow-right"
            iconPos="right"
            class="w-full sm:w-auto !px-5 !py-2.5 !text-sm !font-semibold !rounded-xl !bg-accent hover:opacity-90 disabled:!bg-surface disabled:!text-muted/60 !border-none !text-bg !shadow-lg !shadow-accent/20 disabled:!shadow-none transition-all cursor-pointer"
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

        <div class="text-center text-xs text-muted animate-pulse">
          Harap jangan menutup halaman ini selama proses analisis.
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
