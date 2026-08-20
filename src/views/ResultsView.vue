<script setup lang="ts">
// src/views/ResultsView.vue
// ─── MVI: View Layer for Results Dashboard ───────────────────────────────────
//
// The View reads state from the store (via storeToRefs) and dispatches
// typed Intents in response to user interactions. No business logic here.
// ─────────────────────────────────────────────────────────────────────────────

import { ref, computed, onMounted } from 'vue'
import { useResultsStore } from '@/stores/results'
import { ResultsIntentCreators } from '@/intents/results.intents'
import MetricCard from '@/components/MetricCard.vue'
import TopicCard from '@/components/TopicCard.vue'
import TopSenderList from '@/components/TopSenderList.vue'
import ActiveDatesChart from '@/components/ActiveDatesChart.vue'
import ActiveHoursChart from '@/components/ActiveHoursChart.vue'
import Paginator from 'primevue/paginator'
import Button from 'primevue/button'

const store = useResultsStore()

// ── Intent Dispatchers ───────────────────────────────────────────────────────
onMounted(() => {
  store.dispatch(ResultsIntentCreators.fetchOverview())
})

const onTopicClick = (topicId: string | number) =>
  store.dispatch(ResultsIntentCreators.navigateToTopic(topicId))

const onNavigateToUpload = () =>
  store.dispatch(ResultsIntentCreators.navigateToUpload())

// ── Local UI state (pagination) ───────────────────────────────────────────────
// Pagination is purely UI state — it does not belong in the store model.
const first = ref(0)
const rows = ref(6)

const paginatedTopics = computed(() =>
  store.topics.slice(first.value, first.value + rows.value),
)

const showPaginator = computed(() => store.topics.length > rows.value)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- Header Section -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6"
    >
      <div class="space-y-1">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Hasil Analisis Grup WhatsApp
        </h1>
        <p class="text-sm text-muted">
          Visualisasi pemodelan topik BERTopic, evaluasi clustering BIRCH, dan keaktifan chat group.
        </p>
      </div>
      <Button
        @click="onNavigateToUpload"
        label="Analisis File Baru"
        icon="pi pi-plus"
        class="w-full sm:w-auto !px-5 !py-2.5 !text-sm !font-semibold !rounded-xl !bg-surface hover:!bg-border !border !border-border !text-ink !transition-all duration-200 cursor-pointer"
      />
    </div>

    <!-- Highlighted Top Metrics Row -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <!-- Total Topics (Highlighted Card) -->
      <div
        class="col-span-2 sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-accent/20 to-surface border border-accent/30 rounded-2xl p-5 flex flex-col justify-between space-y-2 shadow-md relative overflow-hidden"
      >
        <div
          class="absolute -right-6 -bottom-6 text-accent/10 text-7xl font-extrabold pointer-events-none select-none"
        >
          #
        </div>
        <div class="space-y-1 z-10">
          <span class="text-xs font-bold text-accent uppercase tracking-wider"
            >Topik Terdeteksi</span
          >
          <div class="text-5xl font-black text-ink">
            {{ store.totalTopics }}
          </div>
        </div>
        <p class="text-xs text-muted/90 font-light leading-relaxed z-10">
          Klaster utama percakapan grup hasil ekstraksi model.
        </p>
      </div>

      <!-- Metric Cards -->
      <MetricCard
        label="Topic Diversity"
        :value="store.metrics.topicDiversity"
        description="Persentase kata kunci unik di seluruh klaster topik (0-1)."
      />
      <MetricCard
        label="C-NPMI Coherence"
        :value="store.metrics.cnpmi"
        description="Tingkat keeratan makna semantik kata kunci dalam satu topik."
      />
      <MetricCard
        label="Embedding Density"
        :value="store.metrics.embeddingDensity"
        description="Rata-rata kerapatan jarak ruang vektor dokumen percakapan."
      />
      <MetricCard
        label="Intra-topic Sim"
        :value="store.metrics.intraTopicSimilarity"
        description="Kesamaan isi pesan yang berada di dalam klaster yang sama."
      />
    </div>

    <!-- Row 1 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Active Dates -->
      <div class="lg:col-span-2">
        <ActiveDatesChart :data="store.activeDates" />
      </div>

      <!-- Top Senders -->
      <div>
        <TopSenderList :senders="store.topSenders" />
      </div>
    </div>

    <!-- Row 2 -->
    <div class="flex justify-center mt-8">
      <div class="w-full">
        <ActiveHoursChart :data="store.activeHours" />
      </div>
    </div>

    <!-- Topics -->
    <div class="space-y-4 pt-4">
      <h2 class="text-lg font-bold text-ink flex items-center gap-2">
        <i class="pi pi-list text-accent"></i>
        Daftar Klaster Topik Obrolan
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <TopicCard
          v-for="topic in paginatedTopics"
          :key="topic.topicId"
          :topicId="topic.topicId"
          :label="topic.label"
          :messageCount="topic.messageCount"
          :keywords="topic.keywords"
          @click="onTopicClick"
        />
      </div>

      <Paginator
        v-if="showPaginator"
        v-model:first="first"
        v-model:rows="rows"
        :totalRecords="store.topics.length"
        :rowsPerPageOptions="[6, 9, 18, 27]"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        class="!bg-transparent !border-none pt-4 flex justify-center"
      />
    </div>
  </div>
</template>
