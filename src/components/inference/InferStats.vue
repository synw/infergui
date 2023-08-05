<template>
  <div>
    <div class="text-sm flex flex-row w-full 3xl:max-w-[28rem] items-center pr-4">
      <div class="text-center danger" :style="`width:${templatePercent}%`">{{ templateTokensCount }}</div>
      <div class="text-center warning" :style="`width:${promptPercent}%`">{{ promptTokensCount }}</div>
      <div class="flex-grow text-center success">{{ freeCtx }}</div>
    </div>
    <div class="h-1 primary" :style="`width:${currentPercent}%`"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { freeCtx, promptTokensCount, templateTokensCount, lmState, inferResults } from '@/state';

const promptPercent = computed(() => {
  return Math.round((promptTokensCount.value * 100) / lmState.ctx)
});
const templatePercent = computed(() => {
  return Math.round((templateTokensCount.value * 100) / lmState.ctx)
});
const basePercent = computed(() => {
  return promptPercent.value + templatePercent.value
});
const currentPercent = computed(() => {
  const tokensPercent = Math.round((inferResults.totalTokens * 100) / lmState.ctx)
  return basePercent.value + tokensPercent
})
</script>