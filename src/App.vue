<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import NavLink from '@/components/NavLink.vue'

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <!-- Navigation Header -->
  <header class="sticky top-0 z-50 w-full border-b border-border/80 bg-bg/80 backdrop-blur-md">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <!-- Logo / Brand -->
        <div class="flex items-center">
          <RouterLink to="/" @click="closeMobileMenu" class="flex items-center gap-2.5 group">
            <img src="/chat-analisis-logo.jpg" alt="Chat Analisis Logo" class="w-8 h-8 rounded-lg object-cover border border-border/60 shadow-sm" />
            <span class="text-base sm:text-lg font-bold text-ink tracking-tight"
              >Chat Analisis</span
            >
          </RouterLink>
        </div>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center gap-1">
          <NavLink to="/">Beranda</NavLink>
          <NavLink to="/about">Cara Kerja & Ekspor</NavLink>
          <RouterLink
            to="/upload"
            class="ml-2 px-4 py-2 rounded-lg text-sm font-semibold text-bg bg-accent hover:opacity-90 shadow-md shadow-accent/10 transition-all duration-200"
            active-class="!bg-accent !text-bg"
          >
            Mulai Analisis
          </RouterLink>
        </nav>

        <!-- Mobile Menu Button -->
        <div class="flex md:hidden">
          <button
            @click="toggleMobileMenu"
            type="button"
            class="inline-flex items-center justify-center rounded-lg p-2 text-muted hover:bg-surface hover:text-ink focus:outline-none transition-colors"
          >
            <i :class="[isMobileMenuOpen ? 'pi pi-times' : 'pi pi-bars', 'text-lg']"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <div
      v-show="isMobileMenuOpen"
      class="md:hidden border-b border-border bg-bg/95 px-4 py-3 space-y-2"
    >
      <RouterLink
        to="/"
        @click="closeMobileMenu"
        class="block px-3 py-2 rounded-lg text-base font-medium text-muted hover:text-ink hover:bg-surface"
        active-class="!text-ink !bg-surface"
      >
        Beranda
      </RouterLink>
      <RouterLink
        to="/about"
        @click="closeMobileMenu"
        class="block px-3 py-2 rounded-lg text-base font-medium text-muted hover:text-ink hover:bg-surface"
        active-class="!text-ink !bg-surface"
      >
        Cara Kerja & Ekspor
      </RouterLink>
      <RouterLink
        to="/upload"
        @click="closeMobileMenu"
        class="block px-3 py-2.5 rounded-lg text-base font-semibold text-bg bg-accent text-center"
        active-class="!bg-accent !text-bg"
      >
        Mulai Analisis
      </RouterLink>
    </div>
  </header>

  <!-- Main View Area -->
  <main class="grow">
    <RouterView />
  </main>

  <!-- Academic Footer -->
  <footer class="border-t border-border/80 bg-bg/30 py-8">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-3">
      <p class="text-xs text-muted">
        Sistem Analisis Topik Grup WhatsApp Berbasis Web Menggunakan BERTopic, IndoBERTweet, dan
        BIRCH Clustering
      </p>
      <p class="text-[10px] text-muted/80">&copy; 2026 Tugas Akhir | Moh. Yusril Maqoshidana.</p>
    </div>
  </footer>
</template>

<style>
/* Reset and custom global scrollbar styles */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #12141c;
}
::-webkit-scrollbar-thumb {
  background: #1b1e2a;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #2c303f;
}
</style>
