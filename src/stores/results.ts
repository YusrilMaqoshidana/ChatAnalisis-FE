import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Topic {
  topicId: number
  label: string
  messageCount: number
  keywords: string[]
  percentage: number
  sentiment: string
  sentimentColor: string
}

export interface Sender {
  name: string
  messageCount: number
  avatarInitial: string
}

export interface ActiveDate {
  date: string
  count: number
}

export interface ActiveHour {
  hour: number
  count: number
}

export interface Message {
  id: number
  sender: string
  content: string
  timestamp: string
  topicId: number
  date: string
}

export const useResultsStore = defineStore('results', () => {
  // Session flag to restrict direct manual access to /results pages
  const isAnalyzed = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 1. Evaluation Metrics State
  const metrics = ref({
    topicDiversity: 0.78,
    cnpmi: 0.165,
    embeddingDensity: 0.842,
    intraTopicSimilarity: 0.712,
  })

  const topics = ref<Topic[]>([
    {
      topicId: 1,
      label: 'Tugas & Akademik',
      messageCount: 145,
      keywords: ['tugas', 'kuliah', 'laporan', 'deadline', 'dosen', 'pdf'],
      percentage: 36.2,
      sentiment: 'Positif',
      sentimentColor: 'text-[#5EC9C0] border-[#5EC9C0]/30 bg-[#5EC9C0]/10',
    },
    {
      topicId: 2,
      label: 'Jadwal & Agenda',
      messageCount: 98,
      keywords: ['jadwal', 'zoom', 'hari', 'jam', 'minggu', 'libur'],
      percentage: 24.5,
      sentiment: 'Netral',
      sentimentColor: 'text-[#8B8F9E] border-[#2C303F] bg-[#1B1E2A]/50',
    },
    {
      topicId: 3,
      label: 'Humor & Santai',
      messageCount: 75,
      keywords: ['wkwk', 'lucu', 'meme', 'gokil', 'guyon', 'ngakak'],
      percentage: 18.8,
      sentiment: 'Positif',
      sentimentColor: 'text-[#5EC9C0] border-[#5EC9C0]/30 bg-[#5EC9C0]/10',
    },
    {
      topicId: 4,
      label: 'Administrasi & Iuran',
      messageCount: 52,
      keywords: ['kas', 'iuran', 'bayar', 'transfer', 'rekening', 'bendahara'],
      percentage: 13.0,
      sentiment: 'Negatif',
      sentimentColor: 'text-red-400 border-red-500/30 bg-red-500/10',
    },
    {
      topicId: 5,
      label: 'Pengumuman & Info Penting',
      messageCount: 30,
      keywords: ['info', 'penting', 'pengumuman', 'perhatian', 'link', 'registrasi'],
      percentage: 7.5,
      sentiment: 'Netral',
      sentimentColor: 'text-[#8B8F9E] border-[#2C303F] bg-[#1B1E2A]/50',
    },
    {
      topicId: 6,
      label: 'Seminar & Webinar',
      messageCount: 27,
      keywords: ['seminar', 'webinar', 'sertifikat', 'zoom', 'speaker', 'event'],
      percentage: 6.8,
      sentiment: 'Positif',
      sentimentColor: 'text-[#5EC9C0] border-[#5EC9C0]/30 bg-[#5EC9C0]/10',
    },
    {
      topicId: 7,
      label: 'Skripsi & TA',
      messageCount: 24,
      keywords: ['skripsi', 'bab', 'bimbingan', 'proposal', 'sidang', 'revisi'],
      percentage: 6.0,
      sentiment: 'Netral',
      sentimentColor: 'text-[#8B8F9E] border-[#2C303F] bg-[#1B1E2A]/50',
    },
    {
      topicId: 8,
      label: 'Magang',
      messageCount: 22,
      keywords: ['magang', 'intern', 'perusahaan', 'cv', 'lamaran', 'hr'],
      percentage: 5.5,
      sentiment: 'Positif',
      sentimentColor: 'text-[#5EC9C0] border-[#5EC9C0]/30 bg-[#5EC9C0]/10',
    },
    {
      topicId: 9,
      label: 'Lowongan Kerja',
      messageCount: 20,
      keywords: ['kerja', 'career', 'rekrutmen', 'fresh graduate', 'job', 'vacancy'],
      percentage: 5.0,
      sentiment: 'Positif',
      sentimentColor: 'text-[#5EC9C0] border-[#5EC9C0]/30 bg-[#5EC9C0]/10',
    },
    {
      topicId: 10,
      label: 'Kegiatan Organisasi',
      messageCount: 18,
      keywords: ['rapat', 'divisi', 'kepanitiaan', 'koordinator', 'anggota', 'proker'],
      percentage: 4.5,
      sentiment: 'Netral',
      sentimentColor: 'text-[#8B8F9E] border-[#2C303F] bg-[#1B1E2A]/50',
    },
    {
      topicId: 11,
      label: 'Acara Kampus',
      messageCount: 17,
      keywords: ['kampus', 'festival', 'expo', 'dies natalis', 'lomba', 'event'],
      percentage: 4.2,
      sentiment: 'Positif',
      sentimentColor: 'text-[#5EC9C0] border-[#5EC9C0]/30 bg-[#5EC9C0]/10',
    },
    {
      topicId: 12,
      label: 'Teknologi & Pemrograman',
      messageCount: 16,
      keywords: ['python', 'vue', 'flutter', 'github', 'api', 'docker'],
      percentage: 4.0,
      sentiment: 'Positif',
      sentimentColor: 'text-[#5EC9C0] border-[#5EC9C0]/30 bg-[#5EC9C0]/10',
    },
    {
      topicId: 13,
      label: 'Diskusi Penelitian',
      messageCount: 15,
      keywords: ['bertopic', 'dataset', 'evaluasi', 'coherence', 'embedding', 'bm25'],
      percentage: 3.8,
      sentiment: 'Netral',
      sentimentColor: 'text-[#8B8F9E] border-[#2C303F] bg-[#1B1E2A]/50',
    },
    {
      topicId: 14,
      label: 'Transportasi',
      messageCount: 13,
      keywords: ['angkat', 'nebeng', 'motor', 'mobil', 'berangkat', 'parkir'],
      percentage: 3.2,
      sentiment: 'Netral',
      sentimentColor: 'text-[#8B8F9E] border-[#2C303F] bg-[#1B1E2A]/50',
    },
    {
      topicId: 15,
      label: 'Makanan & Kuliner',
      messageCount: 12,
      keywords: ['makan', 'warung', 'kopi', 'cafe', 'kuliner', 'bakso'],
      percentage: 3.0,
      sentiment: 'Positif',
      sentimentColor: 'text-[#5EC9C0] border-[#5EC9C0]/30 bg-[#5EC9C0]/10',
    },
    {
      topicId: 16,
      label: 'Olahraga',
      messageCount: 10,
      keywords: ['futsal', 'badminton', 'lari', 'gym', 'turnamen', 'latihan'],
      percentage: 2.5,
      sentiment: 'Positif',
      sentimentColor: 'text-[#5EC9C0] border-[#5EC9C0]/30 bg-[#5EC9C0]/10',
    },
    {
      topicId: 17,
      label: 'Keuangan',
      messageCount: 9,
      keywords: ['anggaran', 'invoice', 'saldo', 'transfer', 'bukti', 'pembayaran'],
      percentage: 2.2,
      sentiment: 'Negatif',
      sentimentColor: 'text-red-400 border-red-500/30 bg-red-500/10',
    },
    {
      topicId: 18,
      label: 'Lain-lain',
      messageCount: 8,
      keywords: ['random', 'chat', 'diskusi', 'sharing', 'umum', 'lainnya'],
      percentage: 2.0,
      sentiment: 'Netral',
      sentimentColor: 'text-[#8B8F9E] border-[#2C303F] bg-[#1B1E2A]/50',
    },
  ])

  const totalTopics = computed(() => topics.value.length)

  // 3. Top Senders State
  const topSenders = ref<Sender[]>([
    { name: 'Moh. Yusril Maqoshidana', messageCount: 120, avatarInitial: 'YM' },
    { name: 'Ahmad Fauzi', messageCount: 95, avatarInitial: 'AF' },
    { name: 'Siti Rahma', messageCount: 78, avatarInitial: 'SR' },
    { name: 'Budi Santoso', messageCount: 64, avatarInitial: 'BS' },
    { name: 'Diana Putri', messageCount: 43, avatarInitial: 'DP' },
  ])

  // 4. Active Dates (last 10 days)
  const activeDates = ref<ActiveDate[]>([
    { date: '25 Jun', count: 28 },
    { date: '26 Jun', count: 35 },
    { date: '27 Jun', count: 18 },
    { date: '28 Jun', count: 12 },
    { date: '29 Jun', count: 42 },
    { date: '30 Jun', count: 55 },
    { date: '01 Jul', count: 68 },
    { date: '02 Jul', count: 47 },
    { date: '03 Jul', count: 52 },
    { date: '04 Jul', count: 43 },
  ])

  // 5. Active Hours State (0-23)
  const activeHours = ref<ActiveHour[]>([
    { hour: 0, count: 5 },
    { hour: 1, count: 2 },
    { hour: 2, count: 0 },
    { hour: 3, count: 0 },
    { hour: 4, count: 1 },
    { hour: 5, count: 8 },
    { hour: 6, count: 12 },
    { hour: 7, count: 20 },
    { hour: 8, count: 35 },
    { hour: 9, count: 42 },
    { hour: 10, count: 58 },
    { hour: 11, count: 49 },
    { hour: 12, count: 30 },
    { hour: 13, count: 28 },
    { hour: 14, count: 34 },
    { hour: 15, count: 45 },
    { hour: 16, count: 38 },
    { hour: 17, count: 22 },
    { hour: 18, count: 29 },
    { hour: 19, count: 56 },
    { hour: 20, count: 64 },
    { hour: 21, count: 48 },
    { hour: 22, count: 32 },
    { hour: 23, count: 15 },
  ])

  // 6. Chronological Messages List
  const allMessages = ref<Message[]>([
    {
      id: 1,
      sender: 'Moh. Yusril Maqoshidana',
      content: 'Assalamualaikum, selamat pagi rekan-rekan.',
      timestamp: '08:00',
      topicId: 5,
      date: '2026-07-04',
    },
    {
      id: 2,
      sender: 'Budi Santoso',
      content: 'Waalaikumsalam, pagi.',
      timestamp: '08:02',
      topicId: 5,
      date: '2026-07-04',
    },
    {
      id: 3,
      sender: 'Moh. Yusril Maqoshidana',
      content: 'Hari ini jadwal kumpul laporan tugas akhir ya. Deadline nanti malam jam 23.59 WIB.',
      timestamp: '08:05',
      topicId: 1,
      date: '2026-07-04',
    },
    {
      id: 4,
      sender: 'Ahmad Fauzi',
      content: 'Waduh seriusan hari ini? Bab mana aja yang dikumpul?',
      timestamp: '08:06',
      topicId: 1,
      date: '2026-07-04',
    },
    {
      id: 5,
      sender: 'Moh. Yusril Maqoshidana',
      content: 'Dari Bab 1 sampai Bab 3. Format file PDF ya.',
      timestamp: '08:08',
      topicId: 1,
      date: '2026-07-04',
    },
    {
      id: 6,
      sender: 'Siti Rahma',
      content: 'Betul, dikirim ke link Google Drive yang dipin di deskripsi grup.',
      timestamp: '08:10',
      topicId: 1,
      date: '2026-07-04',
    },
    {
      id: 7,
      sender: 'Ahmad Fauzi',
      content: 'Siap, makasih infonya Yusril, Siti. Gas ngerjain dulu.',
      timestamp: '08:11',
      topicId: 1,
      date: '2026-07-04',
    },
    {
      id: 8,
      sender: 'Budi Santoso',
      content: 'Otw ngeprint format doc-nya dulu lah.',
      timestamp: '08:13',
      topicId: 1,
      date: '2026-07-04',
    },
    {
      id: 9,
      sender: 'Diana Putri',
      content: 'Template laporan yang benar yang ada logo kampus kan?',
      timestamp: '08:15',
      topicId: 1,
      date: '2026-07-04',
    },
    {
      id: 10,
      sender: 'Moh. Yusril Maqoshidana',
      content: 'Iya Diana, versi revisi terbaru 2026.',
      timestamp: '08:16',
      topicId: 1,
      date: '2026-07-04',
    },
    {
      id: 11,
      sender: 'Siti Rahma',
      content: 'Btw, untuk bimbingan dosen besok jam berapa ya?',
      timestamp: '08:30',
      topicId: 2,
      date: '2026-07-04',
    },
    {
      id: 12,
      sender: 'Diana Putri',
      content: 'Katanya jam 10 pagi di ruang prodi.',
      timestamp: '08:32',
      topicId: 2,
      date: '2026-07-04',
    },
    {
      id: 13,
      sender: 'Ahmad Fauzi',
      content: 'Tapi besok bukannya dosennya ada rapat jam segitu?',
      timestamp: '08:35',
      topicId: 2,
      date: '2026-07-04',
    },
    {
      id: 14,
      sender: 'Diana Putri',
      content: 'Oh iya ya? Coba nanti tanyain lagi deh.',
      timestamp: '08:37',
      topicId: 2,
      date: '2026-07-04',
    },
    {
      id: 15,
      sender: 'Budi Santoso',
      content: 'Tenang, kalau bimbingan bisa via Zoom juga kok infonya.',
      timestamp: '08:40',
      topicId: 2,
      date: '2026-07-04',
    },
    {
      id: 16,
      sender: 'Siti Rahma',
      content: 'Alhamdulillah kalau bisa Zoom, irit ongkos wkwk.',
      timestamp: '08:42',
      topicId: 3,
      date: '2026-07-04',
    },
    {
      id: 17,
      sender: 'Ahmad Fauzi',
      content: 'Wkwk bener banget Siti, tanggal tua nih.',
      timestamp: '08:43',
      topicId: 3,
      date: '2026-07-04',
    },
    {
      id: 18,
      sender: 'Budi Santoso',
      content: 'Dompet tipis setipis saringan tahu.',
      timestamp: '08:45',
      topicId: 3,
      date: '2026-07-04',
    },
    {
      id: 19,
      sender: 'Moh. Yusril Maqoshidana',
      content: 'Wkwk malah curhat. Ingat iuran kas kasir belum bayar lho.',
      timestamp: '08:48',
      topicId: 4,
      date: '2026-07-04',
    },
    {
      id: 20,
      sender: 'Diana Putri',
      content: 'Oops! Kena senggol bendahara grup.',
      timestamp: '08:50',
      topicId: 3,
      date: '2026-07-04',
    },
    {
      id: 21,
      sender: 'Ahmad Fauzi',
      content: 'Berapa kas bulan ini, sri? lupa gw.',
      timestamp: '08:52',
      topicId: 4,
      date: '2026-07-04',
    },
    {
      id: 22,
      sender: 'Siti Rahma',
      content: 'Bulan ini 20k, Ahmad. Transfer ke rekening mandiri bendahara.',
      timestamp: '08:54',
      topicId: 4,
      date: '2026-07-04',
    },
    {
      id: 23,
      sender: 'Ahmad Fauzi',
      content: 'Oke, ntar malem gw transfer barengan uang jajan cair.',
      timestamp: '08:55',
      topicId: 4,
      date: '2026-07-04',
    },
    {
      id: 24,
      sender: 'Budi Santoso',
      content: 'Duh bayar kas terus nih wkwk.',
      timestamp: '08:57',
      topicId: 4,
      date: '2026-07-04',
    },
    {
      id: 25,
      sender: 'Siti Rahma',
      content: 'Kan buat keperluan bareng Budi, contohnya buat beli kertas print.',
      timestamp: '09:00',
      topicId: 4,
      date: '2026-07-04',
    },
    {
      id: 26,
      sender: 'Budi Santoso',
      content: 'Iya iya becanda Siti, ampun galak amat wkwk.',
      timestamp: '09:02',
      topicId: 3,
      date: '2026-07-04',
    },
    {
      id: 27,
      sender: 'Moh. Yusril Maqoshidana',
      content:
        'PENGUMUMAN: Pendaftaran seminar proposal sudah dibuka. Silakan daftar di SIAKAD masing-masing.',
      timestamp: '10:00',
      topicId: 5,
      date: '2026-07-04',
    },
    {
      id: 28,
      sender: 'Diana Putri',
      content: 'Link pendaftarannya yang mana ya?',
      timestamp: '10:05',
      topicId: 5,
      date: '2026-07-04',
    },
    {
      id: 29,
      sender: 'Moh. Yusril Maqoshidana',
      content: 'Link: siakad.kampus.ac.id/sempro-2026. Jangan sampai telat ya.',
      timestamp: '10:08',
      topicId: 5,
      date: '2026-07-04',
    },
    {
      id: 30,
      sender: 'Diana Putri',
      content: 'Siap, terima kasih banyak.',
      timestamp: '10:10',
      topicId: 5,
      date: '2026-07-04',
    },
    {
      id: 31,
      sender: 'Ahmad Fauzi',
      content: 'Btw revisi judul kemarin diajuin lagi ga?',
      timestamp: '10:30',
      topicId: 1,
      date: '2026-07-04',
    },
    {
      id: 32,
      sender: 'Siti Rahma',
      content: 'Punya saya di-approve dosen pembimbing 1, tinggal tunggu pembimbing 2.',
      timestamp: '10:32',
      topicId: 1,
      date: '2026-07-04',
    },
    {
      id: 33,
      sender: 'Budi Santoso',
      content: 'Sama, punya saya disuruh ganti metode analisisnya.',
      timestamp: '10:35',
      topicId: 1,
      date: '2026-07-04',
    },
    {
      id: 34,
      sender: 'Diana Putri',
      content: 'Semangat ya gaes, kita pasti lulus bareng!',
      timestamp: '10:40',
      topicId: 1,
      date: '2026-07-04',
    },
    {
      id: 35,
      sender: 'Moh. Yusril Maqoshidana',
      content: 'Aamiin yarabbal alaamiin.',
      timestamp: '10:41',
      topicId: 1,
      date: '2026-07-04',
    },
    {
      id: 36,
      sender: 'Ahmad Fauzi',
      content: 'Dosen pembimbing saya susah dicari euy, kemana ya beliau?',
      timestamp: '11:00',
      topicId: 2,
      date: '2026-07-04',
    },
    {
      id: 37,
      sender: 'Siti Rahma',
      content: 'Katanya lagi dinas luar kota sampai hari Senin depan.',
      timestamp: '11:03',
      topicId: 2,
      date: '2026-07-04',
    },
    {
      id: 38,
      sender: 'Ahmad Fauzi',
      content: 'Walah, pantas dichat centang satu terus.',
      timestamp: '11:05',
      topicId: 2,
      date: '2026-07-04',
    },
    {
      id: 39,
      sender: 'Budi Santoso',
      content: 'Mungkin di sana ga ada sinyal, atau sibuk banget.',
      timestamp: '11:08',
      topicId: 2,
      date: '2026-07-04',
    },
    {
      id: 40,
      sender: 'Moh. Yusril Maqoshidana',
      content: 'Ditunggu aja Ahmad, nanti kalau senin ga dibales coba disamperin ke prodi.',
      timestamp: '11:10',
      topicId: 2,
      date: '2026-07-04',
    },
    {
      id: 41,
      sender: 'Ahmad Fauzi',
      content: 'Oke siap bos.',
      timestamp: '11:11',
      topicId: 2,
      date: '2026-07-04',
    },
    {
      id: 42,
      sender: 'Diana Putri',
      content: 'Eh denger-denger besok libur nasional ya?',
      timestamp: '11:15',
      topicId: 2,
      date: '2026-07-04',
    },
    {
      id: 43,
      sender: 'Siti Rahma',
      content: 'Lho iya kah? Kok saya baru tahu.',
      timestamp: '11:17',
      topicId: 2,
      date: '2026-07-04',
    },
    {
      id: 44,
      sender: 'Budi Santoso',
      content: 'Asik libur! Bisa turu seharian.',
      timestamp: '11:20',
      topicId: 3,
      date: '2026-07-04',
    },
    {
      id: 45,
      sender: 'Moh. Yusril Maqoshidana',
      content: 'Enggak, besok tetap masuk. Info liburnya hoax itu wkwk.',
      timestamp: '11:22',
      topicId: 3,
      date: '2026-07-04',
    },
    {
      id: 46,
      sender: 'Budi Santoso',
      content: 'Yah kecewa penonton, padahal udah senang.',
      timestamp: '11:24',
      topicId: 3,
      date: '2026-07-04',
    },
    {
      id: 47,
      sender: 'Diana Putri',
      content: 'Wkwkwk kasian Budi kena prank.',
      timestamp: '11:25',
      topicId: 3,
      date: '2026-07-04',
    },
    {
      id: 48,
      sender: 'Ahmad Fauzi',
      content: 'Budi emang jiwanya pengen rebahan terus.',
      timestamp: '11:28',
      topicId: 3,
      date: '2026-07-04',
    },
    {
      id: 49,
      sender: 'Budi Santoso',
      content: 'Udah bayar kas ya gaes, nih bukti transfernya.',
      timestamp: '12:00',
      topicId: 4,
      date: '2026-07-04',
    },
    {
      id: 50,
      sender: 'Moh. Yusril Maqoshidana',
      content: 'Oke, sudah masuk Budi. Makasih ya.',
      timestamp: '12:02',
      topicId: 4,
      date: '2026-07-04',
    },
    {
      id: 51,
      sender: 'Siti Rahma',
      content: 'Hebat, tumben gercep Budi wkwk.',
      timestamp: '12:05',
      topicId: 3,
      date: '2026-07-04',
    },
    {
      id: 52,
      sender: 'Budi Santoso',
      content: 'Biar ga ditagih-tagih lagi dong wkwk.',
      timestamp: '12:07',
      topicId: 3,
      date: '2026-07-04',
    },
    {
      id: 53,
      sender: 'Diana Putri',
      content: 'Saya juga sudah bayar ya Yusril, barusan ku transfer.',
      timestamp: '12:10',
      topicId: 4,
      date: '2026-07-04',
    },
    {
      id: 54,
      sender: 'Moh. Yusril Maqoshidana',
      content: 'Sip, tercatat Diana. Makasih.',
      timestamp: '12:12',
      topicId: 4,
      date: '2026-07-04',
    },
    {
      id: 55,
      sender: 'Ahmad Fauzi',
      content: 'Sisa gw berarti ya, ntar sore deh.',
      timestamp: '12:15',
      topicId: 4,
      date: '2026-07-04',
    },
  ])

  // Get messages for a specific topic
  const getTopicMessages = (topicId: number) => {
    return allMessages.value.filter((msg) => msg.topicId === topicId)
  }

  // Get message context (messages before and after the focused message in original timeline)
  const getMessageContext = (messageId: number, range = 4) => {
    const index = allMessages.value.findIndex((msg) => msg.id === messageId)
    if (index === -1) return []

    const start = Math.max(0, index - range)
    const end = Math.min(allMessages.value.length, index + range + 1)

    return allMessages.value.slice(start, end).map((msg) => ({
      sender: msg.sender,
      content: msg.content,
      timestamp: msg.timestamp,
      isFocused: msg.id === messageId,
    }))
  }

  function setAnalyzed(value: boolean) {
    isAnalyzed.value = value
  }

  // ==========================================
  // TODO: INTEGRASI BACKEND FASTAPI
  // Silakan sesuaikan kode di bawah ini jika endpoint backend FastAPI sudah siap digunakan.
  // Jangan menebak struktur data backend secara diam-diam.
  // ==========================================

  /**
   * TODO: Endpoint 1 - GET /api/results/overview
   * Mengambil ringkasan metrik evaluasi model (Topic Diversity, C-NPMI, Embedding Density, Intra-topic Similarity)
   * serta statistik keaktifan tanggal & jam obrolan grup.
   */
  async function fetchOverviewData() {
    isLoading.value = true
    error.value = null
    try {
      // Contoh pemanggilan API nyata:
      // const response = await fetch('/api/results/overview')
      // const data = await response.json()
      // metrics.value = data.metrics
      // activeDates.value = data.activeDates
      // activeHours.value = data.activeHours
      // topSenders.value = data.topSenders

      console.log('TODO: Sambungkan ke GET /api/results/overview')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      error.value = msg || 'Gagal memuat data metrik.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * TODO: Endpoint 2 - GET /api/results/topics
   * Mengambil daftar lengkap kluster topik (label, keywords, jumlah pesan, persentase, sentimen).
   */
  async function fetchTopicsData() {
    isLoading.value = true
    error.value = null
    try {
      // Contoh pemanggilan API nyata:
      // const response = await fetch('/api/results/topics')
      // const data = await response.json()
      // topics.value = data.topics

      console.log('TODO: Sambungkan ke GET /api/results/topics')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      error.value = msg || 'Gagal memuat data topik.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * TODO: Endpoint 3 - GET /api/results/messages
   * Mengambil seluruh data pesan grup WhatsApp secara kronologis (timeline asli) untuk
   * keperluan penyaringan pesan per topik dan rendering modal konteks timeline asli.
   */
  async function fetchMessagesTimeline() {
    isLoading.value = true
    error.value = null
    try {
      // Contoh pemanggilan API nyata:
      // const response = await fetch('/api/results/messages')
      // const data = await response.json()
      // allMessages.value = data.messages

      console.log('TODO: Sambungkan ke GET /api/results/messages')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      error.value = msg || 'Gagal memuat timeline pesan asli.'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    isAnalyzed,
    isLoading,
    error,
    metrics,
    topics,
    totalTopics,
    topSenders,
    activeDates,
    activeHours,
    allMessages,
    getTopicMessages,
    getMessageContext,
    setAnalyzed,
    fetchOverviewData,
    fetchTopicsData,
    fetchMessagesTimeline,
  }
})
