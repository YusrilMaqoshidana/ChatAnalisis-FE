<script setup lang="ts">
import { ref } from 'vue'
import { useDropZone } from '@vueuse/core'
import Button from 'primevue/button'

const props = withDefaults(
  defineProps<{
    accept?: string
    isAnalyzing?: boolean
  }>(),
  {
    accept: '.txt',
    isAnalyzing: false,
  }
)

const emit = defineEmits<{
  (e: 'select', file: File): void
  (e: 'clear'): void
}>()

const dropZoneRef = ref<HTMLDivElement | null>(null)
const selectedFile = ref<File | null>(null)

const onDrop = (files: File[] | null) => {
  if (files && files.length > 0) {
    const file = files[0]
    if (file) {
      const extension = props.accept.toLowerCase()
      if (file.type === 'text/plain' || file.name.toLowerCase().endsWith(extension)) {
        selectedFile.value = file
        emit('select', file)
      } else {
        alert(`Hanya file dengan ekstensi ${props.accept} yang diperbolehkan.`)
      }
    }
  }
}

const { isOverDropZone } = useDropZone(dropZoneRef, { onDrop })

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file) {
      selectedFile.value = file
      emit('select', file)
    }
  }
}

const triggerFileInput = () => {
  const fileInput = document.getElementById('whatsapp-file-input')
  if (fileInput) {
    fileInput.click()
  }
}

const clearFile = () => {
  selectedFile.value = null
  emit('clear')
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
</script>

<template>
  <div
    ref="dropZoneRef"
    @click="!selectedFile ? triggerFileInput() : null"
    :class="[
      'relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer min-h-[250px]',
      isOverDropZone 
        ? 'border-accent bg-surface/30' 
        : selectedFile 
          ? 'border-accent-alt/50 bg-surface/5' 
          : 'border-border bg-surface/10 hover:border-accent/50 hover:bg-surface/20'
    ]"
  >
    <!-- Hidden file input -->
    <input
      id="whatsapp-file-input"
      type="file"
      :accept="accept"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- Drag & Drop Instruction or Selected File State -->
    <div v-if="!selectedFile" class="text-center space-y-4">
      <div class="flex items-center justify-center w-12 h-12 rounded-full bg-surface/80 text-muted mx-auto">
        <i class="pi pi-cloud-upload text-xl"></i>
      </div>
      <div>
        <p class="text-sm font-semibold text-ink">
          Seret file ke sini, atau <span class="text-accent underline decoration-accent underline-offset-4">pilih dari folder</span>
        </p>
        <p class="text-xs text-muted mt-2">Hanya menerima format file {{ accept }} (tanpa media)</p>
      </div>
    </div>

    <!-- File Selected State -->
    <div v-else class="w-full text-center space-y-4">
      <div class="flex items-center justify-center w-12 h-12 rounded-full bg-accent-alt/10 text-accent-alt mx-auto">
        <i class="pi pi-file-o text-xl"></i>
      </div>
      <div class="max-w-[90%] mx-auto">
        <p class="text-sm font-semibold text-ink truncate" :title="selectedFile.name">
          {{ selectedFile.name }}
        </p>
        <p class="text-xs text-muted mt-1">
          Ukuran: {{ formatBytes(selectedFile.size) }}
        </p>
      </div>
      <div class="flex justify-center gap-3 pt-2">
        <Button 
          @click.stop="clearFile" 
          :disabled="isAnalyzing"
          label="Ganti File" 
          icon="pi pi-refresh" 
          class="!text-xs !px-4 !py-2 !rounded-lg !bg-surface hover:!bg-surface/90 !border-border !text-muted cursor-pointer"
        />
      </div>
    </div>
  </div>
</template>
