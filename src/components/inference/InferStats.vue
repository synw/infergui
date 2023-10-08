<template>
  <div class="w-full 3xl:max-w-[28rem]">
    <div class="flex w-full flex-row items-center pr-4 text-sm">
      <div class="text-center danger" :style="`width:${templatePercent}%`">{{ templateTokensCount }}</div>
      <div class="text-center warning" :style="`width:${promptPercent}%`">{{ promptTokensCount }}</div>
      <div class="flex-grow text-center success">{{ freeCtx }}</div>
    </div>
    <div class="flex h-1 w-full flex-row pr-4">
      <div class="primary" :style="`width:${currentPercent}%`"></div>
      <div class="lighter" :style="`width:${remainingPercent}%`"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { freeCtx, promptTokensCount, templateTokensCount, inferResults, api } from '@/state';

const promptPercent = computed(() => {
  return Math.round((promptTokensCount.value * 100) / api.model.ctx)
});
const templatePercent = computed(() => {
  return Math.round((templateTokensCount.value * 100) / api.model.ctx)
});
const basePercent = computed(() => {
  return promptPercent.value + templatePercent.value
});
const currentPercent = computed(() => {
  const tokensPercent = Math.round((inferResults.totalTokens * 100) / api.model.ctx)
  return basePercent.value + tokensPercent
});
const remainingPercent = computed(() => 100 - currentPercent.value);
</script>