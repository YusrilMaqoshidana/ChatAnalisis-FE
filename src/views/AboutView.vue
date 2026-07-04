<script setup lang="ts">
import Card from 'primevue/card'
import ExportTutorial from '../components/ExportTutorial.vue'
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-12 space-y-16">
    <!-- Header Section -->
    <div class="text-center space-y-4">
      <h1 class="text-3xl sm:text-5xl font-extrabold text-ink">Tentang Sistem Analisis</h1>
      <p class="text-muted max-w-2xl mx-auto font-light">
        Pelajari bagaimana sistem memproses percakapan WhatsApp Anda untuk mengekstrak topik utama secara cerdas.
      </p>
    </div>

    <!-- Section: How It Works -->
    <div class="space-y-8">
      <div class="flex items-center gap-3 border-b border-border pb-3">
        <i class="pi pi-cog text-accent text-2xl"></i>
        <h2 class="text-2xl font-bold text-ink">Cara Kerja Website</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Step 1 -->
        <Card class="!bg-surface/40 !border !border-border/40 !text-ink">
          <template #title>
            <div class="flex items-center gap-3">
              <span class="flex items-center justify-center w-8 h-8 rounded-full bg-accent/20 text-accent font-bold text-sm">1</span>
              <span class="text-lg font-semibold text-ink">Ekstraksi & Pra-proses</span>
            </div>
          </template>
          <template #content>
            <p class="text-sm text-muted leading-relaxed">
              Sistem membaca file log `.txt` chat WhatsApp, memisahkan pengirim, tanggal, waktu, dan pesan, lalu membersihkan emoji, tautan, dan teks tidak penting (stopwords).
            </p>
          </template>
        </Card>

        <!-- Step 2 -->
        <Card class="!bg-surface/40 !border !border-border/40 !text-ink">
          <template #title>
            <div class="flex items-center gap-3">
              <span class="flex items-center justify-center w-8 h-8 rounded-full bg-accent/20 text-accent font-bold text-sm">2</span>
              <span class="text-lg font-semibold text-ink">Vektorisasi Kalimat</span>
            </div>
          </template>
          <template #content>
            <p class="text-sm text-muted leading-relaxed">
              Setiap pesan diubah menjadi vektor representasi numerik menggunakan model bahasa <strong class="text-ink">IndoBERTweet</strong> yang memahami semantik bahasa Indonesia gaul/singkatan.
            </p>
          </template>
        </Card>

        <!-- Step 3 -->
        <Card class="!bg-surface/40 !border !border-border/40 !text-ink">
          <template #title>
            <div class="flex items-center gap-3">
              <span class="flex items-center justify-center w-8 h-8 rounded-full bg-accent/20 text-accent font-bold text-sm">3</span>
              <span class="text-lg font-semibold text-ink">Clustering & Deteksi Topik</span>
            </div>
          </template>
          <template #content>
            <p class="text-sm text-muted leading-relaxed">
              Algoritma <strong class="text-ink">BIRCH Clustering</strong> mengelompokkan pesan yang mirip, dan model <strong class="text-ink">BERTopic</strong> mengekstrak kata kunci untuk menamai topik setiap cluster.
            </p>
          </template>
        </Card>
      </div>
    </div>

    <!-- Section: How to Upload from Android -->
    <div class="space-y-8">
      <div class="flex items-center gap-3 border-b border-border pb-3">
        <i class="pi pi-android text-accent-alt text-2xl"></i>
        <h2 class="text-2xl font-bold text-ink">Cara Ekspor Chat WhatsApp di Android</h2>
      </div>

      <ExportTutorial>
        <template #action>
          <router-link 
            to="/upload" 
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-alt hover:opacity-90 text-sm font-semibold text-bg transition-all shadow-md shadow-accent-alt/20 cursor-pointer"
          >
            Mulai Upload File
            <i class="pi pi-upload"></i>
          </router-link>
        </template>
      </ExportTutorial>
    </div>
  </div>
</template>
