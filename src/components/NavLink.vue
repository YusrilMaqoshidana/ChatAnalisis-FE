<script setup lang="ts">
defineProps({
  to: {
    type: [String, Object],
    required: true,
  },
})
</script>

<template>
  <RouterLink
    :to="to"
    class="px-3.5 py-2 rounded-lg text-sm font-medium text-muted hover:text-ink transition-all duration-200"
    active-class="!text-accent drop-shadow-[0_0_8px_rgba(224,167,94,0.5)]"
  >
    <slot />
  </RouterLink>
</template>
