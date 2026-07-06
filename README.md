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

## 📂 Alur Logic Pengunggahan & Pemrosesan Berkas Chat

Fitur pengunggahan berkas obrolan pada halaman `/upload` telah dilengkapi dengan alur logic pemrosesan data asinkron langsung di sisi klien (*client-side processing*) sebelum dikirim ke backend:

### 1. Validasi Format Berkas
* Berkas yang diterima hanya berformat **`.txt`** dan **`.zip`**.
* Jika pengguna mengunggah format lain, UI akan langsung menampilkan pesan peringatan (*error alert*) dan memblokir tombol navigasi ke tahap selanjutnya.

### 2. Ekstraksi Berkas ZIP (Client-Side)
* Jika berkas yang diunggah berupa `.zip`, pustaka `JSZip` akan mengekstraknya di latar belakang untuk mencari berkas log obrolan `.txt` pertama di dalamnya.
* Jika berkas `.txt` tidak ditemukan di dalam `.zip`, sistem memicu error di UI.

### 3. Normalisasi & Parsing Log Obrolan ke CSV
Isi dari berkas `.txt` dibaca dan diparsing menggunakan regex berdasarkan 3 variasi format log WhatsApp Android:
* **Android ID 12 jam**: `dd/mm/yy hh.mm AM/PM - sender: msg`
* **Android ID 24 jam**: `dd/mm/yy hh.mm - sender: msg`
* **Android EN 12 jam**: `d/m/yy, hh:mm am/pm - sender: msg`

Setiap baris yang sesuai diparsing menjadi entitas pesan dengan timestamp yang dinormalisasi ke format standar **ISO 8601** (`YYYY-MM-DDTHH:mm:ss`). Pesan multi-baris (*multi-line messages*) secara otomatis diakumulasikan ke pesan pengirim yang sesuai. Baris sistem (seperti info masuk/keluar grup) diabaikan secara aman.
> [!WARNING]
> Jika proses parsing tidak menghasilkan satu pun pesan valid, aplikasi menganggap berkas rusak/tidak cocok dan memicu error visual di UI.

### 4. Anonimisasi Pengirim (*Sender Anonymization*)
Demi menjaga privasi pengguna, seluruh pengirim pesan dianonimkan dengan algoritma hashing SHA-256 yang memiliki salt `"chat-analisis-v1"`:
* **Pengirim Tipe Sistem**: Tetap ditulis `"SYSTEM"`.
* **Pengirim Nomor Telepon**: Misal `+628123456789` -> Dinormalisasi menjadi `User-[4_digit_hash]·7899` (mempertahankan 4 angka terakhir nomor telepon).
* **Pengirim Nama Biasa**: Misal `Budi Santoso` -> Dinormalisasi menjadi `User-[4_digit_hash]` (hanya awalan prefix hash).

### 5. Manajemen Sesi (*Local Session*)
* Aplikasi secara otomatis membuat identifier sesi unik (`session_id`) baru untuk melacak proses analisis pengguna saat mengunggah berkas. Sesi ini disimpan secara persisten di **`localStorage`** pengguna dengan kunci `chat_analisis_session_id`.

### 6. Integrasi TimeRangeFilter Dinamis
* Data hasil parsing digunakan untuk menghitung frekuensi pesan harian secara dinamis (mengisi hari kosong dengan angka `0`).
* Data distribusi ini dikirim langsung ke komponen `TimeRangeFilter` untuk memvisualisasikan grafik kepadatan chat aktual yang diunggah.
* Slider filter tanggal diatur secara dinamis dari **tanggal pesan paling awal** (`startDate`) ke **tanggal pesan paling lambat** (`endDate`) yang terdeteksi dari log chat.

### 7. Pengiriman Data ke Backend API
Saat pengguna menekan tombol **"Mulai Analisis"**, berkas CSV yang dianonimkan beserta parameter filter waktu dikirimkan ke backend melalui metode `POST` menggunakan `FormData`:
* **Endpoint**: `POST /api/upload`
* **Payload**:
  * `file`: Berkas CSV hasil parsing (`whatsapp_chat.csv`).
  * `session_id`: Sesi unik dari `localStorage`.
  * `startDate`: Tanggal awal pilihan slider (format `YYYY-MM-DD`).
  * `endDate`: Tanggal akhir pilihan slider (format `YYYY-MM-DD`).

Fungsi integrasi API ini dideklarasikan pada [src/services/api.ts](file:///home/usereal/Projects/Sistem%20Skripsi/ChatAnalisis-FE/src/services/api.ts) dengan nama `uploadChatFile`.

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
