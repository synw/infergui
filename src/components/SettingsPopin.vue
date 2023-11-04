<template>
  <div class="flex min-w-[20rem] flex-col space-y-3 overflow-y-auto">
    <div class="flex flex-row">
      <sw-switch label="Switch" v-model:value="autoMaxContext" class="switch-primary" @update:value="$emit('close')">
        <div class="ml-2">
          Auto max context
        </div>
      </sw-switch>
    </div>
    <div class="flex flex-row">
      <sw-switch label="Switch" v-model:value="cloneTemplateMode" class="switch-primary" @update:value="$emit('close')">
        <div class="ml-2">
          Clone generic templates mode
        </div>
      </sw-switch>
    </div>
  </div>
</template>

<script setup lang="ts">
import { autoMaxContext, cloneTemplateMode } from "@/state/settings";
import SwSwitch from "@snowind/switch";

const emit = defineEmits(["close"]);
</script>