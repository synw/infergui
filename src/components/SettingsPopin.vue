<template>
  <div class="flex min-w-[20rem] flex-col space-y-1 overflow-y-auto">
    <div class="flex flex-row">
      <sw-switch label="Switch" v-model:value="settings.autoMaxContext" class="switch-primary"
        @update:value="$emit('close')">
        <div class="ml-2">
          Auto max context
        </div>
      </sw-switch>
    </div>
  </div>
</template>

<script setup lang="ts">
import { settings } from "@/state";
import SwSwitch from "@snowind/switch";

const emit = defineEmits(["close"]);
</script>