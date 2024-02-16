<template>
  <div class="w-full 3xl:max-w-[28rem] cursor-pointer" @click="toggle">
    <div class="flex w-full flex-row items-center pr-4 text-sm">
      <div class="text-center danger" :style="`width:${templatePercent}%`">{{ templateTokensCount }}</div>
      <div class="text-center warning" :style="`width:${promptPercent}%`">{{ promptTokensCount }}</div>
      <div class="flex-grow text-center success">{{ freeContext }}</div>
    </div>
    <div class="flex h-1 w-full flex-row pr-4">
      <div class="primary" :style="`width:${currentPercent}%`"></div>
      <div class="lighter" :style="`width:${remainingPercent}%`"></div>
    </div>
    <OverlayPanel ref="op">
      <div class="flex flex-col">
        <div><span class="txt-light">Template:</span> {{ templateTokensCount }}</div>
        <div><span class="txt-light">Prompt:</span> {{ promptTokensCount }}</div>
        <div><span class="txt-light">Free context:</span> {{ freeContext }}</div>
      </div>
    </OverlayPanel>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import OverlayPanel from 'primevue/overlaypanel';
import { freeContext, promptTokensCount, templateTokensCount, inferResults, totalContext } from '@/state';

const op = ref();

const toggle = (event) => {
    op.value.toggle(event);
}

const promptPercent = computed(() => {
  return Math.round((promptTokensCount.value * 100) / totalContext.value)
});
const templatePercent = computed(() => {
  return Math.round((templateTokensCount.value * 100) / totalContext.value)
});
const basePercent = computed(() => {
  return promptPercent.value + templatePercent.value
});
const currentPercent = computed(() => {
  const tokensPercent = Math.round((inferResults.totalTokens * 100) / totalContext.value)
  return basePercent.value + tokensPercent
});
const remainingPercent = computed(() => 100 - currentPercent.value);
</script>