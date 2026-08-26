# ChatAnalisis-FE — Sistem Analisis Topik Grup WhatsApp

> Antarmuka web modern untuk menganalisis topik percakapan Grup WhatsApp menggunakan **BERTopic**, embedding bahasa **IndoBERTweet**, dan pengklasteran **BIRCH Clustering**.
>
> **Stack**: Vue 3 · TypeScript · Pinia · Vue Router · TailwindCSS v4 · PrimeVue v4 · Vite

---

## Daftar Isi

1. [Gambaran Umum Sistem](#1-gambaran-umum-sistem)
2. [Arsitektur MVI](#2-arsitektur-mvi-model-view-intent)
3. [Peta Direktori & Tanggung Jawab Setiap Folder](#3-peta-direktori--tanggung-jawab-setiap-folder)
4. [Alur Lengkap Setiap Fitur](#4-alur-lengkap-setiap-fitur)
   - [4.1 Fitur Upload & Pemrosesan File Chat](#41-fitur-upload--pemrosesan-file-chat)
   - [4.2 Fitur Filter Rentang Waktu](#42-fitur-filter-rentang-waktu)
   - [4.3 Fitur Analisis AI (SSE Progress)](#43-fitur-analisis-ai-sse-progress)
   - [4.4 Fitur Dashboard Hasil Analisis](#44-fitur-dashboard-hasil-analisis)
   - [4.5 Fitur Detail Topik & Konteks Pesan](#45-fitur-detail-topik--konteks-pesan)
   - [4.6 Fitur Navigasi & Access Guard](#46-fitur-navigasi--access-guard)
5. [Kontrak Komponen (Props & Emits)](#5-kontrak-komponen-props--emits)
6. [Panduan Maintenance & Debugging](#6-panduan-maintenance--debugging)
7. [Panduan Pengembangan & Build](#7-panduan-pengembangan--build)

---

## 1. Gambaran Umum Sistem

```
Pengguna mengunggah file log WhatsApp (.txt / .zip)
           │
           ▼ [Client-side processing]
  Parse → Anonimisasi → CSV → Filter Tanggal
           │
           ▼ [POST ke Backend FastAPI]
  Analisis NLP (BERTopic + IndoBERTweet + BIRCH)
           │
           ▼ [SSE (Server-Sent Events) real-time progress]
  Redirect ke Dashboard Hasil
           │
           ▼ [GET dari Backend]
  Tampilkan: Topik · Metrik · Grafik · Peringkat Pengirim
           │
           ▼ [Klik TopicCard]
  Detail Topik: Daftar pesan + Modal konteks percakapan
```

---

## 2. Arsitektur MVI (Model-View-Intent)

Proyek ini menggunakan pola **MVI (Model-View-Intent)** — alur data satu arah yang ketat.

```
View ──► Intent ──► Store (dispatch) ──► Model (State)
  ▲                                            │
  └────────────────── Vue reactivity ──────────┘
```

### Aturan Wajib

| Lapisan | Boleh | Dilarang |
|:---|:---|:---|
| **View** (`.vue`) | Membaca state via `storeToRefs`, dispatch intent | Mutasi state langsung, panggil API, business logic |
| **Intent** (`intents/`) | Mendefinisikan enum + payload typed | Mengandung logika apapun |
| **Store** (`stores/`) | Proses intent, mutasi state, panggil service | Dikomunikasikan langsung dari View selain via `dispatch()` |
| **Model** (`models/`) | Mendefinisikan shape state + data awal | Mengandung logic/side effect |
| **Service** (`services/`) | I/O murni: HTTP, parsing, transformasi | Akses ke store, router, atau state global |
| **Component** (`components/`) | Terima props, emit events, render UI | Akses store atau API secara langsung |

---

## 3. Peta Direktori & Tanggung Jawab Setiap Folder

```
src/
├── main.ts                   # Entrypoint aplikasi
├── App.vue                   # Shell: Header, RouterView, Footer
│
├── models/                   # ── LAYER: MODEL ──────────────────────
│   ├── upload.model.ts       # Shape state + initial state upload wizard
│   ├── results.model.ts      # Shape state + konstanta data demo results
│   └── index.ts              # Barrel export
│
├── intents/                  # ── LAYER: INTENT ─────────────────────
│   ├── upload.intents.ts     # Enum UploadIntent + UploadIntentCreators
│   ├── results.intents.ts    # Enum ResultsIntent + ResultsIntentCreators
│   └── index.ts              # Barrel export
│
├── stores/                   # ── LAYER: INTENT PROCESSOR ───────────
│   ├── upload.ts             # Proses UploadIntent, kelola state upload
│   └── results.ts            # Proses ResultsIntent, kelola state results
│
├── views/                    # ── LAYER: VIEW (Container) ───────────
│   ├── HomeView.vue          # Landing page
│   ├── AboutView.vue         # Panduan ekspor WhatsApp (Android)
│   ├── UploadView.vue        # Wizard 3-langkah upload → filter → analisis
│   ├── ResultsView.vue       # Dashboard hasil: metrik, grafik, topik
│   └── TopicDetailView.vue   # Detail klaster: daftar pesan + modal konteks
│
├── components/               # ── LAYER: PRESENTATIONAL COMPONENT ───
│   ├── DropZone.vue          # Area drag-and-drop upload file
│   ├── TimeRangeFilter.vue   # Slider + grafik filter rentang tanggal
│   ├── TerminalSimulator.vue # Checklist progress analisis AI
│   ├── MetricCard.vue        # Kartu tampilan satu metrik evaluasi
│   ├── TopicCard.vue         # Kartu ringkasan satu klaster topik
│   ├── TopSenderList.vue     # Ranking pengirim pesan teraktif
│   ├── ActiveDatesChart.vue  # Line chart aktivitas harian (Chart.js)
│   ├── ActiveHoursChart.vue  # Bar chart aktivitas per jam (Chart.js)
│   ├── MessageListItem.vue   # Satu baris pesan dalam daftar
│   ├── MessageContextModal.vue # Dialog konteks percakapan sebelum/sesudah
│   ├── FileStatus.vue        # Indikator status file yang dipilih
│   ├── ExportTutorial.vue    # Panduan ekspor chat step-by-step
│   ├── NavLink.vue           # Link navigasi header dengan active style
│   └── icons/                # SVG icon components
│
├── services/                 # ── LAYER: PURE SERVICE (I/O) ─────────
│   ├── api.ts                # Semua HTTP request ke backend (axios)
│   ├── chatParser.ts         # Parser log .txt WhatsApp → ParsedMessage[]
│   ├── anonimization.ts      # SHA-256 hashing nama pengirim
│   ├── rangeFilter.ts        # Hitung distribusi frekuensi pesan per hari
│   └── sessionId.ts          # CRUD session_id di localStorage
│
├── types/                    # ── LAYER: TYPE DEFINITIONS ───────────
│   ├── results.ts            # DTOs (backend) + Domain Models (UI) results
│   ├── upload.ts             # DailyActivity, AnalysisStep
│   ├── chat.ts               # ParsedMessage (output parser)
│   └── index.ts              # Barrel export
│
├── router/
│   └── index.ts              # Definisi rute + navigation guard (read-only)
│
└── assets/
    └── main.css              # Global CSS: Tailwind v4, PrimeIcons, CSS vars
```

### Mengapa Dipisah Demikian?

| Folder | Alasan Pemisahan |
|:---|:---|
| `models/` | Memisahkan *shape* state dari *logika* store. Jika state perlu berubah, cukup ubah model — store mengikuti. |
| `intents/` | Membuat semua aksi yang bisa terjadi pada aplikasi *terdokumentasi* dan *typed* di satu tempat. Mudah di-grep saat debugging: "intent apa yang bisa dispatch ke store ini?". |
| `stores/` | Satu-satunya tempat yang boleh mutasi state & punya side-effect. Memudahkan isolasi bug — jika state salah, pasti berasal dari sini. |
| `services/` | Fungsi *pure* tanpa state. Bisa diuji unit secara independen. Tidak bergantung pada Vue/Pinia. |
| `types/` | Pisah antara DTO (kontrak backend) dan Domain Model (kontrak UI). Jika backend mengubah nama field, cukup ubah DTO dan mapper-nya saja. |
| `components/` | Komponen yang hanya terima props tidak perlu tahu dari mana data berasal — mudah di-reuse dan di-test secara visual (Storybook-ready). |

---

## 4. Alur Lengkap Setiap Fitur

### 4.1 Fitur Upload & Pemrosesan File Chat

**Halaman**: `/upload` — Step 1 (Wizard)

**Trigger**: Pengguna drag-and-drop atau memilih file `.txt` / `.zip`

```
[DropZone.vue]
  emit 'select' (file: File)
      │
      ▼ [UploadView.vue]
  onFileSelect(file)
  → store.dispatch(UploadIntentCreators.selectFile(file))
      │
      ▼ [stores/upload.ts — _handleSelectFile()]
  1. Validasi ekstensi (.txt / .zip saja)
  2. Jika .zip → services/chatParser.ts::extractTxtFromZip()
     └─ JSZip membuka arsip, cari file .txt pertama
  3. Parsing: services/chatParser.ts::parsingTxtToMessages()
     ├─ detectFormat() — deteksi salah satu dari 3 format:
     │    • android_id_12h : dd/mm/yy hh.mm AM/PM - sender: msg
     │    • android_id_24h : dd/mm/yy hh.mm - sender: msg
     │    └─ android_en_12h: d/m/yy, h:mm am/pm - sender: msg
     ├─ normalizeLine() — strip karakter invisible Unicode
     ├─ tryParse*() — regex match per baris
     ├─ Akumulasi pesan multi-baris (continuation lines)
     └─ Throw error jika 0 pesan valid dihasilkan
  4. Anonimisasi: services/anonimization.ts::anonymizeMessages()
     ├─ SHA-256(salt + normalized_sender) → 4-char hex prefix
     ├─ Nomor telepon → "User-{hash}·{4_digit_terakhir}"
     └─ Nama biasa → "User-{hash}"
  5. Konversi ke CSV: services/chatParser.ts::convertToCSV()
     └─ Header: Timestamp, Pengirim, Pesan
  6. Hitung distribusi harian: services/rangeFilter.ts::calculateDailyActivity()
     └─ Isi hari kosong dengan 0 (kontinu dari minDate ke maxDate)
  7. Update state: selectedFile, parsedCSVString, dailyActivity
      │
      ▼ [UploadView.vue re-render]
  Tampil: nama file + ukuran, tombol "Selanjutnya" aktif
```

**Error handling**: Jika validasi atau parsing gagal → `uploadError` diset → UI tampilkan alert merah, wizard tidak bisa lanjut.

### 4.2 Fitur Filter Rentang Waktu

**Halaman**: `/upload` — Step 2 (Wizard)

**Trigger**: Pengguna klik "Selanjutnya" dari Step 1

```
[UploadView.vue]
  onNextStep()
  → store.dispatch(UploadIntentCreators.nextStep())
      │
      ▼ [stores/upload.ts]
  currentStep: 1 → 2  (jika file valid & tidak ada error)
      │
      ▼ [UploadView.vue — Step 2 render]
  <TimeRangeFilter> menerima props:
    • enabled: true
    • modelValue: [0, 100]      ← persentase slider
    • startDate: string         ← computed dari dailyActivity
    • endDate: string
    • chartData: { labels, values }  ← distribusi harian

[TimeRangeFilter.vue]
  Render: PrimeVue Slider + Chart.js mini bar chart
  User geser slider
  → emit 'update:modelValue' ([0-100, 0-100])
      │
      ▼ [UploadView.vue]
  onRangeUpdate(range)
  → store.dispatch(UploadIntentCreators.updateRange(range))
      │
      ▼ [stores/upload.ts]
  rangeValues = range
  startDate (computed) = dailyActivity.startDateObj + (range[0]/100 * totalDays) hari
  endDate (computed)   = dailyActivity.startDateObj + (range[1]/100 * totalDays) hari
```

**Computed State** (otomatis terupdate):
- `startDateFormatted` → label tanggal Indonesia (e.g. "1 Juni 2026")
- `startDateParam` → format `YYYY-MM-DD` untuk dikirim ke API

### 4.3 Fitur Analisis AI (SSE Progress)

**Halaman**: `/upload` — Step 3 (Wizard)

**Trigger**: Pengguna klik "Mulai Analisis" dari Step 2

```
[UploadView.vue]
  onStartAnalysis()
  → store.dispatch(UploadIntentCreators.startAnalysis())
      │
      ▼ [stores/upload.ts — _handleStartAnalysis()]
  currentStep → 3, isAnalyzing → true

  1. Reset semua analysisSteps ke 'pending'
  2. getOrCreateSessionId() — ambil/buat session_id dari localStorage
  3. Bungkus parsedCSVString jadi Blob (text/csv)
  4. Set step[0].status = 'running'

  5. POST ke backend:
     services/api.ts::uploadChatFile(csvBlob, sessionId, startDate, endDate)
     Endpoint: POST /analysis
     FormData: { file, session_id, startDate, endDate }
     └─ step[0].status = 'completed' jika sukses

  6. Hubungkan ke Server-Sent Events (SSE) stream:
     eventSource = new EventSource(baseUrl + "/api/analysis/events/{sessionId}")
 
  7. eventSource.onmessage — handle setiap pesan progress:
     ├─ data.status === 'failed'
     │   └─ step aktif → 'failed', isAnalyzing → false
     │      tampilkan uploadErrorDetail
     │      eventSource.close()
     ├─ data.step_id (ada)
     │   ├─ Temukan step dengan id === data.step_id
     │   ├─ Update status: 'running' / 'completed' / 'failed'
     │   └─ Simpan time_elapsed jika ada
     └─ data.done === true
         ├─ eventSource.close()
         ├─ dispatch SET_ANALYZED → true (ke resultsStore)
         └─ router.push('/results') setelah delay 800ms
      │
      ▼ [TerminalSimulator.vue]
  Render checklist 8 step analisis:
    ✓ completed (hijau)   ⟳ running (animasi)
    ✗ failed (merah)      ○ pending (abu-abu)
```

**8 Step Analisis yang Ditampilkan**:
1. Filter data berdasarkan rentang tanggal
2. Preprocessing teks & Pembersihan pesan bahasa Indonesia
3. Vektorisasi teks menggunakan IndoBERTweet
4. Reduksi dimensi fitur vektor dengan UMAP
5. Klasterisasi pesan dengan BIRCH Clustering
6. Ekstraksi kata kunci representatif per klaster dengan BM25
7. Hitung metrik evaluasi (Diversity, Coherence, Density, Similarity)
8. Simpan hasil analisis

**Error Recovery**:
- Tombol "Coba Lagi" → dispatch `startAnalysis` ulang
- Tombol "Kembali ke Filter Tanggal" → dispatch `prevStep`
- Tombol "Lanjutkan dengan Data Demo" → dispatch `proceedDemo` (fallback sidang)

---

### 4.4 Fitur Dashboard Hasil Analisis

**Halaman**: `/results`

**Trigger**: Redirect otomatis setelah analisis selesai, atau akses langsung jika `session_id` ada di localStorage.

```
[ResultsView.vue — onMounted()]
  store.dispatch(ResultsIntentCreators.fetchOverview())
      │
      ▼ [stores/results.ts — _handleFetchOverview()]
  GET /api/results/{jobId}
  Response shape (ResultsSummaryDTO):
  {
    metrics: { topic_diversity, c_npmi, embedding_density, intra_topic_similarity }
    topics: TopicDTO[]          ← array klaster hasil analisis
    top_senders: SenderStatDTO[]
    active_dates: ActiveDateDTO[]
    active_hours: ActiveHourDTO[]
  }

  Mapper functions (DTO → Domain Model):
  ├─ mapTopicDTOToModel()     → menambah percentage & sentimentColor
  ├─ mapSenderDTOToModel()    → generate avatarInitial dari nama
  ├─ mapActiveDateDTOToModel() → passthrough
  └─ mapActiveHourDTOToModel() → passthrough

  Update state: metrics, topics, topSenders, activeDates, activeHours
      │
      ▼ [ResultsView.vue re-render]
  Layout Dashboard:
  ┌──────────────────────────────────────────────────┐
  │ [#Total Topik] [Diversity] [C-NPMI] [Density] [Sim] │  ← MetricCard × 4
  ├──────────────────────────────────────────────────┤
  │ [ActiveDatesChart — Line Chart ─────────] [TopSenderList] │
  ├──────────────────────────────────────────────────┤
  │ [ActiveHoursChart — Bar Chart 0-23 ──────────────────] │
  ├──────────────────────────────────────────────────┤
  │ [TopicCard] [TopicCard] [TopicCard]    ← paginasi 6 per halaman
  │ [TopicCard] [TopicCard] [TopicCard]    ← PrimeVue Paginator
  └──────────────────────────────────────────────────┘

Pagination (local UI state — bukan di store):
  first = ref(0), rows = ref(6)
  paginatedTopics = store.topics.slice(first, first + rows)
```

**Error State** (jika 404 dari backend):
- `clearSessionId()` → hapus localStorage
- `router.push('/upload')` → redirect ke halaman upload

**"Analisis File Baru"**:
```
onNavigateToUpload()
→ store.dispatch(ResultsIntentCreators.navigateToUpload())
    │
    ▼ [stores/results.ts — _handleNavigateToUpload()]
  1. DELETE /api/results/{sessionId}  ← hapus data dari server
  2. clearSessionId()                 ← hapus localStorage
  3. isAnalyzed → false
  4. router.push('/upload')
```

---

### 4.5 Fitur Detail Topik & Konteks Pesan

**Halaman**: `/results/topics/:topicId`

**Trigger**: Pengguna klik `TopicCard` di dashboard

```
[ResultsView.vue]
  onTopicClick(topicId)
  → store.dispatch(ResultsIntentCreators.navigateToTopic(topicId))
      │
      ▼ router.push('/results/topics/{topicId}')

[TopicDetailView.vue]
  watch(topicId, immediate: true)
      │
      ▼ Jika store.topics kosong (refresh langsung):
        dispatch(ResultsIntentCreators.fetchOverview()) dulu
      │
      ▼ dispatch(ResultsIntentCreators.fetchTopicMessages(topicId))
          │
          ▼ [stores/results.ts — _handleFetchTopicMessages()]
        GET /api/results/{jobId}/topics/{topicId}
        Response (TopicDetailDTO):
        { topic_id, label, messages: MessageDTO[] }

        mapMessageDTOToModel():
        ├─ message_id: "msg_42" → id: 42
        ├─ timestamp: "2026-07-04 08:15:00" → timestamp: "08:15"
        └─ date: "2026-07-04"

        return Message[] (typed, no any)
          │
          ▼ topicMessages.value = result as Message[]

  Render:
  ┌─────────────────────────────────────────────────┐
  │ ← Kembali ke Dashboard                          │
  │ DETAIL KLASTER #{id}                            │
  │ {label}               {messageCount} pesan      │
  │ Kata Kunci: #kw1 #kw2 #kw3 ...                 │
  ├─────────────────────────────────────────────────┤
  │ [MessageListItem]  sender · "isi pesan" · 08:15 │
  │ [MessageListItem]  ...                          │
  └─────────────────────────────────────────────────┘

[MessageListItem.vue]
  emit 'click' (baris pesan diklik)
      │
      ▼ [TopicDetailView.vue — onMessageClick(msg)]
  1. focusedMessage = { sender, content, timestamp }
  2. modalVisible = true
  3. dispatch(ResultsIntentCreators.fetchMessageContext(`msg_${msg.id}`))
          │
          ▼ [stores/results.ts — _handleFetchMessageContext()]
        GET /api/results/{jobId}/messages/msg_{id}/context
        Response (MessageContextDTO):
        { focused_message, context_messages: (MessageDTO & { is_focused })[] }

        Map ke MessageContext[]:
        { sender, content, timestamp, isFocused }

        return MessageContext[]
  4. contextMessages.value = result as MessageContext[]

[MessageContextModal.vue]
  Tampil dialog PrimeVue:
  ├─ Pesan fokus (highlighted)
  └─ ±4 pesan sebelum/sesudahnya pada timeline asli
```

---

### 4.6 Fitur Navigasi & Access Guard

**Konfigurasi**: [`src/router/index.ts`](file:///home/usereal/Projects/Sistem Skripsi/ChatAnalisis-FE/src/router/index.ts)

```
Rute dan Aturan Akses:

  /           → HomeView          [publik]
  /about      → AboutView         [publik]

  /upload     → UploadView        [guard: jika ada session_id → redirect /results]
  beforeEnter: cek localStorage.getItem('chat_analisis_session_id')

  /results    → ResultsView       [guard: harus isAnalyzed === true]
  /results/topics/:id → TopicDetailView  [guard: harus isAnalyzed === true]
  beforeEnter: cek store.isAnalyzed (dibaca pasif, tanpa dispatch)

  /result     → redirect /results  [alias lama]
```

> [!IMPORTANT]
> Route guard **hanya membaca state** (passive observer). Guard **tidak boleh** dispatch intent. Ini menjaga agar guard tidak memiliki side-effect yang sulit dilacak.

**State `isAnalyzed` diset oleh**:
- `true` → ketika EventSource menerima `data.done` (setelah analisis selesai)
- `true` → ketika `fetchOverview()` berhasil (sesi lama dari localStorage)
- `false` → ketika `navigateToUpload()` dipanggil (reset analisis baru)
- `false` → ketika `fetchOverview()` dapat error 404 (sesi expired)

---

## 5. Kontrak Komponen (Props & Emits)

### Presentational Components — hanya terima props, tidak akses store

| Komponen | Props Utama | Emits |
|:---|:---|:---|
| `DropZone.vue` | `accept: string`, `isAnalyzing: boolean` | `select(file: File)`, `clear()` |
| `TimeRangeFilter.vue` | `modelValue: [number, number]`, `startDate`, `endDate`, `chartData`, `enabled` | `update:modelValue([n, n])` |
| `TerminalSimulator.vue` | `steps: AnalysisStep[]`, `visible: boolean` | — |
| `MetricCard.vue` | `label: string`, `value: number`, `description?: string` | — |
| `TopicCard.vue` | `topicId`, `label`, `messageCount`, `keywords?` | `click(topicId)` |
| `TopSenderList.vue` | `senders: Sender[]` | — |
| `ActiveDatesChart.vue` | `data: ActiveDate[]` | — |
| `ActiveHoursChart.vue` | `data: ActiveHour[]` | — |
| `MessageListItem.vue` | `sender`, `content`, `timestamp` | `click` |
| `MessageContextModal.vue` | `visible`, `focusedMessage`, `contextMessages` | `update:visible` |

---

## 6. Panduan Maintenance & Debugging

### Jika ingin menambah aksi baru pada upload wizard

1. **Tambah enum** di [`src/intents/upload.intents.ts`](file:///home/usereal/Projects/Sistem Skripsi/ChatAnalisis-FE/src/intents/upload.intents.ts):
   ```ts
   export const enum UploadIntent {
     MY_NEW_INTENT = 'upload/MY_NEW_INTENT',
   }
   ```
2. **Tambah payload type & creator** di file yang sama
3. **Tambah handler** di [`src/stores/upload.ts`](file:///home/usereal/Projects/Sistem Skripsi/ChatAnalisis-FE/src/stores/upload.ts) dalam fungsi `dispatch()`
4. **Dispatch dari View**: `store.dispatch(UploadIntentCreators.myNewIntent())`

---

### Jika backend mengubah struktur response API

1. **Update DTO** di [`src/types/results.ts`](file:///home/usereal/Projects/Sistem Skripsi/ChatAnalisis-FE/src/types/results.ts) (bagian `// DTOs`)
2. **Update mapper function** di [`src/stores/results.ts`](file:///home/usereal/Projects/Sistem Skripsi/ChatAnalisis-FE/src/stores/results.ts) (fungsi `mapXxxDTOToModel`)
3. Domain Model UI di `src/types/results.ts` (bagian `// Domain Models`) **tidak perlu diubah** — mapper yang menjembatani

---

### Jika state tidak terupdate seperti yang diharapkan

Urutan investigasi:
```
1. Cek apakah View sudah dispatch intent yang benar
   → grep "store.dispatch" di file View terkait

2. Cek apakah intent sudah terdaftar di switch-case dispatch()
   → buka src/stores/[nama].ts, lihat fungsi dispatch()

3. Cek apakah handler private _handleXxx() memutasi state yang tepat
   → tambah console.log sementara di awal handler

4. Cek apakah View membaca state yang benar via storeToRefs
   → pastikan nama variabel cocok dengan yang di-return store
```

---

### Melacak semua Intent yang ada

```bash
# Lihat semua intent yang bisa di-dispatch ke upload store
grep -n "UploadIntent\." src/intents/upload.intents.ts

# Lihat semua intent yang bisa di-dispatch ke results store
grep -n "ResultsIntent\." src/intents/results.intents.ts

# Cari semua tempat dispatch dipanggil di seluruh project
grep -rn "store.dispatch(" src/views/
```

---

### Menambah format baru log WhatsApp

Edit [`src/services/chatParser.ts`](file:///home/usereal/Projects/Sistem Skripsi/ChatAnalisis-FE/src/services/chatParser.ts):
1. Tambah regex baru sebagai `const`
2. Tambah fungsi `tryParseXxx(line)` → `ParsedMessage | null`
3. Daftarkan ke `parseFnMap` dalam `parsingTxtToMessages()`
4. Tambah deteksi format di `detectFormat()` dan `isTimestampLine()`

---

## 7. Panduan Pengembangan & Build

```bash
# Instalasi dependensi
npm install

# Jalankan development server
npm run dev

# Type-check seluruh codebase (tanpa emit)
npm run type-check

# Lint & format otomatis
npm run lint
npm run format

# Build untuk produksi
npm run build
```

### Variabel Environment

Buat file `.env.local` di root project:

```env
# URL backend FastAPI
VITE_API_BASE_URL=http://localhost:8000

# Untuk production via nginx reverse proxy:
# VITE_API_BASE_URL=/
```

> [!NOTE]
> Jika `VITE_API_BASE_URL=/` (relative), URL EventSource (SSE) akan otomatis dibentuk menggunakan path `/api/analysis/events/{sessionId}`.

### Docker

```bash
# Build image
docker build -t chatanalisis-fe .

# Run container (expose port 80)
docker run -p 80:80 chatanalisis-fe
```
