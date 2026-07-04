# WhatsApp Chat Topic Analysis - Frontend (ChatAnalisis-FE)

Proyek ini adalah antarmuka web modern untuk menganalisis topik percakapan Grup WhatsApp. Sistem ini memanfaatkan model **BERTopic** untuk pemodelan topik, embedding bahasa menggunakan **IndoBERTweet**, dan pengklasteran menggunakan **BIRCH Clustering**.

---

## 🏗️ Prinsip Arsitektur: Pemisahan UI & Logic

Proyek ini secara ketat memisahkan komponen presentasional (*dumb components*) dari komponen penampung logika (*views / container components*):

1. **Presentational Components (`src/components/`)**:
   * Hanya bertugas merender UI dan merespons interaksi langsung (misalnya hover, click).
   * Menerima seluruh data melalui **props** dan mengirimkan interaksi keluar melalui **emits**.
   * **TIDAK** diperbolehkan mengakses Pinia store, memanggil API (axios/fetch), atau melakukan logika navigasi secara langsung.
   
2. **Container Components (`src/views/`)**:
   * Bertanggung jawab atas logika bisnis, sinkronisasi state ke Pinia store, pemanggilan API, dan navigasi halaman.
   * Meneruskan data mentah ke presentational components.

---

## 🚦 Rute Halaman & Batasan Akses (Access Control)

Aplikasi memiliki alur navigasi terkendali untuk menjamin validitas sesi analisis:

* **`/` (Beranda)**: Landing page penjelasan sistem.
* **`/about` (Cara Kerja)**: Panduan ekspor chat WhatsApp dari perangkat Android.
* **`/upload` (Upload File)**: Halaman unggah file log WhatsApp (.txt) yang menyediakan panel konfigurasi terintegrasi: unggah berkas (Tahap 1), filter rentang waktu (Tahap 2) dengan grafik kepadatan pesan dan PrimeVue Slider, serta visualisasi proses pemodelan AI (Tahap 3) berbentuk checklist terminal interaktif.
* **`/results` (Dashboard Hasil)**: Dashboard analisis topik, visualisasi kluster spasi 2D, keaktifan waktu, dan ranking pengirim.
* **`/results/topics/:topicId` (Detail Topik)**: Daftar pesan per kluster topik serta penampil timeline percakapan asli.

> [!IMPORTANT]
> **Batasan Akses**: Pengguna **tidak dapat mengakses manual** rute `/results` dan `/results/topics/:topicId` (misalnya dengan mengetik langsung di address bar). Router navigation guard `beforeEnter` akan mengecek state `isAnalyzed` di Pinia store. Jika belum melakukan analisis, pengguna otomatis dialihkan kembali ke halaman `/upload`.

---

## 📦 Kontrak Props Komponen Baru

Berikut adalah ringkasan kontrak input/output dari komponen presentasional baru yang telah dibuat:

### 1. [MetricCard.vue](file:///home/usereal/Projects/Sistem%20Skripsi/ChatAnalisis-FE/src/components/MetricCard.vue)
* **Props**:
  * `label: string` (Nama metrik evaluasi model, e.g. `'C-NPMI'`)
  * `value: string | number` (Nilai hasil evaluasi, e.g. `0.165`)
  * `description?: string` (Penjelasan singkat metrik)

### 2. [TopicCard.vue](file:///home/usereal/Projects/Sistem%20Skripsi/ChatAnalisis-FE/src/components/TopicCard.vue)
* **Props**:
  * `topicId: string | number` (ID unik kluster topik)
  * `label: string` (Nama/kategori label topik)
  * `messageCount: number` (Jumlah pesan dalam topik)
  * `keywords?: string[]` (Daftar kata kunci utama pendukung topik)
* **Emits**:
  * `click(topicId: string | number)` (Dipicu saat kartu topik ditekan untuk melihat detail)

### 3. [TopSenderList.vue](file:///home/usereal/Projects/Sistem%20Skripsi/ChatAnalisis-FE/src/components/TopSenderList.vue)
* **Props**:
  * `senders: Array<{ name: string, messageCount: number, avatarInitial?: string }>` (Data peringkat pengirim pesan teraktif)

### 4. [ActiveDatesChart.vue](file:///home/usereal/Projects/Sistem%20Skripsi/ChatAnalisis-FE/src/components/ActiveDatesChart.vue)
* **Props**:
  * `data: Array<{ date: string, count: number }>` (Dataset aktivitas harian untuk di-render oleh Chart.js)

### 5. [ActiveHoursChart.vue](file:///home/usereal/Projects/Sistem%20Skripsi/ChatAnalisis-FE/src/components/ActiveHoursChart.vue)
* **Props**:
  * `data: Array<{ hour: number, count: number }>` (Dataset aktivitas per jam 0-23)

### 6. [MessageListItem.vue](file:///home/usereal/Projects/Sistem%20Skripsi/ChatAnalisis-FE/src/components/MessageListItem.vue)
* **Props**:
  * `sender: string` (Nama pengirim pesan)
  * `content: string` (Isi pesan teks)
  * `timestamp: string` (Waktu kirim, e.g., `'08:15'`)
* **Emits**:
  * `click` (Dipicu saat baris pesan diklik untuk membuka modal konteks)

### 7. [MessageContextModal.vue](file:///home/usereal/Projects/Sistem%20Skripsi/ChatAnalisis-FE/src/components/MessageContextModal.vue)
* **Props**:
  * `visible: boolean` (Sinkronisasi visibilitas dialog `v-model:visible`)
  * `focusedMessage: { sender, content, timestamp } | null` (Pesan utama yang dipilih pengguna)
  * `contextMessages: Array<{ sender, content, timestamp, isFocused }>` (Daftar pesan sebelum/sesudah pesan fokus pada timeline asli)
* **Emits**:
  * `update:visible(value: boolean)` (Emit dua arah untuk menutup modal)

---

## 🗄️ State Management & Rencana Integrasi Backend

Logika penyimpanan data terpusat di Pinia Store pada file [src/stores/results.ts](file:///home/usereal/Projects/Sistem%20Skripsi/ChatAnalisis-FE/src/stores/results.ts).

### TODO Integrasi Backend (FastAPI)
Jika ingin menyambungkan aplikasi dengan backend FastAPI, ganti data mock di dalam store dengan memicu fungsi pemanggilan API (Axios/Fetch) yang sudah disiapkan sebagai placeholder:
* **`fetchOverviewData()`**: Mengambil data ringkasan metrik dan grafik dari endpoint `GET /api/results/overview`.
* **`fetchTopicsData()`**: Mengambil daftar kluster topik dari endpoint `GET /api/results/topics`.
* **`fetchMessagesTimeline()`**: Mengambil urutan pesan percakapan asli dari endpoint `GET /api/results/messages`.

---

## 🚀 Panduan Pengembangan & Build

### Instalasi Dependensi
```bash
npm install
```

### Menjalankan Server Lokal (Development)
```bash
npm run dev
```

### Melakukan Type-Check Codebase
```bash
npm run type-check
```

### Kompilasi Aplikasi untuk Produksi
```bash
npm run build
```
