<template>
  <div class="fixed left-0 top-16 flex h-full w-full flex-row">
    <div class="w-72 flex-shrink-0">
      <side-bars></side-bars>
    </div>
    <div class="w-full max-w-6xl flex-shrink overflow-y-auto border-x bord-lighter">
      <prompt-template></prompt-template>
    </div>
    <div class="min-w-72 flex-shrink-0 flex-grow p-3 pt-8">
      <infer-params></infer-params>
      <infer-stats :class="autoMaxContext ? 'mt-8' : 'mt-3'"></infer-stats>
      <infer-result class="mt-3"></infer-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import PromptTemplate from '@/components/inference/PromptTemplate.vue';
import InferParams from '@/components/inference/InferParams.vue';
import InferResult from '@/components/inference/InferResult.vue';
import InferStats from '@/components/inference/InferStats.vue';
import SideBars from '@/components/SideBars.vue';
import { autoMaxContext } from '@/state/settings';
</script>