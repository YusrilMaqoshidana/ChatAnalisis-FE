<script setup lang="ts">
// Reusable step-by-step export WhatsApp tutorial
</script>

<template>
  <div class="bg-surface/20 border border-border rounded-2xl p-6 sm:p-8 space-y-6">
    <p class="text-muted leading-relaxed">
      Untuk menganalisis grup WhatsApp Anda, Anda perlu mengekspor riwayat obrolan terlebih dahulu dalam format file `.txt`. Berikut adalah langkah-langkahnya di HP Android:
    </p>

    <div class="relative pl-6 border-l-2 border-accent-alt/50 space-y-8">
      <!-- Step 1 -->
      <div class="relative">
        <span class="absolute -left-[33px] top-0 flex items-center justify-center w-5 h-5 rounded-full bg-accent-alt ring-4 ring-bg text-[10px] text-bg font-bold">1</span>
        <h3 class="text-base font-semibold text-ink">Buka Chat Grup</h3>
        <p class="text-sm text-muted mt-1">Buka aplikasi WhatsApp di HP Android Anda, kemudian masuk ke dalam chat grup yang ingin dianalisis.</p>
      </div>

      <!-- Step 2 -->
      <div class="relative">
        <span class="absolute -left-[33px] top-0 flex items-center justify-center w-5 h-5 rounded-full bg-accent-alt ring-4 ring-bg text-[10px] text-bg font-bold">2</span>
        <h3 class="text-base font-semibold text-ink">Buka Menu Opsi</h3>
        <p class="text-sm text-muted mt-1">Ketuk ikon titik tiga (<i class="pi pi-ellipsis-v text-xs"></i>) di pojok kanan atas layar.</p>
      </div>

      <!-- Step 3 -->
      <div class="relative">
        <span class="absolute -left-[33px] top-0 flex items-center justify-center w-5 h-5 rounded-full bg-accent-alt ring-4 ring-bg text-[10px] text-bg font-bold">3</span>
        <h3 class="text-base font-semibold text-ink">Pilih Ekspor Chat</h3>
        <p class="text-sm text-muted mt-1">Pilih menu <strong>Lainnya (More)</strong>, kemudian ketuk pilihan <strong>Ekspor chat (Export chat)</strong>.</p>
      </div>

      <!-- Step 4 -->
      <div class="relative">
        <span class="absolute -left-[33px] top-0 flex items-center justify-center w-5 h-5 rounded-full bg-accent-alt ring-4 ring-bg text-[10px] text-bg font-bold">4</span>
        <h3 class="text-base font-semibold text-ink">Pilih "Tanpa Media" (Without Media)</h3>
        <p class="text-sm text-muted mt-1">
          Saat muncul pop-up, pilih opsi <strong class="text-accent-alt">Tanpa media (Without media)</strong>. Ini akan memastikan file yang dihasilkan hanya berupa teks sehingga ukuran file lebih kecil dan proses analisis lebih cepat.
        </p>
      </div>

      <!-- Step 5 -->
      <div class="relative">
        <span class="absolute -left-[33px] top-0 flex items-center justify-center w-5 h-5 rounded-full bg-accent-alt ring-4 ring-bg text-[10px] text-bg font-bold">5</span>
        <h3 class="text-base font-semibold text-ink">Simpan File</h3>
        <p class="text-sm text-muted mt-1">WhatsApp akan membuat file teks. Simpan file `.txt` tersebut ke Google Drive Anda, kirim ke diri sendiri via email, atau simpan langsung ke memori lokal HP Anda.</p>
      </div>
    </div>

    <!-- Extra Action slot for flexibility -->
    <div class="pt-4 border-t border-border/80 flex justify-end">
      <slot name="action"></slot>
    </div>
  </div>
</template>
