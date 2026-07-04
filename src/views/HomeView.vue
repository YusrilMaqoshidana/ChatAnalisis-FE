<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()

const startAnalyzing = () => {
  router.push('/upload')
}
</script>

<template>
  <div class="relative flex flex-col items-center justify-center min-h-[80vh] px-4 overflow-hidden">
    <!-- Background Decorative Gradients -->
    <div
      class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none"
    ></div>
    <div
      class="absolute bottom-10 left-1/3 w-[300px] h-[300px] bg-accent-alt/10 rounded-full blur-[100px] pointer-events-none"
    ></div>

    <div class="max-w-4xl text-center z-10 space-y-8">
      <!-- Main Headline -->
      <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight text-ink leading-tight">
        Temukan Pola Percakapan di Grup WhatsApp Anda
      </h1>

      <!-- Description -->
      <p class="text-lg sm:text-xl text-muted max-w-2xl mx-auto font-light leading-relaxed">
        Analisis topik obrolan secara otomatis menggunakan model
        <span class="text-accent font-medium">BERTopic</span>, embedding bahasa dengan
        <span class="text-accent font-medium">IndoBERTweet</span>, dan clustering dengan
        <span class="text-accent font-medium">BIRCH Clustering</span>.
      </p>

      <!-- Action Button -->
      <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button
          @click="startAnalyzing"
          label="Mulai Analisis Sekarang"
          icon="pi pi-arrow-right"
          iconPos="right"
          class="!px-8 !py-4 !text-base !font-semibold !rounded-xl !bg-accent hover:opacity-90 !border-none !text-bg !shadow-lg !shadow-accent/30 !transition-all !duration-300 hover:!-translate-y-0.5 cursor-pointer"
        />
        <router-link
          to="/about"
          class="flex items-center gap-2 px-6 py-4 text-sm font-medium text-muted hover:text-ink transition-colors duration-200"
        >
          Pelajari Selengkapnya
          <i class="pi pi-question-circle"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>
